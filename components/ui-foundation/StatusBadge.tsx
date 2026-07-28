import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

interface StatusBadgeProps {
  status: string | null | undefined;
  tone?: Tone;
  showDot?: boolean;
  className?: string;
}

const statusTone: Record<string, Tone> = {
  active: "success",
  present: "success",
  paid: "success",
  joined: "success",
  converted: "success",
  pending: "warning",
  "follow up": "warning",
  "follow-up": "warning",
  late: "warning",
  overdue: "danger",
  inactive: "neutral",
  absent: "danger",
  closed: "danger",
  cancelled: "danger",
  frozen: "info",
  trial: "primary",
  new: "info",
};

const toneStyles: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  danger: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary",
};

const dotStyles: Record<Tone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
};

export default function StatusBadge({
  status,
  tone,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const label = status?.trim() || "Unknown";
  const resolvedTone = tone ?? statusTone[label.toLowerCase()] ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneStyles[resolvedTone],
        className,
      )}
    >
      {showDot ? <span className={cn("size-1.5 rounded-full", dotStyles[resolvedTone])} /> : null}
      {label}
    </span>
  );
}
