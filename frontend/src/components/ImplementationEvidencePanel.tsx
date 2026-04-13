import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Radio,
  TableProperties,
  Workflow
} from "lucide-react";

import type {
  AdminImplementationFlowStep,
  AdminImplementationSummary,
  AdminImplementationTableDetail
} from "@/types";

interface ImplementationEvidencePanelProps {
  summary: AdminImplementationSummary;
  anchorId?: string;
  eyebrow?: string;
  title: string;
  description: string;
}

const formatCellValue = (value: boolean | number | string | null) => {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
};

const normalizationStages = [
  {
    label: "1NF",
    title: "Atomic soil readings",
    description:
      "Measurement values are stored as one nutrient per row instead of repeating nutrient columns in the measurement event.",
    proof: "soil_measurement + measurement_result"
  },
  {
    label: "2NF",
    title: "Whole-key dependency",
    description:
      "The composite key (measurement_id, nutrient_id) determines measured_value; nutrient metadata is kept outside that table.",
    proof: "(measurement_id, nutrient_id) -> measured_value"
  },
  {
    label: "3NF",
    title: "No transitive metadata drift",
    description:
      "Units and optimal ranges depend on nutrient_id, so they live in nutrient rather than beside every recorded value.",
    proof: "nutrient_id -> unit, optimal ranges"
  }
];

const normalizationFlow = [
  {
    table: "soil_measurement",
    role: "event header",
    dependency: "measurement_id -> farm, season, date, depth"
  },
  {
    table: "measurement_result",
    role: "value bridge",
    dependency: "(measurement_id, nutrient_id) -> measured_value"
  },
  {
    table: "nutrient",
    role: "lookup catalog",
    dependency: "nutrient_id -> name, unit, optimal range"
  }
];

const functionalDependencyExamples = [
  "username -> user_id, role",
  "season_id -> carbon_sequestration",
  "sequestration_id -> carbon_verification",
  "farm_id, season_id, measurement_date, depth_cm -> measurement_id"
];

