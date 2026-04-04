import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Cpu,
  Database,
  Lock,
  Radio,
  Settings2,
  ShieldCheck,
  UserRound,
  Workflow,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    icon: Activity,
    title: "Real-Time Monitoring",
    description:
      "Connect field sensors and watch nutrient-rich soil measurements arrive in a secure, decision-ready pipeline.",
    accent: "text-accent-green",
    glow: "from-accent-green/25 to-transparent"
  },
  {
    icon: Cpu,
    title: "Automated Calculation",
    description:
      "Turn validated organic carbon readings into transparent sequestration estimates with consistent carbon math.",
    accent: "text-blue-300",
    glow: "from-blue-500/25 to-transparent"
  },
  {
    icon: ShieldCheck,
    title: "Transparent Verification",
    description:
      "Guide every claim through a reviewer-friendly workflow with traceable approvals, comments, and carbon evidence.",
    accent: "text-accent-purple",
    glow: "from-accent-purple/25 to-transparent"
  }
];

const architectureItems = [
  { icon: Radio, label: "HTTPS sensor ingestion with JWT-protected APIs" },
  { icon: Database, label: "Structured farm, season, nutrient, and sequestration records" },
  { icon: Workflow, label: "Calculation and verification workflows with role-based access" },
  { icon: Lock, label: "Secure authentication, persisted sessions, and audit-friendly decisions" },
  { icon: Settings2, label: "Ready for blockchain anchoring, exports, and downstream reporting" }
];

const userRoles = [
  {
    icon: UserRound,
    title: "Farmer",
    description:
      "Track soil health, season performance, recent measurements, and estimated credits in one place."
  },
  {
    icon: ClipboardCheck,
    title: "Verifier",
    description:
      "Review carbon evidence, check measurements, and approve or reject sequestration claims with comments."
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    description:
      "Monitor platform health, trigger calculations, manage users, and oversee issuance trends."
  }
];

const benefits = [
  "Cleaner data capture from distributed field sensors",
  "Faster carbon-credit estimation for completed seasons",
  "Trustworthy approval workflows for verifiers",
  "Role-based dashboards tailored to each team",
  "Extensible architecture for exports and integrations",
  "A modern operational view for sustainable agriculture programs"
];

const heroModules = [
  "Measurement Ingestion",
  "Carbon Analytics",
  "Verifier Workflow",
  "Admin Control"
];

