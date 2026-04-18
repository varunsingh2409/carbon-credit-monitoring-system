import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Award,
  BarChart3,
  Calculator,
  CalendarDays,
  Clock3,
  Coins,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sprout,
  TimerReset,
  Users,
  Waves
} from "lucide-react";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  trend?: string;
}

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  award: Award,
  calculator: Calculator,
  calendar: CalendarDays,
  carbon: Coins,
  chart: BarChart3,
  clock: Clock3,
  coin: Coins,
  coins: Coins,
  credit: Coins,
  credits: Coins,
  dashboard: BarChart3,
  farm: MapPinned,
  farms: MapPinned,
  leaf: Leaf,
  location: MapPinned,
  map: MapPinned,
  measurement: Waves,
  measurements: Waves,
  pending: TimerReset,
  review: ShieldCheck,
  season: Sprout,
  seasons: Sprout,
  sensor: Waves,
  shield: ShieldCheck,
  sprout: Sprout,
  stats: BarChart3,
  timer: TimerReset,
  uptime: Activity,
  user: Users,
  users: Users,
  waves: Waves
};

const colorMap: Record<
  string,
  {
    icon: string;
    text: string;
  }
> = {
  blue: {
    icon: "bg-red-200/15 text-red-100 ring-1 ring-inset ring-red-100/25",
    text: "text-red-100"
  },
  cyan: {
    icon: "bg-orange-200/15 text-orange-100 ring-1 ring-inset ring-orange-100/25",
    text: "text-orange-100"
  },
  green: {
    icon: "bg-accent-green/20 text-red-50 ring-1 ring-inset ring-accent-green/30",
    text: "text-red-50"
  },
  pink: {
    icon: "bg-rose-300/20 text-rose-100 ring-1 ring-inset ring-rose-100/30",
    text: "text-rose-100"
  },
  purple: {
    icon: "bg-accent-purple/25 text-red-50 ring-1 ring-inset ring-accent-purple/35",
    text: "text-red-50"
  },
  red: {
    icon: "bg-red-400/20 text-red-100 ring-1 ring-inset ring-red-200/30",
    text: "text-red-100"
  },
  yellow: {
    icon: "bg-yellow-300/20 text-amber-50 ring-1 ring-inset ring-yellow-100/30",
    text: "text-amber-50"
  }
};

function StatCard({ icon, label, value, color, trend }: StatCardProps) {
  const normalizedIcon = icon.trim().toLowerCase();
  const Icon = iconMap[normalizedIcon] ?? Leaf;
  const palette = colorMap[color.trim().toLowerCase()] ?? colorMap.green;

  return (
    <article className="surface-card card-hover p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300/85">
            {label}
          </p>
          {trend ? (
            <p className="mt-2 text-sm leading-6 text-slate-300/70">{trend}</p>
          ) : null}
        </div>
        <div className={`rounded-[1rem] p-3 ${palette.icon}`}>
          <Icon size={20} />
        </div>
      </div>

      <p
        className={`text-3xl font-heading font-extrabold tracking-tight sm:text-[2rem] ${palette.text}`}
      >
        {value}
      </p>
    </article>
  );
}

export default StatCard;