function FlowStepper({
  currentFlow,
  flowSteps,
  onSelect
}: {
  currentFlow: AdminImplementationFlowStep;
  flowSteps: AdminImplementationFlowStep[];
  onSelect: (step: number) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {flowSteps.map((step) => {
        const isActive = step.step === currentFlow.step;

        return (
          <button
            className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
              isActive
                ? "border-blue-200/30 bg-blue-300/[0.14] shadow-[0_18px_42px_rgba(44,96,172,0.18)]"
                : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]"
            }`}
            key={step.step}
            onClick={() => onSelect(step.step)}
            type="button"
          >
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
              Step {step.step}
            </p>
            <p className="mt-3 text-sm font-semibold text-white">{step.title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-blue-100/80">
              {step.subject_focus}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {step.source}
              <span className="mx-2 text-slate-500">-&gt;</span>
              {step.destination}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function TablePicker({
  currentTable,
  tables,
  onSelect
}: {
  currentTable: AdminImplementationTableDetail;
  tables: AdminImplementationTableDetail[];
  onSelect: (tableName: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {tables.map((table) => {
        const isActive = table.table_name === currentTable.table_name;

        return (
          <button
            className={`rounded-full border px-4 py-2 text-sm transition ${
              isActive
                ? "border-emerald-100/30 bg-emerald-200/10 text-white"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            }`}
            key={table.table_name}
            onClick={() => onSelect(table.table_name)}
            type="button"
          >
            {table.table_name}
          </button>
        );
      })}
    </div>
  );
}

function ImplementationEvidencePanel({
  summary,
  anchorId,
  eyebrow,
  title,
  description
}: ImplementationEvidencePanelProps) {
  const [selectedFlowStep, setSelectedFlowStep] = useState<number | null>(null);
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFlowStep && summary.cndc_flow.length > 0) {
      setSelectedFlowStep(summary.cndc_flow[0].step);
    }
  }, [selectedFlowStep, summary.cndc_flow]);

  useEffect(() => {
    if (!selectedTableName && summary.table_details.length > 0) {
      setSelectedTableName(summary.table_details[0].table_name);
    }
  }, [selectedTableName, summary.table_details]);

  const currentFlow =
    summary.cndc_flow.find((step) => step.step === selectedFlowStep) ??
    summary.cndc_flow[0];

  const currentTable =
    summary.table_details.find((table) => table.table_name === selectedTableName) ??
    summary.table_details[0];

  if (!currentFlow || !currentTable) {
    return null;
  }

  return (
    <section className="space-y-8" id={anchorId}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            {title}
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {summary.database_entities.map((entity) => (
          <div
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200"
            key={entity.table_name}
          >
            <span className="font-semibold text-white">{entity.label}</span>
            <span className="ml-2 font-mono text-slate-400">{entity.count}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6">
        <article className="surface-panel-strong overflow-hidden p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-300/15 p-3 text-blue-200">
              <Radio size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                CNDC Trace
              </p>
              <h3 className="mt-3 text-2xl font-bold text-white">
                Real network flow with endpoints, payloads, and outcomes
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                The platform exposes the communication path with its endpoints,
                payloads, and outcomes in one place.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              `ThingSpeak ${summary.thingspeak_channel_id ?? "N/A"}`,
              `Docs ${summary.docs_endpoint}`,
              `Health ${summary.health_endpoint}`,
              `${summary.api_touchpoints.length} API touchpoints`
            ].map((item) => (
              <div
                className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                End-To-End Communication Chain
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Follow the exact sender-to-receiver path used by the system. Each
                step shows who communicates, what is transmitted, and where the
                message ends up in the workflow.
              </p>

              <div className="mt-5">
                <FlowStepper
                  currentFlow={currentFlow}
                  flowSteps={summary.cndc_flow}
                  onSelect={setSelectedFlowStep}
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                CNDC Subject Specification
              </p>
              <div className="mt-4 grid gap-3">
                {summary.network_flow.map((item) => (
                  <div
                    className="flex items-start gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4"
                    key={item}
                  >
                    <CheckCircle2 className="mt-0.5 text-blue-200" size={16} />
                    <p className="text-sm leading-7 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,24,0.72),rgba(18,26,37,0.92))] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-blue-100">
                  Active Trace
                </p>
                <h4 className="mt-3 text-2xl font-bold text-white">
                  {currentFlow.title}
                </h4>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  {currentFlow.subject_focus}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                <span>{currentFlow.method}</span>
                <ArrowRight size={14} />
                <span>{currentFlow.protocol}</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Sender", currentFlow.source],
                ["Receiver", currentFlow.destination],
                ["Transport Stack", currentFlow.transport_stack],
                ["Data Format", currentFlow.data_format],
                ["Security", currentFlow.security],
                ["Endpoint", currentFlow.endpoint]
              ].map(([label, value]) => (
                <div
                  className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4"
                  key={label}
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Request Sent
                </p>
                <pre className="mt-3 overflow-x-auto rounded-[1rem] border border-white/10 bg-[#09121b] p-4 font-mono text-xs leading-7 text-slate-200">
                  {currentFlow.payload
                    ? JSON.stringify(currentFlow.payload, null, 2)
                    : "GET request without a request body"}
                </pre>
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Communication Logic
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {currentFlow.outcome}
                </p>
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Response Returned
                </p>
                <pre className="mt-3 overflow-x-auto rounded-[1rem] border border-white/10 bg-[#09121b] p-4 font-mono text-xs leading-7 text-slate-200">
                  {currentFlow.response_payload
                    ? JSON.stringify(currentFlow.response_payload, null, 2)
                    : "Response body not displayed for this step"}
                </pre>
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Persisted Tables
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentFlow.stored_tables.length > 0 ? (
                    currentFlow.stored_tables.map((tableName) => (
                      <code
                        className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 font-mono text-xs text-slate-200"
                        key={tableName}
                      >
                        {tableName}
                      </code>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">
                      External communication step before database writes.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-blue-200/15 bg-blue-300/[0.08] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-blue-100">
                Why This Counts As CNDC
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                {currentFlow.cndc_reason}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {currentFlow.evidence_points.map((point) => (
                <div
                  className="flex items-start gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4"
                  key={point}
                >
                  <CheckCircle2 className="mt-0.5 text-blue-200" size={16} />
                  <p className="text-sm leading-7 text-slate-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="surface-panel-strong overflow-hidden p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-200/10 p-3 text-emerald-100">
              <Database size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                DBMS Query Lab
              </p>
              <h3 className="mt-3 text-2xl font-bold text-white">
                Read-only table explorer with real constraints and rows
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Each tab shows the exact query being surfaced, the table schema,
                the constraint set, and the current query result sample.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-emerald-100/15 bg-[radial-gradient(circle_at_top_left,rgba(101,184,165,0.18),transparent_34%),linear-gradient(135deg,rgba(9,18,27,0.82),rgba(20,32,43,0.95))] p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-100">
                  Normalization Atlas
                </p>
                <h4 className="mt-3 text-2xl font-bold text-white">
                  From raw sensor-style rows to a clean relational shape
                </h4>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  The database avoids one wide measurement table. It separates the
                  measurement event, nutrient value, and nutrient definition so
                  functional dependencies stay visible and update anomalies stay low.
                </p>
              </div>
              <div className="rounded-full border border-emerald-100/20 bg-emerald-100/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-100">
                1NF -&gt; 2NF -&gt; 3NF
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
              <div className="grid gap-3">
                {normalizationStages.map((stage) => (
                  <div
                    className="rounded-[1.3rem] border border-white/10 bg-white/[0.05] p-4"
                    key={stage.label}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100/10 font-mono text-sm font-bold text-emerald-100">
                        {stage.label}
                      </div>
                      <div>
                        <h5 className="text-base font-semibold text-white">
                          {stage.title}
                        </h5>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {stage.description}
                        </p>
                        <code className="mt-3 inline-flex rounded-full border border-white/10 bg-[#09121b] px-3 py-1.5 font-mono text-xs text-emerald-100">
                          {stage.proof}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-3">
                  <Workflow className="text-emerald-100" size={18} />
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
                    Measurement Decomposition
                  </p>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
                  {normalizationFlow.map((item, index) => (
                    <div className="contents" key={item.table}>
                      <div className="rounded-[1.2rem] border border-white/10 bg-[#09121b]/80 p-4">
                        <p className="font-mono text-sm font-semibold text-white">
                          {item.table}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                          {item.role}
                        </p>
                        <p className="mt-4 font-mono text-xs leading-6 text-emerald-100">
                          {item.dependency}
                        </p>
                      </div>
                      {index < normalizationFlow.length - 1 ? (
                        <div className="hidden items-center px-1 text-emerald-100 lg:flex">
                          <ArrowRight size={18} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[1.2rem] border border-blue-200/15 bg-blue-300/[0.08] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-100">
                    Functional Dependency Proof Lines
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {functionalDependencyExamples.map((dependency) => (
                      <code
                        className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 font-mono text-xs text-slate-100"
                        key={dependency}
                      >
                        {dependency}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <TablePicker
              currentTable={currentTable}
              tables={summary.table_details}
              onSelect={setSelectedTableName}
            />
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,19,28,0.8),rgba(17,26,36,0.94))] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-100">
                  Selected Table
                </p>
                <h4 className="mt-3 text-2xl font-bold text-white">
                  {currentTable.label}
                </h4>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                {currentTable.row_count} rows in source table
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {currentTable.purpose}
            </p>

            <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Query Surface
              </p>
              <pre className="mt-3 overflow-x-auto rounded-[1rem] border border-white/10 bg-[#09121b] p-4 font-mono text-xs leading-7 text-emerald-100">
                {currentTable.query}
              </pre>
            </div>

            <div className="mt-5 overflow-x-auto rounded-[1.2rem] border border-white/10 bg-white/[0.04]">
              <table className="min-w-full text-left">
                <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <tr>
                    {Object.keys(currentTable.preview_rows[0] ?? {}).map((columnName) => (
                      <th className="px-4 py-3 font-medium" key={columnName}>
                        {columnName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentTable.preview_rows.length > 0 ? (
                    currentTable.preview_rows.map((row, rowIndex) => (
                      <tr
                        className="border-t border-white/10"
                        key={`${currentTable.table_name}-${rowIndex}`}
                      >
                        {Object.entries(row).map(([columnName, value]) => (
                          <td
                            className="px-4 py-3 font-mono text-sm text-slate-200"
                            key={`${columnName}-${rowIndex}`}
                          >
                            {formatCellValue(value)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-4 text-sm text-slate-400"
                        colSpan={currentTable.columns.length}
                      >
                        No rows available for this query yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <TableProperties className="text-emerald-100" size={18} />
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Columns
                  </p>
                </div>
                <div className="mt-4 grid gap-3">
                  {currentTable.columns.map((column) => (
                    <div
                      className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4"
                      key={column.name}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <code className="font-mono text-sm text-white">
                          {column.name}
                        </code>
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          {column.data_type}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {column.is_primary_key ? (
                          <span className="rounded-full border border-emerald-100/20 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-100">
                            Primary Key
                          </span>
                        ) : null}
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                          {column.nullable ? "Nullable" : "Required"}
                        </span>
                        {column.foreign_key ? (
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                            FK {column.foreign_key}
                          </span>
                        ) : null}
                        {column.default_value ? (
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                            Default {column.default_value}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <Workflow className="text-blue-200" size={18} />
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Constraints
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {currentTable.constraints.map((constraint) => (
                      <div
                        className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4"
                        key={constraint.name}
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <code className="font-mono text-sm text-white">
                            {constraint.name}
                          </code>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                            {constraint.kind}
                          </span>
                        </div>
                        <p className="mt-3 font-mono text-xs leading-6 text-slate-300">
                          {constraint.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <Database className="text-emerald-100" size={18} />
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Indexes
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {currentTable.indexes.length > 0 ? (
                      currentTable.indexes.map((index) => (
                        <div
                          className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4"
                          key={index.name}
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <code className="font-mono text-sm text-white">
                              {index.name}
                            </code>
                            {index.unique ? (
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                                Unique
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-3 font-mono text-xs leading-6 text-slate-300">
                            {index.columns.join(", ")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                        No secondary indexes defined for this table.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default ImplementationEvidencePanel;
