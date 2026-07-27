import WidgetCard from "./WidgetCard";

import type { DashboardStats } from "@/types/database";

interface AttendanceCardProps {
  stats: DashboardStats;
}

export default function AttendanceCard({
  stats,
}: AttendanceCardProps) {
  const present = stats.todayAttendance;
  const activeStudents = stats.activeStudents;

  const absent = Math.max(
    activeStudents - present,
    0
  );

  const percentage =
    activeStudents > 0
      ? Math.round(
          (present / activeStudents) * 100
        )
      : 0;

  return (
    <WidgetCard
      title="Today's Attendance"
      description="Student attendance overview"
    >
      <div className="space-y-6">
        <div>
          <p className="text-4xl font-bold">
            {present}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Students Present Today
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm">
              Attendance
            </span>

            <span className="text-sm font-medium">
              {percentage}%
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t pt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Active
            </p>

            <p className="text-xl font-semibold">
              {activeStudents}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Present
            </p>

            <p className="text-xl font-semibold text-green-600">
              {present}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Absent
            </p>

            <p className="text-xl font-semibold text-red-600">
              {absent}
            </p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}