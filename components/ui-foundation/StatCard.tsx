import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  helperText?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  helperText,
  icon: Icon,
  trend,
  trendLabel,
  className,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>

      {(helperText || trendLabel) ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {trendLabel ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold",
                trend === "up" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                trend === "down" && "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                (!trend || trend === "neutral") && "bg-muted text-muted-foreground",
              )}
            >
              <TrendIcon className="size-3.5" aria-hidden="true" />
              {trendLabel}
            </span>
          ) : null}
          {helperText ? <span className="text-muted-foreground">{helperText}</span> : null}
        </div>
      ) : null}
    </article>
  );
}
