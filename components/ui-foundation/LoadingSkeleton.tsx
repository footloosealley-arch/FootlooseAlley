import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export default function LoadingSkeleton({ rows = 4, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} aria-label="Loading" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-border/60 bg-card p-4">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="mt-3 h-3 w-2/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
