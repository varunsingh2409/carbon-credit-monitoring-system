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
    glow: string;
    icon: string;
    text: string;
  }
> = {
  blue: {
    glow: "from-blue-400/25 to-transparent",
    icon: "bg-blue-400/20 text-blue-100 ring-1 ring-inset ring-blue-200/30",
    text: "text-blue-100"
  },
  cyan: {
    glow: "from-cyan-400/25 to-transparent",
    icon: "bg-cyan-400/20 text-cyan-100 ring-1 ring-inset ring-cyan-200/30",
    text: "text-cyan-100"
  },
  green: {
    glow: "from-accent-green/25 to-transparent",
    icon: "bg-accent-green/20 text-emerald-50 ring-1 ring-inset ring-accent-green/30",
    text: "text-emerald-50"
  },
  pink: {
    glow: "from-pink-400/25 to-transparent",
    icon: "bg-pink-400/20 text-pink-100 ring-1 ring-inset ring-pink-200/30",
    text: "text-pink-100"
  },
  purple: {
    glow: "from-accent-purple/25 to-transparent",
    icon: "bg-accent-purple/20 text-violet-50 ring-1 ring-inset ring-accent-purple/30",
    text: "text-violet-50"
  },
  red: {
    glow: "from-red-400/25 to-transparent",
    icon: "bg-red-400/20 text-red-100 ring-1 ring-inset ring-red-200/30",
    text: "text-red-100"
  },
  yellow: {
    glow: "from-yellow-400/25 to-transparent",
    icon: "bg-yellow-300/20 text-amber-50 ring-1 ring-inset ring-yellow-100/30",
    text: "text-amber-50"
  }
};

function StatCard({ icon, label, value, color, trend }: StatCardProps) {
  const normalizedIcon = icon.trim().toLowerCase();
  const Icon = iconMap[normalizedIcon] ?? Leaf;
  const palette = colorMap[color.trim().toLowerCase()] ?? colorMap.green;

  return (
    <article className="surface-card card-hover group relative overflow-hidden p-5 sm:p-6">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${palette.glow} opacity-60 blur-2xl transition duration-300 group-hover:opacity-90`} />

      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300/85">
            {label}
          </p>
          {trend ? (
            <p className="mt-2 text-sm leading-6 text-slate-300/70">{trend}</p>
          ) : null}
        </div>
        <div className={`rounded-[1.1rem] p-3 shadow-[0_14px_28px_rgba(26,36,49,0.16)] ${palette.icon}`}>
          <Icon size={20} />
        </div>
      </div>

      <p
        className={`relative text-3xl font-heading font-extrabold tracking-tight sm:text-[2rem] ${palette.text}`}
      >
        {value}
      </p>
    </article>
  );
}

export default StatCard;
