import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
