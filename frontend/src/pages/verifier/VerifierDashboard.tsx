import { startTransition, useEffect, useState } from "react";
import { ArrowUpDown, ArrowRight, CalendarDays, MapPinned } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { verifierApi } from "@/api/verifierApi";
import LoadingState from "@/components/LoadingState";
import StatusBadge from "@/components/StatusBadge";
import type {
  PendingVerification,
  StatusBadgeValue,
  VerificationHistoryItem
} from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const formatDate = (value: string) => dateFormatter.format(new Date(value));

const verificationWorkflow = [
  ["Source", "ThingSpeak measurements already imported into PostgreSQL"],
  ["Claim", "carbon_sequestration row calculated for one farm season"],
  ["Decision", "Verifier writes approval or rejection into carbon_verification"]
];

const normalizeStatus = (status: string): StatusBadgeValue => {
  switch (status.toLowerCase()) {
    case "approved":
    case "verified":
      return "verified";
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
};

function VerifierDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [pendingItems, setPendingItems] = useState<PendingVerification[]>([]);
  const [historyItems, setHistoryItems] = useState<VerificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [pendingResponse, historyResponse] = await Promise.all([
          verifierApi.getPendingVerifications(),
          verifierApi.getVerificationHistory()
        ]);

        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setPendingItems(pendingResponse);
          setHistoryItems(historyResponse);
        });
      } catch (error) {
        if (isMounted) {
          toast.error("Unable to load verifier workflow");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingState label="Loading verifier dashboard..." />;
  }

  const sortedHistory = [...historyItems].sort((left, right) => {
    const delta =
      new Date(left.calculation_date).getTime() -
      new Date(right.calculation_date).getTime();
    return sortDirection === "asc" ? delta : -delta;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="surface-panel-strong mb-8 p-8">
        <p className="eyebrow">
          Verifier Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-white">
          Verify carbon claims created from database evidence
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          This page receives calculated claims from the same database populated
          by ThingSpeak import. Open a claim to inspect measurements, formula,
          and then store an approval or rejection.
        </p>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        {verificationWorkflow.map(([title, description]) => (
          <div className="surface-card-muted p-5" key={title}>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">{title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </div>
        ))}
      </section>

      <section className="mb-8 flex flex-wrap gap-3 rounded-full border border-white/10 bg-white/10 p-2">
        <button
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "pending"
              ? "bg-white/15 text-white"
              : "text-slate-100 hover:bg-white/10"
          }`}
          onClick={() => setActiveTab("pending")}
          type="button"
        >
          Pending ({pendingItems.length})
        </button>
        <button
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "history"
              ? "bg-white/15 text-white"
              : "text-slate-100 hover:bg-white/10"
          }`}
          onClick={() => setActiveTab("history")}
          type="button"
        >
          History
        </button>
      </section>

      {activeTab === "pending" ? (
        <section className="space-y-5">
          {pendingItems.length === 0 ? (
            <div className="surface-panel p-8 text-center text-slate-400">
              No pending verifications are waiting right now.
            </div>
          ) : (
            pendingItems.map((item) => (
              <article className="surface-panel card-hover p-6" key={item.sequestration_id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">{item.farm_name}</h2>
                      <StatusBadge status="pending" />
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                      <p>Farmer: {item.farmer_name}</p>
                      <p>Season: {item.season_name}</p>
                      <p>Measurement rows: {item.measurement_count}</p>
                      <p className="inline-flex items-center gap-2">
                        <MapPinned size={15} className="text-accent-green" />
                        {item.location}
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <CalendarDays size={15} className="text-blue-300" />
                        Calculated {formatDate(item.calculation_date)}
                      </p>
                    </div>
                  </div>

                  <button
                    className="button-primary px-5 py-3"
                    onClick={() =>
                      navigate(`/verifier/verification/${item.sequestration_id}`)
                    }
                    type="button"
                  >
                    Review Details
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <div className="surface-card-muted p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Net Carbon Increase
                    </p>
                    <p className="mt-2 text-xl font-bold text-blue-300">
                      {item.net_carbon_increase.toFixed(2)}
                    </p>
                  </div>
                  <div className="surface-card-muted p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Estimated Credit
                    </p>
                    <p className="mt-2 text-xl font-bold text-accent-purple">
                      {item.estimated_carbon_credit.toFixed(2)} tCO2e
                    </p>
                  </div>
                  <div className="surface-card-muted p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Measurements
                    </p>
                    <p className="mt-2 text-xl font-bold text-white">
                      {item.measurement_count}
                    </p>
                  </div>
                  <div className="surface-card-muted p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Baseline Carbon
                    </p>
                    <p className="mt-2 text-xl font-bold text-white">
                      {item.baseline_carbon.toFixed(2)}
                    </p>
                  </div>
                  <div className="surface-card-muted p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Current Carbon
                    </p>
                    <p className="mt-2 text-xl font-bold text-accent-green">
                      {item.current_carbon.toFixed(2)}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      ) : (
        <section className="surface-panel overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Verification history</h2>
              <p className="mt-1 text-sm text-slate-400">
                Completed approval and rejection outcomes
              </p>
            </div>
            <button
              className="button-secondary px-4 py-2"
              onClick={() =>
                setSortDirection((current) => (current === "desc" ? "asc" : "desc"))
              }
              type="button"
            >
              <ArrowUpDown size={16} />
              Sort by date
            </button>
          </div>

          {sortedHistory.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-400">
              History will appear after completed verification decisions are available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Farm</th>
                    <th className="px-6 py-4 font-medium">Farmer</th>
                    <th className="px-6 py-4 font-medium">Season</th>
                    <th className="px-6 py-4 font-medium">Credit</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((item) => (
                    <tr
                      className="border-t border-white/10 transition hover:bg-white/[0.04]"
                      key={item.sequestration_id}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {item.farm_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {item.farmer_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {item.season_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-accent-purple">
                        {item.approved_or_estimated_credit.toFixed(2)} tCO2e
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={normalizeStatus(item.status)} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatDate(item.calculation_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default VerifierDashboard;
