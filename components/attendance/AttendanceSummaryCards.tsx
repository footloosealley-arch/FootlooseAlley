import {
  CalendarCheck2,
  CircleSlash2,
  Clock3,
  Percent,
  Users,
} from "lucide-react";

export type AttendanceSummary = {
  totalMarked: number;
  present: number;
  absent: number;
  leave: number;
  attendanceRate: number;
};

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary;
}

const cards = [
  {
    key: "totalMarked" as const,
    label: "Marked Today",
    description: "Total attendance entries",
    icon: Users,
  },
  {
    key: "present" as const,
    label: "Present",
    description: "Students who attended",
    icon: CalendarCheck2,
  },
  {
    key: "absent" as const,
    label: "Absent",
    description: "Students marked absent",
    icon: CircleSlash2,
  },
  {
    key: "leave" as const,
    label: "On Leave",
    description: "Approved leave entries",
    icon: Clock3,
  },
];

export default function AttendanceSummaryCards({
  summary,
}: AttendanceSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {summary[card.key]}
                </p>
              </div>

              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        );
      })}

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {summary.attendanceRate}%
            </p>
          </div>

          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min(
                Math.max(summary.attendanceRate, 0),
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
