import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Leaf,
  Radio,
  ShieldCheck,
  UserRound,
  Workflow
} from "lucide-react";
import { Link } from "react-router-dom";

import { implementationApi } from "@/api/implementationApi";
import ImplementationEvidencePanel from "@/components/ImplementationEvidencePanel";
import type { AdminImplementationSummary } from "@/types";

const roleSurfaces = [
  {
    icon: UserRound,
    title: "Farmer Workspace",
    description:
      "Receives the outcome of the workflow as season progress, measurement history, and verified credit visibility."
  },
  {
    icon: ClipboardCheck,
    title: "Verifier Workspace",
    description:
      "Reviews the evidence trail, checks the carbon estimate, and records the approval or rejection as permanent workflow history."
  },
  {
    icon: ShieldCheck,
    title: "Admin Workspace",
    description:
      "Imports ThingSpeak data, triggers carbon calculation, and presents the CNDC and DBMS evidence inside the product."
  }
];

const trustSignals = [
  {
    icon: Radio,
    title: "Network visible",
    description:
      "ThingSpeak ingress, REST endpoints, JSON payloads, docs, and health routes are surfaced as part of the story."
  },
  {
    icon: Database,
    title: "Database inspectable",
    description:
      "Tables, row counts, constraints, indexes, and exact query results are visible directly on the website."
  },
  {
    icon: Workflow,
    title: "Approval traceable",
    description:
      "The calculation and verification path is mapped end to end, from external feed to stored approval."
  }
];

