interface LoadingCardProps {
  title?: string;
  lines?: number;
}

export default function LoadingCard({
  title = "Loading...",
  lines = 3,
}: LoadingCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 rounded bg-muted" />

        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className="h-4 rounded bg-muted"
            />
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {title}
        </p>
      </div>
    </div>
  );
}