import { Activity, CircleDollarSign, UserCheck, Users } from "lucide-react";

import WidgetCard from "./WidgetCard";
import type { DashboardStats } from "@/types/database";
import type { DashboardCommandSummary } from "@/services/dashboard.service";

interface StudioSnapshotProps {
  stats: DashboardStats;
  commandSummary: DashboardCommandSummary;
}

function percentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

interface SnapshotRowProps {
  label: string;
  value: string;
  progress: number;
  icon: typeof Users;
}

function SnapshotRow({ label, value, progress, icon: Icon }: SnapshotRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
        <span className="text-sm font-semibold">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function StudioSnapshot({ stats, commandSummary }: StudioSnapshotProps) {
  const activeRate = percentage(stats.activeStudents, stats.totalStudents);
  const attendanceRate = percentage(commandSummary.todayPresent, stats.activeStudents);
  const actionLoad = Math.min(100, commandSummary.urgentTasks * 12.5);
  const duePressure = stats.monthRevenue + stats.feesDue > 0
    ? percentage(stats.feesDue, stats.monthRevenue + stats.feesDue)
    : 0;

  return (
    <WidgetCard
      title="Studio Snapshot"
      description="A quick health check of daily studio operations"
    >
      <div className="space-y-5">
        <SnapshotRow
          label="Active student rate"
          value={`${activeRate}%`}
          progress={activeRate}
          icon={Users}
        />
        <SnapshotRow
          label="Today's attendance"
          value={`${commandSummary.todayPresent} present`}
          progress={attendanceRate}
          icon={UserCheck}
        />
        <SnapshotRow
          label="Outstanding fee pressure"
          value={`${duePressure}%`}
          progress={duePressure}
          icon={CircleDollarSign}
        />
        <SnapshotRow
          label="Urgent action load"
          value={`${commandSummary.urgentTasks} tasks`}
          progress={actionLoad}
          icon={Activity}
        />
      </div>
    </WidgetCard>
  );
}
