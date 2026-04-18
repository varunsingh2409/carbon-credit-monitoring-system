import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Leaf, UserCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { authApi } from "@/api/authApi";
import { isPublishedDemoMode } from "@/demo/demoMode";
import { demoCredentialPresets } from "@/demo/mockBackend";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type LoginSchema = z.infer<typeof loginSchema>;

const roleOptions = ["farmer", "verifier", "admin"] as const;
type DemoLoginRole = (typeof roleOptions)[number];

const routeByRole = (role: UserRole) => {
  switch (role) {
    case "farmer":
      return "/farmer/dashboard";
    case "verifier":
      return "/verifier/dashboard";
    case "admin":
      return "/admin/panel";
    default:
      return "/";
  }
};

const getErrorMessage = (error: unknown) => {
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

  return "Login failed. Please check the credentials.";
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<DemoLoginRole>("farmer");
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  useEffect(() => {
    if (user) {
      navigate(routeByRole(user.role), { replace: true });
    }
  }, [navigate, user]);

  const applyDemoCredentials = (role: DemoLoginRole) => {
    if (!isPublishedDemoMode) {
      return;
    }

    const preset = demoCredentialPresets[role];
    setSelectedRole(role);
    setValue("username", preset.username, { shouldDirty: true });
    setValue("password", preset.password, { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      const response = await authApi.login(values.username, values.password);
      login(response.access_token, response.user);

      if (response.user.role !== selectedRole) {
        toast.success(
          `Signed in as ${response.user.role}. Redirecting to the correct workspace.`
        );
      } else {
        toast.success("Signed in successfully");
      }

      const intendedPath =
        typeof location.state === "object" &&
        location.state &&
        "from" in location.state &&
        typeof location.state.from === "object" &&
        location.state.from &&
        "pathname" in location.state.from
          ? String(location.state.from.pathname)
          : null;

      navigate(intendedPath ?? routeByRole(response.user.role), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <section className="surface-panel-strong relative w-full max-w-md overflow-hidden p-8">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/[0.06] text-emerald-100">
          <Leaf size={28} />
        </div>

        <div className="relative mt-6 text-center">
          <p className="eyebrow">
            Secure Login
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-white">Welcome Back</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Sign in to access the carbon-credit workspace and continue from the
            latest farm, verification, or admin activity.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          {isPublishedDemoMode ? (
            <div className="rounded-[1.5rem] border border-accent-green/20 bg-accent-green/[0.08] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">
                GitHub Pages Demo Mode
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Use one of the prepared accounts below to open the published
                farmer, verifier, or admin workspace without the backend.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {roleOptions.map((role) => {
                  const preset = demoCredentialPresets[role];
                  return (
                    <button
                      className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.14]"
                      key={`preset-${role}`}
                      onClick={() => applyDemoCredentials(role)}
                      type="button"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                        {role}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {preset.username}
                      </p>
                      <p className="mt-1 text-xs text-slate-300/80">
                        {preset.password}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-300"
              htmlFor="username"
            >
              Username
            </label>
            <div className="surface-card-muted flex items-center gap-3 px-4 py-3 transition focus-within:border-white/25 focus-within:bg-white/10">
              <UserCircle2 className="text-slate-300/75" size={18} />
              <input
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-300/45"
                id="username"
                placeholder="Username"
                {...register("username")}
              />
            </div>
            {errors.username ? (
              <p className="mt-2 text-sm text-rose-300">{errors.username.message}</p>
            ) : null}
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-300"
              htmlFor="password"
            >
              Password
            </label>
            <div className="surface-card-muted flex items-center gap-3 px-4 py-3 transition focus-within:border-white/25 focus-within:bg-white/10">
              <KeyRound className="text-slate-300/75" size={18} />
              <input
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-300/45"
                id="password"
                placeholder="Password"
                type="password"
                {...register("password")}
              />
            </div>
            {errors.password ? (
              <p className="mt-2 text-sm text-rose-300">{errors.password.message}</p>
            ) : null}
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-300">Demo Role</p>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((role) => {
                const isActive = selectedRole === role;
                return (
                  <button
                    className={`rounded-full px-3 py-2 text-sm font-semibold capitalize transition ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "border border-white/10 bg-white/10 text-slate-200 hover:bg-white/10"
                    }`}
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    type="button"
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="button-primary w-full rounded-2xl px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-300/80">
          {isPublishedDemoMode
            ? "Published demo mode is active with sample farmer, verifier, and admin accounts"
            : "Demo-ready access for farmer, verifier, and admin workspaces"}
        </div>

        <div className="mt-5 text-center text-sm">
          <Link className="font-medium text-accent-blue transition hover:text-blue-300" to="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
