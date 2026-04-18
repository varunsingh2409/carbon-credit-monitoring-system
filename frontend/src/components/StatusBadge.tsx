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
    dot: "bg-red-100",
    shell: "border-red-200/30 bg-red-300/20 text-red-100"
  },
  completed: {
    dot: "bg-orange-100",
    shell: "border-orange-200/30 bg-orange-300/20 text-orange-100"
  },
  pending: {
    dot: "bg-amber-100",
    shell: "border-amber-200/30 bg-amber-300/20 text-amber-100"
  },
  rejected: {
    dot: "bg-rose-100",
    shell: "border-rose-200/30 bg-rose-300/20 text-rose-100"
  },
  verified: {
    dot: "bg-red-50",
    shell: "border-accent-green/30 bg-accent-green/20 text-red-50"
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
