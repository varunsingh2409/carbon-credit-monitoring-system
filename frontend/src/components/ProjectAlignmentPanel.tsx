import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileText,
  Radio,
  ShieldCheck
} from "lucide-react";

import type { AdminImplementationSummary } from "@/types";

interface ProjectAlignmentPanelProps {
  summary: AdminImplementationSummary;
  anchorId?: string;
  eyebrow?: string;
  title: string;
  description: string;
  showImplementationArtifacts?: boolean;
}

const formatMetric = (value: number) => {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
};

function ProjectAlignmentPanel({
  summary,
  anchorId,
  eyebrow,
  title,
  description,
  showImplementationArtifacts = false
}: ProjectAlignmentPanelProps) {
  const topCorrelation = summary.inferential_summary.correlations[0] ?? null;
  const { confidence_interval: confidenceInterval, hypothesis_test: hypothesisTest, regression } =
    summary.inferential_summary;

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Dataset Rows",
            value: summary.inferential_summary.dataset_rows,
            icon: BarChart3
          },
          {
            label: "Seasons Compared",
            value: summary.inferential_summary.season_count,
            icon: Database
          },
          {
            label: "Top Correlation",
            value: topCorrelation
              ? `${topCorrelation.nutrient_name} ${topCorrelation.coefficient}`
              : "N/A",
            icon: Radio
          },
          {
            label: "Report Status",
            value: summary.certification_report.readiness,
            icon: FileText
          }
        ].map(({ label, value, icon: Icon }) => (
          <div
            className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5"
            key={label}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/[0.08] p-3 text-slate-100">
                <Icon size={18} />
              </div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                {label}
              </p>
            </div>
            <p className="mt-4 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <article className="surface-panel-strong overflow-hidden p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-200/10 p-3 text-emerald-100">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Supporting Analytics
            </p>
            <h3 className="mt-3 text-2xl font-bold text-white">
              Optional statistics for the wider project brief
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              CNDC and DBMS remain the core implementation focus. This section
              is only supportive material in case faculty asks how the broader
              problem statement was extended beyond your main subjects.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <Radio className="text-blue-200" size={18} />
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Correlations
              </p>
            </div>
            <div className="mt-4 grid gap-3">
              {summary.inferential_summary.correlations.map((item) => (
                <div
                  className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4"
                  key={item.nutrient_name}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{item.nutrient_name}</p>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                      r = {formatMetric(item.coefficient)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.interpretation}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.sample_size} paired observations
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-emerald-100" size={18} />
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Regression
                </p>
              </div>
              {regression ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Predictor
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {regression.predictor}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        R-squared
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatMetric(regression.r_squared)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">
                    {regression.interpretation}
                  </p>
                  <p className="font-mono text-xs leading-6 text-slate-300">
                    Organic Carbon = {formatMetric(regression.intercept)} + (
                    {formatMetric(regression.slope)} x {regression.predictor})
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Regression will appear once enough paired nutrient and organic-carbon
                  values are available.
                </p>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-blue-200" size={18} />
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Hypothesis Test
                </p>
              </div>
              {hypothesisTest ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Baseline Mean
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {hypothesisTest.baseline_label}: {formatMetric(hypothesisTest.baseline_mean)}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Comparison Mean
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {hypothesisTest.comparison_label}: {formatMetric(hypothesisTest.comparison_mean)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">
                    {hypothesisTest.conclusion}
                  </p>
                  <p className="font-mono text-xs leading-6 text-slate-300">
                    p-value = {formatMetric(hypothesisTest.p_value)}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Seasonal hypothesis testing will appear once at least two
                  measured seasons are available.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <FileText className="text-emerald-100" size={18} />
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Confidence Interval
              </p>
            </div>
            {confidenceInterval ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-white">
                  {confidenceInterval.metric}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Estimate
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatMetric(confidenceInterval.estimate)}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Lower Bound
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatMetric(confidenceInterval.lower_bound)}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Upper Bound
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatMetric(confidenceInterval.upper_bound)}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-300">
                  {confidenceInterval.interpretation}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Confidence intervals will appear once at least three organic-carbon
                observations exist in a season.
              </p>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-blue-200" size={18} />
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Limitations
              </p>
            </div>
            <div className="mt-4 grid gap-3">
              {summary.inferential_summary.limitations.map((item) => (
                <div
                  className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] p-4"
                  key={item}
                >
                  <CheckCircle2 className="mt-0.5 text-blue-200" size={16} />
                  <p className="text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      <article className="surface-panel-strong overflow-hidden p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-blue-300/15 p-3 text-blue-200">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Submission Support
            </p>
            <h3 className="mt-3 text-2xl font-bold text-white">
              Optional files and report alignment
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              These items are included so you can answer broader project or
              submission questions if they come up. They are not intended to
              replace the CNDC and DBMS explanation that should lead the demo.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-emerald-100/15 bg-[linear-gradient(135deg,rgba(101,184,165,0.14),rgba(127,167,217,0.12))] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">
                Certification Summary
              </p>
              <h4 className="mt-3 text-2xl font-bold text-white">
                {summary.certification_report.title}
              </h4>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white">
              {summary.certification_report.readiness}
            </div>
          </div>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-100">
            {summary.certification_report.summary}
          </p>

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center gap-3">
                <FileText className="text-emerald-100" size={18} />
                <p className="text-xs uppercase tracking-[0.22em] text-slate-200">
                  Report Sections
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                {summary.certification_report.report_sections.map((item) => (
                  <div
                    className="rounded-[1rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-100"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-blue-100" size={18} />
                <p className="text-xs uppercase tracking-[0.22em] text-slate-200">
                  Key Findings
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                {summary.certification_report.key_findings.map((item) => (
                  <div
                    className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.05] p-4"
                    key={item}
                  >
                    <CheckCircle2 className="mt-0.5 text-blue-100" size={16} />
                    <p className="text-sm leading-7 text-slate-100">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showImplementationArtifacts && summary.implementation_artifacts.length > 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/[0.08] p-3 text-slate-100">
                <Database size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Implementation Artifacts
                </p>
                <h4 className="mt-3 text-2xl font-bold text-white">
                  Open the actual files behind the database and integration story
                </h4>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                  The live app creates the schema through the bootstrap script and
                  then applies the seed SQL below. The remaining links support the
                  DBMS, CNDC, analytics, and reporting explanation without turning
                  the interface into a changelog.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {summary.implementation_artifacts.map((item) => (
                <a
                  className="group rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-4 transition hover:border-emerald-100/30 hover:bg-white/[0.07]"
                  href={item.href}
                  key={item.artifact_id}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {item.category}
                      </p>
                      <h5 className="mt-2 text-lg font-semibold text-white transition group-hover:text-emerald-100">
                        {item.title}
                      </h5>
                    </div>
                    <ArrowUpRight
                      className="shrink-0 text-slate-400 transition group-hover:text-emerald-100"
                      size={18}
                    />
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                      {item.subject_focus}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                      {item.file_name}
                    </span>
                    <span className="rounded-full border border-emerald-100/20 bg-emerald-100/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-100">
                      {item.used_in_live_app ? "Used by live app" : "Supporting artifact"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {summary.deliverable_statuses.map((item) => (
            <div
              className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5"
              key={item.title}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/[0.08] p-3 text-slate-100">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {item.evidence}
                    </p>
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                  {item.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default ProjectAlignmentPanel;
