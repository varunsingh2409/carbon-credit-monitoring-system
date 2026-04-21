import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  PlayCircle,
  Radio
} from "lucide-react";
import toast from "react-hot-toast";

import { adminApi } from "@/api/adminApi";
import ImplementationEvidencePanel from "@/components/ImplementationEvidencePanel";
import LoadingState from "@/components/LoadingState";
import StatCard from "@/components/StatCard";
import type {
  AdminImplementationSummary,
  AdminStatistics,
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

const thingSpeakFieldMappings = [
  { field: "field1", label: "Nitrogen", sample: "31.8-36.9 ppm" },
  { field: "field2", label: "Phosphorus", sample: "18.4-22.4 ppm" },
  { field: "field3", label: "Potassium", sample: "142.6-153.1 ppm" },
  { field: "field4", label: "Moisture", sample: "24.3-27.8 %" },
  { field: "field5", label: "Organic_Carbon", sample: "1098-1149 kg/ha" },
  { field: "field6", label: "depth_cm", sample: "10 cm" }
];

const sentThingSpeakRows = [
  { row: 1, organicCarbon: 1098, depth: 10 },
  { row: 2, organicCarbon: 1110, depth: 10 },
  { row: 3, organicCarbon: 1124, depth: 10 },
  { row: 4, organicCarbon: 1136, depth: 10 },
  { row: 5, organicCarbon: 1149, depth: 10 }
];

const nutrientFieldCount = thingSpeakFieldMappings.filter(
  (mapping) => mapping.field !== "field6"
).length;

const evaluationWorkflow = [
  "Run the ThingSpeak batch sender from the backend terminal.",
  "Import the latest channel entries into the selected season.",
  "Verify inserted soil_measurement and measurement_result rows in DBMS evidence.",
  "Trigger the carbon calculation to create a verifier-ready claim.",
  "Open verifier workflow and approve or reject the stored claim."
];

function AdminPanel() {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [implementationSummary, setImplementationSummary] =
    useState<AdminImplementationSummary | null>(null);
  const [seasonOptions, setSeasonOptions] = useState<SeasonOption[]>([]);
  const [selectedImportSeasonId, setSelectedImportSeasonId] = useState("");
  const [selectedCalculationSeasonId, setSelectedCalculationSeasonId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSyncingThingSpeak, setIsSyncingThingSpeak] = useState(false);
  const [thingSpeakResult, setThingSpeakResult] = useState<ThingSpeakSyncResponse | null>(null);

  const importableSeasons = seasonOptions.filter(
    (season) => season.status.toLowerCase() === "active"
  );
  const calculationSeasons = seasonOptions.filter((season) =>
    ["active", "completed"].includes(season.status.toLowerCase())
  );

  const loadPanelData = useCallback(async () => {
    const [statisticsResponse, implementationResponse, seasonsResponse] =
      await Promise.all([
        adminApi.getStatistics(),
        adminApi.getImplementationSummary(),
        adminApi.getSeasonOptions()
      ]);

    setStatistics(statisticsResponse);
    setImplementationSummary(implementationResponse);
    setSeasonOptions(seasonsResponse);
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

  useEffect(() => {
    setSelectedImportSeasonId((currentSeasonId) => {
      if (
        currentSeasonId &&
        importableSeasons.some((season) => String(season.season_id) === currentSeasonId)
      ) {
        return currentSeasonId;
      }

      return importableSeasons.length > 0 ? String(importableSeasons[0].season_id) : "";
    });
  }, [importableSeasons]);

  useEffect(() => {
    setSelectedCalculationSeasonId((currentSeasonId) => {
      if (
        currentSeasonId &&
        calculationSeasons.some((season) => String(season.season_id) === currentSeasonId)
      ) {
        return currentSeasonId;
      }

      return calculationSeasons.length > 0 ? String(calculationSeasons[0].season_id) : "";
    });
  }, [calculationSeasons]);

  const handleCalculation = async () => {
    if (!selectedCalculationSeasonId) {
      toast.error("Please select a season before calculating");
      return;
    }

    try {
      setIsCalculating(true);
      const response = await adminApi.triggerCarbonCalculation({
        season_id: Number(selectedCalculationSeasonId)
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
    if (!selectedImportSeasonId) {
      toast.error(
        "ThingSpeak import works only for active seasons. Reset the demo or reopen an active season first."
      );
      return;
    }

    try {
      setIsSyncingThingSpeak(true);
      const response = await adminApi.syncThingSpeak({
        season_id: Number(selectedImportSeasonId)
      });
      setThingSpeakResult(response);
      setSelectedCalculationSeasonId(selectedImportSeasonId);

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

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="surface-panel-strong mb-8 p-8">
          <p className="eyebrow">
            Admin Panel
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-white">
            DBMS and CNDC demonstration control
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            This page presents data sent to ThingSpeak, data received into
            PostgreSQL, and the carbon claim created for verifier review.
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

        <section className="mt-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-red-100">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Presentation Workflow
                </h2>
                <p className="text-sm text-slate-400">
                  Five-step evidence path for data movement and database population.
                </p>
              </div>
            </div>

            <ol className="mt-6 space-y-3">
              {evaluationWorkflow.map((step, index) => (
                <li
                  className="flex gap-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4"
                  key={step}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-100/20 bg-red-200/10 text-sm font-bold text-red-100">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-200">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-[1.25rem] border border-red-100/15 bg-red-300/[0.06] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-red-100">
                Demonstration Evidence
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                The system is not explaining design progress here. It is exposing
                the final data path: external channel entry, backend import,
                normalized relational storage, calculation, and verifier decision.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <section className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-red-100">
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
                <div className="mt-3 grid gap-2">
                  {thingSpeakFieldMappings.map((mapping) => (
                    <div
                      className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                      key={mapping.field}
                    >
                      <span className="font-mono text-xs text-red-100">
                        {mapping.field} -&gt; {mapping.label}
                      </span>
                      <span className="text-xs text-slate-400">{mapping.sample}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-[1.25rem] border border-red-100/15 bg-red-200/[0.07] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-red-100">
                    Sent To ThingSpeak
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    The demo sender posts 5 channel entries, one every 16 seconds,
                    with Organic Carbon and depth visible in the terminal.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sentThingSpeakRows.map((row) => (
                      <span
                        className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 font-mono text-[11px] text-slate-100"
                        key={row.row}
                      >
                        row {row.row}: OC {row.organicCarbon} kg/ha, depth {row.depth} cm
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-red-100/15 bg-red-300/[0.07] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-red-100">
                    Received By Backend
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Import reads the latest 5 ThingSpeak entries, maps fields to
                    nutrients, and stores normalized PostgreSQL rows.
                  </p>
                  <div className="mt-3 grid gap-2 text-xs text-slate-300">
                    <span>Expected new `soil_measurement` rows: up to 5</span>
                    <span>
                      Expected new `measurement_result` rows: up to {sentThingSpeakRows.length * nutrientFieldCount}
                    </span>
                    <span>Duplicate channel entries are shown as skipped, not hidden.</span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="import_season_id"
                >
                  Select Active Season For Import
                </label>
                <select
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/10"
                  id="import_season_id"
                  onChange={(event) => setSelectedImportSeasonId(event.target.value)}
                  value={selectedImportSeasonId}
                >
                  {importableSeasons.length === 0 ? (
                    <option value="">No active season available</option>
                  ) : null}
                  {importableSeasons.map((season) => (
                    <option key={season.season_id} value={season.season_id}>
                      {season.farm_name} | {season.season_name}
                      {season.crop_type ? ` (${season.crop_type})` : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  ThingSpeak import is allowed only for active seasons. After you calculate
                  credits, this season becomes completed, so rerun the demo seed if you need a
                  fresh import cycle.
                </p>
              </div>

              <button
                className="button-primary mt-5 w-full rounded-[1.25rem] px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSyncingThingSpeak || importableSeasons.length === 0}
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
                      <p className="mt-2 text-lg font-semibold text-red-100">
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

                  <div className="mt-4 rounded-2xl border border-red-100/15 bg-red-200/[0.06] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-red-100">
                      Database Population Verification
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      This sync can add {thingSpeakResult.imported_count} `soil_measurement`
                      row(s) and up to {thingSpeakResult.imported_count * nutrientFieldCount}
                      `measurement_result` row(s). Open the DBMS Query Lab and compare
                      those table counts after import.
                    </p>
                    {thingSpeakResult.imported_measurement_ids.length > 0 ? (
                      <p className="mt-2 break-words font-mono text-xs text-slate-200">
                        Stored measurement IDs: {thingSpeakResult.imported_measurement_ids.join(", ")}
                      </p>
                    ) : null}
                  </div>

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
                <div className="rounded-2xl bg-white/10 p-3 text-red-100">
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
                  htmlFor="calculation_season_id"
                >
                  Select Season For Calculation
                </label>
                <select
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/10"
                  id="calculation_season_id"
                  onChange={(event) => setSelectedCalculationSeasonId(event.target.value)}
                  value={selectedCalculationSeasonId}
                >
                  {calculationSeasons.length === 0 ? (
                    <option value="">No seasons available</option>
                  ) : null}
                  {calculationSeasons.map((season) => (
                    <option key={season.season_id} value={season.season_id}>
                      {season.farm_name} | {season.season_name}
                      {season.crop_type ? ` (${season.crop_type})` : ""} [{season.status}]
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="button-primary mt-5 w-full rounded-[1.25rem] px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCalculating || calculationSeasons.length === 0}
                onClick={() => void handleCalculation()}
                type="button"
              >
                <PlayCircle size={17} />
                {isCalculating ? "Calculating..." : "Calculate Credits"}
              </button>
            </section>
          </div>
        </section>

        {implementationSummary ? (
          <section className="mt-10">
            <ImplementationEvidencePanel
              description="The evidence panel shows exact tables, row counts, constraints, indexes, CNDC flow, and downloadable SQL artifacts after the live import."
              eyebrow="Database and Network Evidence"
              summary={implementationSummary}
              title="Final implementation proof"
            />
          </section>
        ) : null}
      </main>
  );
}

export default AdminPanel;
