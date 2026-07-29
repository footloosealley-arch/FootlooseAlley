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
    shell: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50",
    icon: "bg-emerald-100 text-emerald-700",
    label: "text-emerald-700",
    value: "text-emerald-950",
  },
  blue: {
    shell: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50",
    icon: "bg-blue-100 text-blue-700",
    label: "text-blue-700",
    value: "text-blue-950",
  },
  amber: {
    shell: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50",
    icon: "bg-amber-100 text-amber-700",
    label: "text-amber-700",
    value: "text-amber-950",
  },
  violet: {
    shell: "border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50",
    icon: "bg-violet-100 text-violet-700",
    label: "text-violet-700",
    value: "text-violet-950",
  },
  rose: {
    shell: "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-red-50",
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
    <div className={`group rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${styles.shell}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${styles.label}`}>{title}</p>
          <p className={`mt-2 truncate text-3xl font-bold tracking-tight ${styles.value}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-2.5 shadow-sm transition group-hover:scale-110 ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`mt-3 text-xs ${styles.label}`}>{description}</p>
    </div>
  );
}
