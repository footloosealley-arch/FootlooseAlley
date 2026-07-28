import type { LucideIcon } from "lucide-react";

interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: "emerald" | "blue" | "amber" | "violet" | "rose";
}

const toneClasses = {
  emerald: {
    shell: "border-emerald-200 bg-emerald-50/70",
    icon: "bg-emerald-100 text-emerald-700",
    label: "text-emerald-700",
    value: "text-emerald-950",
  },
  blue: {
    shell: "border-blue-200 bg-blue-50/70",
    icon: "bg-blue-100 text-blue-700",
    label: "text-blue-700",
    value: "text-blue-950",
  },
  amber: {
    shell: "border-amber-200 bg-amber-50/70",
    icon: "bg-amber-100 text-amber-700",
    label: "text-amber-700",
    value: "text-amber-950",
  },
  violet: {
    shell: "border-violet-200 bg-violet-50/70",
    icon: "bg-violet-100 text-violet-700",
    label: "text-violet-700",
    value: "text-violet-950",
  },
  rose: {
    shell: "border-rose-200 bg-rose-50/70",
    icon: "bg-rose-100 text-rose-700",
    label: "text-rose-700",
    value: "text-rose-950",
  },
} as const;

export default function DashboardKpiCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
}: DashboardKpiCardProps) {
  const styles = toneClasses[tone];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles.shell}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${styles.label}`}>{title}</p>
          <p className={`mt-2 truncate text-3xl font-bold tracking-tight ${styles.value}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-2.5 ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`mt-3 text-xs ${styles.label}`}>{description}</p>
    </div>
  );
}
