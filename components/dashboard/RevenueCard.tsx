import WidgetCard from "./WidgetCard";

import type { DashboardStats } from "@/types/database";

interface RevenueCardProps {
  stats: DashboardStats;
}

export default function RevenueCard({
  stats,
}: RevenueCardProps) {
  return (
    <WidgetCard
      title="Revenue"
      description="Revenue collected this month"
    >
      <div className="space-y-6">
        <div>
          <p className="text-4xl font-bold">
            ₹{stats.monthRevenue.toLocaleString()}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Current month's collections
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Fees Due
            </p>

            <p className="text-xl font-semibold text-red-600">
              ₹{stats.feesDue.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Active Students
            </p>

            <p className="text-xl font-semibold">
              {stats.activeStudents}
            </p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}