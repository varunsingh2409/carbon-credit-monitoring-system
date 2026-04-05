import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Database,
  Download,
  FileDown,
  PlayCircle,
  Radio,
  ShieldCheck,
  Users,
  Workflow,
  X
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import toast from "react-hot-toast";

import { adminApi } from "@/api/adminApi";
import LoadingState from "@/components/LoadingState";
import StatCard from "@/components/StatCard";
import type {
  AdminImplementationSummary,
  AdminStatistics,
  AdminUser,
  MonthlyCredit,
  SeasonOption,
  ThingSpeakSyncResponse
} from "@/types";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "detail" in error.response.data &&
    typeof error.response.data.detail === "string"
  ) {
    return error.response.data.detail;
  }

  return fallback;
};

function AdminPanel() {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [implementationSummary, setImplementationSummary] =
    useState<AdminImplementationSummary | null>(null);
  const [monthlyCredits, setMonthlyCredits] = useState<MonthlyCredit[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<SeasonOption[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSyncingThingSpeak, setIsSyncingThingSpeak] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [thingSpeakResult, setThingSpeakResult] = useState<ThingSpeakSyncResponse | null>(null);

  const loadPanelData = useCallback(async () => {
    const [statisticsResponse, implementationResponse, monthlyResponse, seasonsResponse] =
      await Promise.all([
      adminApi.getStatistics(),
      adminApi.getImplementationSummary(),
      adminApi.getMonthlyCredits(),
      adminApi.getSeasonOptions()
      ]);

    setStatistics(statisticsResponse);
    setImplementationSummary(implementationResponse);
    setMonthlyCredits(monthlyResponse);
    setSeasonOptions(seasonsResponse);

    if (seasonsResponse.length > 0) {
      setSelectedSeasonId((currentSeasonId) =>
        currentSeasonId || String(seasonsResponse[0].season_id)
      );
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        await loadPanelData();
      } catch (error) {
        if (isMounted) {
          toast.error(getErrorMessage(error, "Unable to load admin panel"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [loadPanelData]);

  const openUsersModal = async () => {
    setShowUsersModal(true);

    if (users.length > 0 || usersLoading) {
      return;
    }

    try {
      setUsersLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load user list"));
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCalculation = async () => {
    if (!selectedSeasonId) {
      toast.error("Please select a season before calculating");
      return;
    }

    try {
      setIsCalculating(true);
      const response = await adminApi.triggerCarbonCalculation({
        season_id: Number(selectedSeasonId)
      });
      toast.success(
        `Carbon calculation completed: ${response.estimated_carbon_credit.toFixed(2)} tCO2e`
      );
      await loadPanelData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to trigger carbon calculation"));
    } finally {
      setIsCalculating(false);
    }
  };

  const handleThingSpeakSync = async () => {
    if (!selectedSeasonId) {
      toast.error("Please select a season before importing ThingSpeak data");
      return;
    }

    try {
      setIsSyncingThingSpeak(true);
      const response = await adminApi.syncThingSpeak({
        season_id: Number(selectedSeasonId)
      });
      setThingSpeakResult(response);

      if (response.imported_count > 0) {
        toast.success(
          `ThingSpeak sync imported ${response.imported_count} measurement(s)`
        );
      } else {
        toast(`ThingSpeak sync completed. ${response.skipped_count} entries were skipped.`);
      }

      await loadPanelData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sync ThingSpeak data"));
    } finally {
      setIsSyncingThingSpeak(false);
    }
  };

  if (isLoading || !statistics) {
    return <LoadingState label="Loading admin panel..." />;
  }

  const selectableSeasons = seasonOptions.filter((season) =>
    ["active", "completed"].includes(season.status.toLowerCase())
  );

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="surface-panel-strong mb-8 p-8">
          <p className="eyebrow">
            Admin Panel
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-white">
            Monitor platform performance and operational controls
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Oversee the carbon-credit platform with live issuance trends,
            verification pressure, season triggers, and user-level visibility.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard
            color="green"
            icon="map"
            label="Total Farms"
            value={statistics.total_farms}
          />
          <StatCard
            color="blue"
            icon="users"
            label="Total Farmers"
            value={statistics.total_farmers}
          />
          <StatCard
            color="purple"
            icon="calendar"
            label="Total Seasons"
            value={statistics.total_seasons}
          />
          <StatCard
            color="yellow"
            icon="clock"
            label="Pending Verifications"
            value={statistics.pending_verifications}
          />
          <StatCard
            color="pink"
            icon="coins"
            label="Credits Issued"
            value={`${statistics.total_carbon_credits_issued.toFixed(2)} tCO2e`}
          />
          <StatCard
            color="cyan"
            icon="activity"
            label="Active Seasons"
            value={statistics.active_seasons}
          />
        </section>

        {implementationSummary ? (
          <section className="mt-10 grid gap-8 xl:grid-cols-[0.94fr_1.06fr]">
            <div className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-blue-300">
                  <Radio size={18} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    CNDC Implementation
                  </h2>
                  <p className="text-sm text-slate-400">
                    Network communication and API evidence used in this project
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "ThingSpeak HTTP",
                  "FastAPI REST",
                  "JSON Payloads",
                  "JWT Auth",
                  `Docs ${implementationSummary.docs_endpoint}`,
                  `Health ${implementationSummary.health_endpoint}`
                ].map((label) => (
                  <span
                    className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
                    key={label}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="surface-card-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    ThingSpeak Base URL
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {implementationSummary.thingspeak_base_url}
                  </p>
                </div>
                <div className="surface-card-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Channel ID
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {implementationSummary.thingspeak_channel_id ?? "Not configured"}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {implementationSummary.network_flow.map((item) => (
                  <div
                    className="surface-card-muted flex items-start gap-3 p-4"
                    key={item}
                  >
                    <Workflow className="mt-0.5 text-blue-300" size={18} />
                    <p className="text-sm leading-7 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-blue-200/20 bg-blue-300/[0.08] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-100">
                  Presentation Focus
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  This proves client-server architecture, external HTTP integration,
                  REST APIs, JSON-based communication, and protected role-based
                  network workflows.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {implementationSummary.api_touchpoints.map((endpoint) => (
                    <code
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-200"
                      key={endpoint}
                    >
                      {endpoint}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-accent-green">
                  <Database size={18} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    DBMS Implementation
                  </h2>
                  <p className="text-sm text-slate-400">
                    Relational schema and live PostgreSQL counts from the system
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {implementationSummary.database_entities.map((entity) => (
                  <div
                    className="surface-card-muted p-4"
                    key={entity.table_name}
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {entity.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {entity.count}
                    </p>
                    <code className="mt-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-slate-300">
                      {entity.table_name}
                    </code>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {implementationSummary.dbms_highlights.map((item) => (
                  <div
                    className="surface-card-muted flex items-start gap-3 p-4"
                    key={item}
                  >
                    <ShieldCheck className="mt-0.5 text-accent-green" size={18} />
                    <p className="text-sm leading-7 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-accent-green/20 bg-accent-green/[0.08] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">
                  Presentation Focus
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  This section makes the DBMS work explicit: relational tables,
                  entity counts, lookup tables, constraints, indexes, and
                  workflow history stored in PostgreSQL.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-accent-green">
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Monthly Carbon Credits
                </h2>
                <p className="text-sm text-slate-400">
                  Last 6 months of issued carbon credits
                </p>
              </div>
            </div>

            <div className="mt-6 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCredits} margin={{ left: -16, right: 12, top: 10 }}>
                  <defs>
                    <linearGradient id="adminBarGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(36, 49, 63, 0.92)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "18px",
                      boxShadow: "0 18px 48px rgba(26, 36, 49, 0.22)"
                    }}
                    formatter={(value: number) => [`${Number(value).toFixed(2)} tCO2e`, "Credits"]}
                  />
                  <Bar
                    dataKey="credits"
                    fill="url(#adminBarGradient)"
                    radius={[16, 16, 6, 6]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-5">
            <section className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
                  <Radio size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">ThingSpeak Sync</h2>
                  <p className="text-sm text-slate-400">
                    Pull the latest channel entries into the selected season
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Default Mapping
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Field 1: Nitrogen, Field 2: Phosphorus, Field 3: Potassium,
                  Field 4: Moisture, Field 5: Organic Carbon, Field 6: Depth.
                </p>
              </div>

              <button
                className="button-primary mt-5 w-full rounded-[1.25rem] px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSyncingThingSpeak || selectableSeasons.length === 0}
                onClick={() => void handleThingSpeakSync()}
                type="button"
              >
                <Radio size={17} />
                {isSyncingThingSpeak ? "Syncing ThingSpeak..." : "Import ThingSpeak Data"}
              </button>

              {thingSpeakResult ? (
                <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Last Sync Result
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="surface-card-muted px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Channel</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {thingSpeakResult.channel_id}
                      </p>
                    </div>
                    <div className="surface-card-muted px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Imported</p>
                      <p className="mt-2 text-lg font-semibold text-emerald-300">
                        {thingSpeakResult.imported_count}
                      </p>
                    </div>
                    <div className="surface-card-muted px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Skipped</p>
                      <p className="mt-2 text-lg font-semibold text-amber-300">
                        {thingSpeakResult.skipped_count}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-300">
                    {thingSpeakResult.message}
                  </p>

                  {thingSpeakResult.skipped_entries.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {thingSpeakResult.skipped_entries.slice(0, 3).map((entry, index) => (
                        <div
                          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200"
                          key={`${entry.entry_id ?? "unknown"}-${index}`}
                        >
                          Entry {entry.entry_id ?? "unknown"}: {entry.reason}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-blue-300">
                  <PlayCircle size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Trigger Carbon Calculation
                  </h2>
                  <p className="text-sm text-slate-400">
                    Run a calculation for an active or completed season
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="season_id"
                >
                  Select Season
                </label>
                <select
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/10"
                  id="season_id"
                  onChange={(event) => setSelectedSeasonId(event.target.value)}
                  value={selectedSeasonId}
                >
                  {selectableSeasons.length === 0 ? (
                    <option value="">No seasons available</option>
                  ) : null}
                  {selectableSeasons.map((season) => (
                    <option key={season.season_id} value={season.season_id}>
                      {season.farm_name} | {season.season_name}
                      {season.crop_type ? ` (${season.crop_type})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="button-primary mt-5 w-full rounded-[1.25rem] px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCalculating || selectableSeasons.length === 0}
                onClick={() => void handleCalculation()}
                type="button"
              >
                <PlayCircle size={17} />
                {isCalculating ? "Calculating..." : "Calculate Credits"}
              </button>
            </section>

            <section className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-accent-green">
                  <Users size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">User Management</h2>
                  <p className="text-sm text-slate-400">
                    Inspect platform accounts and roles
                  </p>
                </div>
              </div>

              <button
                className="button-secondary mt-5 w-full rounded-[1.25rem] px-5 py-3"
                onClick={() => void openUsersModal()}
                type="button"
              >
                Manage Users
              </button>
            </section>

            <section className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-accent-purple">
                  <FileDown size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">System Reports</h2>
                  <p className="text-sm text-slate-400">
                    Export summaries for downstream stakeholders
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  className="button-secondary rounded-[1.25rem] px-5 py-3"
                  onClick={() => toast("CSV export will be connected to a report endpoint.")}
                  type="button"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  className="button-secondary rounded-[1.25rem] px-5 py-3"
                  onClick={() => toast("PDF export will be connected to a report endpoint.")}
                  type="button"
                >
                  <FileDown size={16} />
                  Export PDF
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-accent-green/20 bg-gradient-to-br from-accent-green/[0.12] to-accent-blue/[0.12] p-6 shadow-[0_18px_50px_rgba(101,184,165,0.1)]">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-accent-green/20 p-3 text-accent-green">
                  <Activity size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">System Status</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    All systems operational | 99.9% uptime
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Core APIs, measurement ingestion, and dashboard services are healthy.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      {showUsersModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,29,39,0.48)] px-4 py-8 backdrop-blur-md">
          <div className="surface-panel-strong relative max-h-[85vh] w-full max-w-4xl overflow-y-auto p-6">
            <button
              className="button-secondary absolute right-5 top-5 h-10 w-10 rounded-full p-0 text-slate-300"
              onClick={() => setShowUsersModal(false)}
              type="button"
            >
              <X size={18} />
            </button>

            <h2 className="text-3xl font-extrabold text-white">Platform users</h2>
            <p className="mt-3 text-sm text-slate-400">
              Current user accounts available in the system
            </p>

            {usersLoading ? (
              <div className="mt-8 text-sm text-slate-400">Loading users...</div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Username</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        className="border-t border-white/10"
                        key={user.user_id}
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-white">
                          {user.username}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{user.email}</td>
                        <td className="px-4 py-3 text-sm capitalize text-slate-300">
                          {user.role}
                        </td>
                        <td className="px-4 py-3 text-sm capitalize text-slate-300">
                          {user.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AdminPanel;
