import type { LucideIcon } from "lucide-react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: LucideIcon;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export default function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("space-y-0", className)}>
      {items.map((item, index) => {
        const Icon = item.icon ?? Circle;
        const isLast = index === items.length - 1;

        return (
          <li key={item.id} className="relative grid grid-cols-[2rem_1fr] gap-3 pb-6 last:pb-0">
            {!isLast ? (
              <span className="absolute left-[0.9375rem] top-8 h-[calc(100%-1rem)] w-px bg-border" />
            ) : null}
            <span className="relative z-10 flex size-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.date ? <time className="shrink-0 text-xs text-muted-foreground">{item.date}</time> : null}
              </div>
              {item.description ? (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
