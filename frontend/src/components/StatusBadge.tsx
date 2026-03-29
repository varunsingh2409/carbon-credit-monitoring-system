import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { StatusBadgeValue } from "@/types";

interface StatusBadgeProps {
  status: StatusBadgeValue;
  size?: "sm" | "md";
}

const statusStyles: Record<
  StatusBadgeValue,
  {
    dot: string;
    shell: string;
  }
> = {
  active: {
    dot: "bg-blue-300",
    shell: "border-blue-400/25 bg-blue-500/15 text-blue-300"
  },
  completed: {
    dot: "bg-cyan-300",
    shell: "border-cyan-400/25 bg-cyan-500/15 text-cyan-300"
  },
  pending: {
    dot: "bg-yellow-300",
    shell: "border-yellow-400/25 bg-yellow-500/15 text-yellow-300"
  },
  rejected: {
    dot: "bg-red-300",
    shell: "border-red-400/25 bg-red-500/15 text-red-300"
  },
  verified: {
    dot: "bg-accent-green",
    shell: "border-accent-green/25 bg-accent-green/15 text-accent-green"
  }
};

const sizeStyles = {
  md: "px-3 py-1.5 text-xs",
  sm: "px-2.5 py-1 text-[11px]"
};

function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const styles = statusStyles[status];

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-2 rounded-full border font-semibold uppercase tracking-[0.2em]",
          sizeStyles[size],
          styles.shell
        )
      )}
    >
      <span className={twMerge(clsx("h-1.5 w-1.5 rounded-full", styles.dot))} />
      {label}
    </span>
  );
}

export default StatusBadge;
