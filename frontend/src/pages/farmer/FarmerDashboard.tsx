import { startTransition, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import toast from "react-hot-toast";

import { farmerApi } from "@/api/farmerApi";
import LoadingState from "@/components/LoadingState";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import type {
  FarmerDashboardResponse,
  FarmerSeasonDashboard,
  StatusBadgeValue
} from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

const formatDate = (value: string) => dateFormatter.format(new Date(value));
const formatDateTime = (value: string) => dateTimeFormatter.format(new Date(value));

const normalizeVerificationStatus = (status: string): StatusBadgeValue => {
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

const getSeasonCardTone = (status: FarmerSeasonDashboard["status"]) => {
  switch (status) {
    case "active":
      return "border-blue-200/20 bg-blue-300/[0.08]";
    case "completed":
      return "border-cyan-200/20 bg-cyan-300/[0.08]";
    case "verified":
      return "border-accent-green/25 bg-accent-green/[0.08]";
    case "rejected":
      return "border-rose-200/20 bg-rose-300/[0.08]";
    default:
      return "border-white/10 bg-white/10";
  }
};

function FarmerDashboard() {
  const [dashboard, setDashboard] = useState<FarmerDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFarmIds, setExpandedFarmIds] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await farmerApi.getDashboard();
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setDashboard(response);
          setExpandedFarmIds(response.farms.map((farm) => farm.farm_id));
        });
      } catch (error) {
        if (isMounted) {
          toast.error("Unable to load farmer dashboard");
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
    return <LoadingState label="Loading farmer dashboard..." />;
  }

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="surface-panel p-8 text-center">
          <h1 className="text-3xl font-extrabold">Dashboard unavailable</h1>
          <p className="mt-4 text-slate-400">
            We could not fetch the farmer dashboard right now. Please try again
            after the backend is running and the account has farm data.
          </p>
        </div>
      </div>
    );
  }

  const chartData = dashboard.farms
    .flatMap((farm) =>
      farm.seasons
        .filter((season) => season.carbon_data)
        .map((season) => ({
          seasonId: season.season_id,
          label: season.season_name,
          fullLabel: `${farm.farm_name} - ${season.season_name}`,
          baseline: season.carbon_data?.baseline_carbon ?? 0,
          current: season.carbon_data?.current_carbon ?? 0,
          increase: season.carbon_data?.net_increase ?? 0,
          estimatedCredit: season.carbon_data?.estimated_credit ?? 0,
          sortDate: new Date(season.start_date).getTime()
        }))
    )
    .sort((left, right) => left.sortDate - right.sortDate);

  const baselineAverage =
    chartData.length > 0
      ? chartData.reduce((sum, item) => sum + item.baseline, 0) / chartData.length
      : 0;
  const currentAverage =
    chartData.length > 0
      ? chartData.reduce((sum, item) => sum + item.current, 0) / chartData.length
      : 0;
  const totalIncrease = chartData.reduce((sum, item) => sum + item.increase, 0);

  const toggleFarm = (farmId: number) => {
    setExpandedFarmIds((current) =>
      current.includes(farmId)
        ? current.filter((id) => id !== farmId)
        : [...current, farmId]
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="surface-panel-strong mb-10 overflow-hidden p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">
              Farmer Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-extrabold">
              Track soil carbon performance across every season
            </h1>
            <p className="mt-4 max-w-3xl text-slate-300">
              Farmer profile #{dashboard.farmer_id} with season-level carbon
              performance, live field measurements, and verification progress in
              one operational dashboard.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="surface-card-muted px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Portfolio</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {dashboard.stats.totalFarms} farms
              </p>
            </div>
            <div className="surface-card-muted px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Open Work</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {dashboard.stats.pendingVerifications} pending
              </p>
            </div>
            <div className="surface-card-muted px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Credits</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {dashboard.stats.totalCredits.toFixed(2)} tCO2e
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          color="green"
          icon="map"
          label="Total Farms"
          trend="Registered farm holdings"
          value={dashboard.stats.totalFarms}
        />
        <StatCard
          color="blue"
          icon="calendar"
          label="Active Seasons"
          trend="Open seasons collecting field data"
          value={dashboard.stats.activeSeasons}
        />
        <StatCard
          color="yellow"
          icon="clock"
          label="Pending Verifications"
          trend="Calculated reports awaiting review"
          value={dashboard.stats.pendingVerifications}
        />
        <StatCard
          color="purple"
          icon="award"
          label="Total Carbon Credits"
          trend={`${chartData.length} calculated season records`}
          value={`${dashboard.stats.totalCredits.toFixed(2)} tCO2e`}
        />
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {dashboard.farms.map((farm) => {
            const isExpanded = expandedFarmIds.includes(farm.farm_id);

            return (
              <article className="surface-panel relative overflow-hidden p-6" key={farm.farm_id}>
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-accent-green/10 via-blue-400/10 to-transparent blur-2xl" />
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{farm.farm_name}</h2>
                    <p className="mt-2 text-slate-400">{farm.location}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                      <span className="rounded-full border border-white/10 px-4 py-2">
                        {farm.total_area_hectares.toFixed(2)} ha
                      </span>
                      <span className="rounded-full border border-white/10 px-4 py-2">
                        Soil: {farm.soil_type ?? "Not specified"}
                      </span>
                      <span className="rounded-full border border-white/10 px-4 py-2">
                        Baseline carbon: {farm.baseline_carbon.toFixed(2)} kg/ha
                      </span>
                    </div>
                  </div>

                  <button
                    className="button-secondary px-4 py-2"
                    onClick={() => toggleFarm(farm.farm_id)}
                    type="button"
                  >
                    {isExpanded ? (
                      <>
                        Collapse seasons
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        Expand seasons
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>

                {isExpanded ? (
                  <div className="mt-6 space-y-4">
                    {farm.seasons.map((season) => (
                      <div
                        className={`rounded-[1.6rem] border p-5 shadow-[0_14px_34px_rgba(4,9,20,0.18)] ${getSeasonCardTone(
                          season.status
                        )}`}
                        key={season.season_id}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {season.season_name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {season.crop_type ?? "Mixed crop"} |{" "}
                              {formatDate(season.start_date)} to{" "}
                              {formatDate(season.end_date)}
                            </p>
                          </div>
                          <StatusBadge status={season.status} />
                        </div>

                        {season.carbon_data ? (
                          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div className="surface-card-muted p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                Baseline Carbon
                              </p>
                              <p className="mt-2 text-xl font-bold text-white">
                                {season.carbon_data.baseline_carbon.toFixed(2)}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-accent-green/20 bg-accent-green/[0.06] p-4 shadow-[0_12px_28px_rgba(34,197,94,0.08)]">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                Current Carbon
                              </p>
                              <p className="mt-2 text-xl font-bold text-accent-green">
                                {season.carbon_data.current_carbon.toFixed(2)}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] p-4 shadow-[0_12px_28px_rgba(59,130,246,0.08)]">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                Net Increase
                              </p>
                              <p className="mt-2 text-xl font-bold text-blue-300">
                                {season.carbon_data.net_increase.toFixed(2)}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-accent-purple/20 bg-accent-purple/[0.06] p-4 shadow-[0_12px_28px_rgba(139,92,246,0.08)]">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                Estimated Credits
                              </p>
                              <p className="mt-2 text-xl font-bold text-accent-purple">
                                {season.carbon_data.estimated_credit.toFixed(2)}
                              </p>
                              <div className="mt-3">
                                <StatusBadge
                                  size="sm"
                                  status={normalizeVerificationStatus(
                                    season.carbon_data.verification_status
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-5 text-sm text-slate-400">
                            Carbon data will appear here once this season has
                            enough validated organic-carbon measurements.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <aside className="surface-panel p-6">
          <div className="flex flex-col gap-2">
            <p className="eyebrow">
              Carbon Trend
            </p>
            <h2 className="text-2xl font-bold text-white">
              Sequestration over time
            </h2>
            <p className="text-sm leading-7 text-slate-400">
              Compare baseline and current carbon values across measured seasons.
            </p>
          </div>

          <div className="mt-6 h-[320px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -16, right: 10, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="carbonTrendGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.42} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(36, 49, 63, 0.92)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "18px",
                      boxShadow: "0 18px 48px rgba(26, 36, 49, 0.22)"
                    }}
                    formatter={(value: number, name: string) => [
                      `${Number(value).toFixed(2)} kg/ha`,
                      name === "current" ? "Current carbon" : "Baseline carbon"
                    ]}
                    labelFormatter={(value) =>
                      chartData.find((item) => item.label === value)?.fullLabel ?? String(value)
                    }
                  />
                  <Area
                    dataKey="current"
                    fill="url(#carbonTrendGradient)"
                    stroke="#22c55e"
                    strokeWidth={3}
                    type="monotone"
                  />
                  <Line
                    dataKey="baseline"
                    dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                    stroke="#60a5fa"
                    strokeDasharray="6 6"
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[1.6rem] border border-dashed border-white/10 bg-white/10 p-6 text-center text-sm leading-7 text-slate-300/80">
                Carbon trend data will populate here after completed seasons have
                carbon sequestration records.
              </div>
            )}
          </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="surface-card-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Baseline Avg
              </p>
              <p className="mt-2 text-xl font-bold text-white">
                {baselineAverage.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-accent-green/20 bg-accent-green/[0.06] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Current Avg
              </p>
              <p className="mt-2 text-xl font-bold text-accent-green">
                {currentAverage.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Total Increase
              </p>
              <p className="mt-2 text-xl font-bold text-blue-300">
                {totalIncrease.toFixed(2)}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-10">
        <div className="surface-panel overflow-hidden">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="eyebrow">
              Recent Measurements
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Last 10 soil measurement events
            </h2>
          </div>

          {dashboard.recentMeasurements.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-400">
              No measurement records are available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Farm</th>
                    <th className="px-6 py-4 font-medium">Depth</th>
                    <th className="px-6 py-4 font-medium">Organic Carbon</th>
                    <th className="px-6 py-4 font-medium">Nitrogen</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentMeasurements.map((measurement, index) => (
                    <tr
                      className="border-t border-white/10 transition hover:bg-white/[0.04]"
                      key={`${measurement.date}-${index}`}
                    >
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {formatDateTime(measurement.date)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {measurement.farm}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {measurement.depth.toFixed(2)} cm
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-accent-green">
                        {measurement.organicCarbon?.toFixed(2) ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {measurement.nitrogen?.toFixed(2) ?? "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default FarmerDashboard;