function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  return (
    <>
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-12%] top-[-8%] h-72 w-72 rounded-full bg-accent-green/10 blur-3xl" />
          <div className="absolute right-[-8%] top-[10%] h-80 w-80 rounded-full bg-accent-blue/10 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[30%] h-96 w-96 rounded-full bg-accent-amber/10 blur-3xl" />
        </div>

        <section className="relative flex min-h-screen items-center">
          <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100 shadow-[0_10px_30px_rgba(26,36,49,0.14)]">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-100 shadow-[0_0_18px_rgba(115,184,143,0.55)]" />
                Trusted Carbon Operations Platform
              </div>

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                The operating layer for soil carbon and verified credits
              </p>

              <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[0.98] sm:text-6xl lg:text-[5.2rem]">
                <span className="gradient-text">
                  Track Soil Carbon. Earn Verified Credits With Confidence.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                A secure, blockchain-ready platform for real-time soil carbon
                monitoring, automated sequestration calculations, and
                transparent verification workflows across your entire carbon
                program.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  className="button-primary px-7 py-3.5"
                  to="/login"
                >
                  Get Started
                  <ArrowRight size={17} />
                </Link>
                <button
                  className="button-secondary px-7 py-3.5"
                  onClick={() => setIsModalOpen(true)}
                  type="button"
                >
                  Learn More
                  <ChevronRight size={17} />
                </button>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {heroModules.map((module) => (
                  <span
                    className="rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
                    key={module}
                  >
                    {module}
                  </span>
                ))}
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  ["Realtime", "Sensor-backed measurement ingestion"],
                  ["Secure", "JWT-protected role-based workflows"],
                  ["Ready", "Built for verification and issuance"]
                ].map(([title, description]) => (
                  <div
                    className="surface-card-muted px-5 py-4"
                    key={title}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center">
              <div className="surface-panel-strong relative w-full overflow-hidden p-6 sm:p-8">
                <div className="absolute inset-0 bg-surface-mesh opacity-80" />
                <div className="relative space-y-5">
                  <div className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.22em] text-slate-300/80">
                    <span>Decision Workspace</span>
                    <span className="rounded-full border border-emerald-100/20 bg-emerald-200/10 px-3 py-1 text-emerald-100">
                      Live
                    </span>
                  </div>

                  <div className="surface-card p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      Carbon Operations Snapshot
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {[
                        ["18", "Verifications queued"],
                        ["42.7", "tCO2e issued this month"],
                        ["96", "Sensor events today"],
                        ["127", "Active farm records"]
                      ].map(([value, label]) => (
                        <div
                          className="surface-card-muted p-4"
                          key={label}
                        >
                          <p className="metric-value text-3xl font-extrabold">
                            {value}
                          </p>
                          <p className="mt-2 text-sm text-slate-400">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {featureCards.map(({ icon: Icon, title, description, accent, glow }) => (
                      <article
                        className="surface-card card-hover group relative overflow-hidden p-5"
                        key={title}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${glow} opacity-0 transition duration-300 group-hover:opacity-100`} />
                        <div className="relative flex items-start gap-4">
                          <div className={`rounded-2xl bg-white/10 p-3 shadow-[0_12px_24px_rgba(26,36,49,0.14)] ${accent}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-white">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {description}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Explore The Platform</p>
              <h2 className="mt-3 text-3xl font-extrabold text-white">
                Built around real operational decisions
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-400">
              From incoming sensor evidence to approved credit outcomes, every
              surface is designed to support trusted workflow decisions across
              farmers, verifiers, and administrators.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description, accent, glow }) => (
              <article
                className="surface-card card-hover group relative overflow-hidden p-6"
                key={title}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${glow} opacity-0 transition duration-300 group-hover:opacity-100`} />
                <div className="relative">
                  <div className={`mb-5 inline-flex rounded-2xl bg-white/10 p-3 shadow-[0_12px_24px_rgba(26,36,49,0.14)] ${accent}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/[0.08] px-6 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Trusted across the full workflow
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {["Farmers", "Verifiers", "Admins", "Sensor Networks"].map((label) => (
                <span
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200"
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="surface-panel-strong p-8 sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">
                  Platform Metrics
                </p>
                <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                  Built for trust, scale, and carbon-market execution
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-400">
                Farmers, verifiers, and administrators operate from a single
                secure source of truth with resilient uptime and transparent
                carbon-credit visibility.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["127", "Active Farms"],
                ["1,847", "Tons CO2 Credits"],
                ["98", "Farmers Enrolled"],
                ["99.9%", "Uptime"]
              ].map(([value, label]) => (
                <div
                  className="surface-card p-6"
                  key={label}
                >
                  <p className="metric-value text-4xl font-heading font-extrabold">
                    {value}
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,29,39,0.48)] px-4 py-8 backdrop-blur-md">
          <div className="surface-panel-strong relative max-h-[90vh] w-full max-w-6xl overflow-y-auto p-6 sm:p-8">
            <button
              aria-label="Close learn more modal"
              className="button-secondary absolute right-5 top-5 h-10 w-10 rounded-full p-0 text-slate-300"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="max-w-3xl">
              <p className="eyebrow">
                Learn More
              </p>
              <h2 className="mt-3 text-4xl font-extrabold text-white">
                A carbon-credit workspace designed for real agricultural operations
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                The Carbon Credit Monitoring System combines sensor data,
                carbon accounting, and human verification into one modern
                control layer. Teams can monitor fields, validate calculations,
                and manage issuance decisions without leaving the platform.
              </p>
            </div>

            <section className="mt-10">
              <h3 className="text-2xl font-bold text-white">How it works</h3>
              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                {[
                  "Sensors submit nutrient-rich soil measurements to the API.",
                  "The system validates farms, seasons, nutrients, and measurement integrity.",
                  "Carbon sequestration is calculated from approved organic-carbon evidence.",
                  "Verifiers review the data trail and approve or reject the claim."
                ].map((step, index) => (
                  <div
                    className="surface-card p-5"
                    key={step}
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-accent-green to-blue-400 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="surface-card p-6">
                <h3 className="text-2xl font-bold text-white">
                  Technical architecture
                </h3>
                <div className="mt-6 space-y-4">
                  {architectureItems.map(({ icon: Icon, label }) => (
                    <div
                      className="surface-card-muted flex items-start gap-4 p-4"
                      key={label}
                    >
                      <div className="rounded-2xl bg-white/10 p-3 text-blue-300">
                        <Icon size={18} />
                      </div>
                      <p className="text-sm leading-7 text-slate-300">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card p-6">
                <h3 className="text-2xl font-bold text-white">User roles</h3>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {userRoles.map(({ icon: Icon, title, description }) => (
                    <article
                      className="surface-card-muted p-5"
                      key={title}
                    >
                      <div className="inline-flex rounded-2xl bg-white/10 p-3 text-accent-green">
                        <Icon size={18} />
                      </div>
                      <h4 className="mt-4 text-lg font-bold text-white">{title}</h4>
                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        {description}
                      </p>
                    </article>
                  ))}
                </div>

                <h3 className="mt-8 text-2xl font-bold text-white">Key benefits</h3>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div
                      className="surface-card-muted flex items-start gap-3 p-4"
                      key={benefit}
                    >
                      <CheckCircle2 className="mt-0.5 text-accent-green" size={18} />
                      <p className="text-sm leading-7 text-slate-300">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                className="button-primary px-7 py-3.5"
                onClick={() => setIsModalOpen(false)}
                to="/login"
              >
                Get Started Now
                <ArrowRight size={17} />
              </Link>
              <button
                className="button-secondary px-7 py-3.5"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Explore Features
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default LandingPage;
