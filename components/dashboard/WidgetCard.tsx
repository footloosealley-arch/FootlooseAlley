import { ReactNode } from "react";

interface WidgetCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function WidgetCard({
  title,
  description,
  action,
  children,
  className = "",
}: WidgetCardProps) {
  return (
    <div
      className={`
        rounded-xl
        border
        bg-card
        p-6
        shadow-sm
        transition-all
        hover:shadow-md
        ${className}
      `}
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div>
            {action}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}