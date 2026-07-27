import { ReactNode } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type DashboardCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  subtitle?: string;
};

export default function DashboardCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: DashboardCardProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="relative p-6">

        <div
          className={`absolute top-0 left-0 h-1 w-full ${color}`}
        />

        <div className="flex items-start justify-between">

          <div className="space-y-2">

            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <h2 className="text-4xl font-bold tracking-tight">
              {value}
            </h2>

            {subtitle && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                <TrendingUp className="h-4 w-4 text-green-500" />

                <span>{subtitle}</span>

              </div>
            )}

          </div>

          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${color}`}
          >
            {icon}
          </div>

        </div>

      </CardContent>
    </Card>
  );
}