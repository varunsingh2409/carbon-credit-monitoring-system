import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FlaskConical, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { verifierApi } from "@/api/verifierApi";
import LoadingState from "@/components/LoadingState";
import StatusBadge from "@/components/StatusBadge";
import type { SequestrationDetail, StatusBadgeValue } from "@/types";

const reviewSchema = z.object({
  approved_carbon_credit: z.coerce.number().min(0, "Approved credit must be zero or more"),
  verifier_comments: z.string().min(1, "Comments are required")
});

type ReviewForm = z.infer<typeof reviewSchema>;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

const formatDateTime = (value: string) => dateFormatter.format(new Date(value));

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

function VerificationDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<SequestrationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      approved_carbon_credit: 0,
      verifier_comments: ""
    }
  });

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      if (!id) {
        toast.error("Missing sequestration identifier");
        navigate("/verifier/dashboard", { replace: true });
        return;
      }

      try {
        const response = await verifierApi.getSequestrationDetail(Number(id));
        if (!isMounted) {
          return;
        }

        setDetail(response);
        reset({
          approved_carbon_credit: response.verification?.approved_carbon_credit ??
            response.estimated_carbon_credit,
          verifier_comments: response.verification?.verifier_comments ?? ""
        });
      } catch (error) {
        if (isMounted) {
          toast.error(getErrorMessage(error, "Unable to load verification details"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, reset]);

  if (isLoading) {
    return <LoadingState label="Loading verification details..." />;
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="surface-panel p-8 text-center text-slate-400">
          This sequestration record could not be loaded.
        </div>
      </div>
    );
  }

  const isReviewable = detail.status.toLowerCase() === "pending";

  const approve = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      await verifierApi.approveSequestration(detail.sequestration_id, values);
      toast.success("Sequestration approved successfully");
      navigate("/verifier/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to approve sequestration"));
    } finally {
      setIsSubmitting(false);
    }
  });

  const reject = async () => {
    const isValid = await trigger("verifier_comments");
    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      await verifierApi.rejectSequestration(detail.sequestration_id, {
        verifier_comments: getValues("verifier_comments")
      });
      toast.success("Sequestration rejected successfully");
      navigate("/verifier/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reject sequestration"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="surface-panel-strong mb-8 p-8">
        <p className="eyebrow">
          Verification Details
        </p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white">
              {detail.farm_name} | {detail.season_name}
            </h1>
            <p className="mt-3 text-slate-300">
              This is the exact database claim awaiting a verifier decision:
              farm and season identity, imported measurements, formula output,
              and approval form.
            </p>
          </div>
          <StatusBadge status={normalizeStatus(detail.status)} />
        </div>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        {[
          ["1. Imported Rows", `${detail.measurement_count} soil measurement event(s) linked to this season.`],
          ["2. Calculated Claim", `${detail.estimated_carbon_credit.toFixed(2)} tCO2e estimated from stored carbon values.`],
          ["3. Stored Decision", "Approval or rejection is saved as carbon_verification history."]
        ].map(([title, description]) => (
          <div className="surface-card-muted p-5" key={title}>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">{title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </div>
        ))}
      </section>

      {detail.verification ? (
        <section className="mb-8 rounded-[1.5rem] border border-accent-green/20 bg-accent-green/[0.1] p-5 text-sm text-slate-100">
          This record already has a verification decision from{" "}
          {formatDateTime(detail.verification.verification_date)}.
        </section>
      ) : null}

      <section className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
        <aside className="surface-panel h-fit p-6 xl:sticky xl:top-28">
          <h2 className="text-2xl font-bold text-white">Database record</h2>
          <div className="mt-6 space-y-4 text-sm">
            {[
              ["Farm", detail.farm_name],
              ["Farmer", detail.farmer_name],
              ["Location", detail.location],
              ["Area", `${detail.area_hectares.toFixed(2)} hectares`],
              ["Season", detail.season_name],
              ["Measurements", `${detail.measurement_count}`]
            ].map(([label, value]) => (
              <div
                className="surface-card-muted px-4 py-3"
                key={label}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-base font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-8">
          <section className="surface-panel p-6">
            <h2 className="text-2xl font-bold text-white">Calculation to verify</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="surface-card p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Baseline Carbon
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {detail.baseline_carbon.toFixed(2)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-accent-green/20 bg-accent-green/[0.1] p-5 shadow-[0_14px_32px_rgba(101,184,143,0.08)]">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Current Carbon
                </p>
                <p className="mt-2 text-3xl font-bold text-accent-green">
                  {detail.current_carbon.toFixed(2)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-blue-200/20 bg-blue-300/[0.1] p-5 shadow-[0_14px_32px_rgba(127,167,217,0.08)]">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Net Increase
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-300">
                  {detail.net_carbon_increase.toFixed(2)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-accent-purple/20 bg-accent-purple/[0.12] p-5 shadow-[0_18px_40px_rgba(157,142,209,0.1)]">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Estimated Credit
                </p>
                <p className="mt-2 text-3xl font-bold text-accent-purple">
                  {detail.estimated_carbon_credit.toFixed(2)} tCO2e
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-blue-200/20 bg-blue-300/[0.1] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
                Calculation formula
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Estimated credit = (net carbon increase x farm area x 3.67) / 1000
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200/85">
                ({detail.net_carbon_increase.toFixed(2)} x{" "}
                {detail.area_hectares.toFixed(2)} x 3.67) / 1000 ={" "}
                {detail.estimated_carbon_credit.toFixed(2)} tCO2e
              </p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={approve}>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="verifier_comments"
                >
                  Verifier Comments
                </label>
                <textarea
                  className="min-h-[150px] w-full rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-300/45 focus:border-white/25 focus:bg-white/[0.12]"
                  id="verifier_comments"
                  placeholder="Add review notes, validation observations, or decision rationale"
                  {...register("verifier_comments")}
                />
                {errors.verifier_comments ? (
                  <p className="mt-2 text-sm text-rose-300">
                    {errors.verifier_comments.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="approved_carbon_credit"
                >
                  Approved Carbon Credit
                </label>
                <input
                  className="w-full rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-white/25 focus:bg-white/[0.12]"
                  id="approved_carbon_credit"
                  step="0.01"
                  type="number"
                  {...register("approved_carbon_credit")}
                />
                {errors.approved_carbon_credit ? (
                  <p className="mt-2 text-sm text-rose-300">
                    {errors.approved_carbon_credit.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className="button-primary w-full rounded-[1.2rem] px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!isReviewable || isSubmitting}
                  type="submit"
                >
                  <CheckCircle2 size={18} />
                  {isSubmitting ? "Approving..." : "Approve"}
                </button>
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-gradient-to-r from-rose-500 to-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!isReviewable || isSubmitting}
                  onClick={() => void reject()}
                  type="button"
                >
                  <XCircle size={18} />
                  {isSubmitting ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </form>
          </section>

          <section className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-accent-green">
                <FlaskConical size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Imported measurement evidence
                </h2>
                <p className="text-sm text-slate-400">
                  Nutrient rows linked through soil_measurement and measurement_result
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {detail.measurements.map((measurement) => (
                <article
                  className="surface-card p-5"
                  key={measurement.measurement_id}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">
                        Measurement #{measurement.measurement_id}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatDateTime(measurement.measurement_date)} | Depth{" "}
                        {measurement.depth_cm.toFixed(2)} cm
                      </p>
                    </div>
                    <div className="text-sm text-slate-300">
                      Sensor: {measurement.sensor_id ?? "Not provided"}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {measurement.nutrients.map((nutrient) => (
                      <div
                        className="surface-card-muted p-4"
                        key={`${measurement.measurement_id}-${nutrient.nutrient_name}`}
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {nutrient.nutrient_name}
                        </p>
                        <p className="mt-2 text-lg font-bold text-white">
                          {nutrient.measured_value.toFixed(2)} {nutrient.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default VerificationDetails;
