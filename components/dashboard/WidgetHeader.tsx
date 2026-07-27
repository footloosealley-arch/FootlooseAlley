import { ReactNode } from "react";

interface WidgetHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function WidgetHeader({
  title,
  subtitle,
  action,
}: WidgetHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}