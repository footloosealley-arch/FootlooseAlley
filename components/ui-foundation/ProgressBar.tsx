import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  label?: string;
  helperText?: string;
  showValue?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  helperText,
  showValue = true,
  className,
}: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          {label ? <span className="font-medium">{label}</span> : <span />}
          {showValue ? <span className="font-semibold text-muted-foreground">{Math.round(safeValue)}%</span> : null}
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${safeValue}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(safeValue)}
        />
      </div>
      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  );
}
