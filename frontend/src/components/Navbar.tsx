import { clsx } from "clsx";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import UniversityLogo from "@/components/UniversityLogo";
import type { User } from "@/types";

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
}

const navLinkClass = (isActive: boolean) =>
  twMerge(
    clsx(
      "rounded-full border px-4 py-2 text-sm font-medium transition",
      isActive
        ? "border-white/20 bg-white/10 text-white shadow-[0_10px_30px_rgba(26,36,49,0.18)]"
        : "border-transparent text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
    )
  );

function Navbar({ currentUser, onLogout }: NavbarProps) {
  const displayName = currentUser?.name?.trim() || currentUser?.username;
  const dashboardLink =
    currentUser?.role === "farmer"
      ? "/farmer/dashboard"
      : currentUser?.role === "verifier"
        ? "/verifier/dashboard"
        : currentUser?.role === "admin"
          ? "/admin/panel"
          : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(27,38,51,0.72)] backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-100/60 to-transparent" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" to="/">
          <UniversityLogo className="h-12 w-12 p-1" />
          <div>
            <p className="font-heading text-lg font-extrabold tracking-tight text-white">
              Carbon Credit
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/80">
              Monitoring System
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 md:flex">
          <NavLink className={({ isActive }) => navLinkClass(isActive)} to="/">
            Home
          </NavLink>
          {dashboardLink ? (
            <NavLink
              className={({ isActive }) => navLinkClass(isActive)}
              to={dashboardLink}
            >
              Dashboard
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <div className="hidden items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 shadow-[0_12px_30px_rgba(26,36,49,0.16)] sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-green/20 text-red-50">
                  <ShieldCheck size={16} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300/80">
                    {currentUser.role}
                  </p>
                </div>
              </div>
              <button
                className="button-secondary px-4 py-2.5"
                onClick={onLogout}
                type="button"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              className="button-primary px-5 py-2.5"
              to="/login"
            >
              <LogIn size={16} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