function LandingPage() {
  const [implementationSummary, setImplementationSummary] =
    useState<AdminImplementationSummary | null>(null);
  const [evidenceStatus, setEvidenceStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading"
  );

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    const offsetTop = target.getBoundingClientRect().top + window.scrollY - 104;
    window.scrollTo({
      top: Math.max(offsetTop, 0),
      behavior: "smooth"
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadEvidence = async () => {
      try {
        const response = await implementationApi.getEvidence();
        if (isMounted) {
          setImplementationSummary(response);
          setEvidenceStatus("ready");
        }
      } catch {
        if (isMounted) {
          setImplementationSummary(null);
          setEvidenceStatus("unavailable");
        }
      }
    };

    void loadEvidence();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroMetrics = useMemo(() => {
    const tableCount = implementationSummary?.table_details.length ?? 9;
    const constraintCount =
      implementationSummary?.table_details.reduce(
        (total, table) => total + table.constraints.length,
        0
      ) ?? 27;
    const flowSteps = implementationSummary?.cndc_flow.length ?? 5;
    const apiTouchpoints = implementationSummary?.api_touchpoints.length ?? 5;

    return [
      ["Tables", tableCount],
      ["Constraints", constraintCount],
      ["Flow steps", flowSteps],
      ["API routes", apiTouchpoints]
    ];
  }, [implementationSummary]);

  const leadFlow = implementationSummary?.cndc_flow[0];
  const leadTable = implementationSummary?.table_details[0];

  return (
    <main className="relative overflow-hidden">
      <section className="relative">
        <header className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <Link className="flex items-center gap-3" to="/">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-green via-accent-emerald to-accent-blue text-white shadow-accent">
                <Leaf size={22} />
              </div>
              <div>
                <p className="font-heading text-lg font-extrabold tracking-tight text-white">
                  Carbon Credit
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300/80">
                  Verification System
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] p-1.5 md:flex">
              {[
                ["Workflow", "story"],
                ["Proof", "implementation-proof"],
                ["Roles", "roles"]
              ].map(([label, sectionId]) => (
                <button
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  key={label}
                  onClick={() => scrollToSection(sectionId)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </nav>

            <Link className="button-primary px-5 py-2.5" to="/login">
              Sign In
            </Link>
          </div>
        </header>

        <div className="mx-auto grid min-h-[720px] max-w-7xl gap-12 px-4 pb-16 pt-32 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-100/90">
              Carbon credit verification platform
            </p>

            <h1 className="mt-6 max-w-5xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Carbon-credit verification with clear network and database proof.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              The demo shows one complete workflow: ThingSpeak transmission,
              backend import, PostgreSQL population, carbon calculation, and
              verifier approval.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                className="button-primary px-7 py-3.5"
                onClick={() => scrollToSection("implementation-proof")}
                type="button"
              >
                Inspect Live Proof
                <ArrowRight size={17} />
              </button>
              <Link className="button-secondary px-7 py-3.5" to="/login">
                Open Workspaces
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {heroMetrics.map(([label, value]) => (
                <div
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] px-5 py-4"
                  key={label}
                >
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="surface-panel-strong relative w-full overflow-hidden p-6 sm:p-7">
              <div className="absolute inset-0 bg-surface-mesh opacity-70" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/[0.06] px-4 py-3 text-xs uppercase tracking-[0.24em] text-slate-300">
                  <span>Evidence Preview</span>
                  <span className="rounded-full border border-emerald-100/20 bg-emerald-200/10 px-3 py-1 text-emerald-100">
                    Final App
                  </span>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,27,0.88),rgba(16,24,34,0.98))] p-5">
                  <div className="flex items-center gap-3">
                    <Radio className="text-blue-200" size={18} />
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      CNDC preview
                    </p>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-white">
                    {leadFlow?.title ?? "ThingSpeak to FastAPI to verifier workflow"}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {leadFlow?.subject_focus ??
                      "A step-by-step communication path from external sensor data to verified approval."}
                  </p>
                  <div className="mt-4 flex items-center gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                    <span>{leadFlow?.source ?? "Field sensor"}</span>
                    <ArrowRight className="text-slate-500" size={15} />
                    <span>{leadFlow?.destination ?? "ThingSpeak channel"}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        Transport
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {leadFlow?.transport_stack ?? "HTTPS -> HTTP POST -> TCP/IP"}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        Data Format
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {leadFlow?.data_format ?? "ThingSpeak fields and JSON payloads"}
                      </p>
                    </div>
                  </div>
                  <code className="mt-4 block overflow-x-auto rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs text-emerald-100">
                    {leadFlow?.endpoint ?? "https://api.thingspeak.com/update"}
                  </code>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,27,0.88),rgba(16,24,34,0.98))] p-5">
                  <div className="flex items-center gap-3">
                    <Database className="text-emerald-100" size={18} />
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      DBMS preview
                    </p>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-white">
                    {leadTable?.table_name ?? "users"}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    {leadTable?.purpose ??
                      "Authentication and workflow state are persisted in normalized PostgreSQL tables."}
                  </p>
                  <pre className="mt-4 overflow-x-auto rounded-[1rem] border border-white/10 bg-white/[0.04] p-4 font-mono text-xs leading-7 text-slate-200">
                    {leadTable?.query ??
                      "SELECT user_id, username, role, is_active, created_at FROM users ORDER BY user_id ASC LIMIT 8;"}
                  </pre>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    `ThingSpeak ${implementationSummary?.thingspeak_channel_id ?? "channel"}`,
                    `${implementationSummary?.docs_endpoint ?? "/docs"} + ${implementationSummary?.health_endpoint ?? "/health"}`
                  ].map((label) => (
                    <div
                      className="rounded-[1.1rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-200"
                      key={label}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" id="story">
        <div className="grid gap-6 lg:grid-cols-3">
          {trustSignals.map(({ icon: Icon, title, description }) => (
            <article
              className="rounded-[1.9rem] border border-white/10 bg-white/[0.05] p-6"
              key={title}
            >
              <div className="inline-flex rounded-2xl bg-white/[0.08] p-3 text-slate-100">
                <Icon size={20} />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {implementationSummary ? (
          <ImplementationEvidencePanel
            anchorId="implementation-proof"
            description="The evidence surface is built into the website so evaluators can inspect the CNDC and DBMS implementation directly inside the product."
            eyebrow="Implementation Evidence"
            summary={implementationSummary}
            title="Queryable proof for CNDC and DBMS"
          />
        ) : (
          <div
            className="surface-panel-strong rounded-[2rem] border border-white/10 p-8 sm:p-10"
            id="implementation-proof"
          >
            <p className="eyebrow">Implementation Evidence</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              {evidenceStatus === "unavailable"
                ? "Implementation evidence is temporarily unavailable"
                : "Loading the technical proof surface"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              {evidenceStatus === "unavailable"
                ? "The rest of the product remains available, but the public implementation evidence endpoint did not respond for this session."
                : "The homepage is ready to show CNDC flow steps, table queries, rows, and constraints as soon as the implementation evidence endpoint responds."}
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" id="roles">
        <div className="rounded-[2.1rem] border border-white/10 bg-white/[0.05] p-8 sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Role Story</p>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                One verification workflow, three operating views
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-400">
              The platform centers carbon-credit verification while giving each
              role a clear technical context that can be demonstrated end to
              end.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {roleSurfaces.map(({ icon: Icon, title, description }) => (
              <article
                className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6"
                key={title}
              >
                <div className="inline-flex rounded-2xl bg-white/[0.08] p-3 text-slate-100">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link className="button-primary px-7 py-3.5" to="/login">
              Enter The Platform
              <ArrowRight size={17} />
            </Link>
            <button
              className="button-secondary px-7 py-3.5"
              onClick={() => scrollToSection("implementation-proof")}
              type="button"
            >
              Review Technical Evidence
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-[2.2rem] border border-emerald-100/15 bg-[linear-gradient(135deg,rgba(101,184,165,0.14),rgba(127,167,217,0.12))] p-8 sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Closing Position</p>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                A carbon-credit platform with visible implementation proof.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-200">
              Verification, communication, and database evidence are presented
              together so the explanation stays aligned with the implemented
              system.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "ThingSpeak communication path is visible.",
              "PostgreSQL tables and constraints are inspectable.",
              "Verification logic stays central to the experience."
            ].map((item) => (
              <div
                className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4"
                key={item}
              >
                <CheckCircle2 className="mt-0.5 text-emerald-100" size={18} />
                <p className="text-sm leading-7 text-slate-100">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
