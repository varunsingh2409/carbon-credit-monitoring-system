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
    icon: "bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/25",
    text: "text-blue-300"
  },
  cyan: {
    glow: "from-cyan-400/25 to-transparent",
    icon: "bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-400/25",
    text: "text-cyan-300"
  },
  green: {
    glow: "from-accent-green/25 to-transparent",
    icon: "bg-accent-green/15 text-accent-green ring-1 ring-inset ring-accent-green/25",
    text: "text-accent-green"
  },
  pink: {
    glow: "from-pink-400/25 to-transparent",
    icon: "bg-pink-500/15 text-pink-300 ring-1 ring-inset ring-pink-400/25",
    text: "text-pink-300"
  },
  purple: {
    glow: "from-accent-purple/25 to-transparent",
    icon: "bg-accent-purple/15 text-accent-purple ring-1 ring-inset ring-accent-purple/25",
    text: "text-accent-purple"
  },
  red: {
    glow: "from-red-400/25 to-transparent",
    icon: "bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-400/25",
    text: "text-red-300"
  },
  yellow: {
    glow: "from-yellow-400/25 to-transparent",
    icon: "bg-yellow-500/15 text-yellow-300 ring-1 ring-inset ring-yellow-400/25",
    text: "text-yellow-300"
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            {label}
          </p>
          {trend ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">{trend}</p>
          ) : null}
        </div>
        <div className={`rounded-[1.1rem] p-3 shadow-[0_14px_28px_rgba(4,9,20,0.2)] ${palette.icon}`}>
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
