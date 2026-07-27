import WidgetCard from "./WidgetCard";
import EmptyState from "@/components/common/EmptyState";

import type { Student } from "@/types/database";

interface BirthdayCardProps {
  birthdays: Student[];
}

export default function BirthdayCard({
  birthdays,
}: BirthdayCardProps) {
  return (
    <WidgetCard
      title="Today's Birthdays"
      description="Celebrate your students"
    >
      {birthdays.length === 0 ? (
        <EmptyState
          title="No Birthdays Today"
          description="There are no student birthdays today."
        />
      ) : (
        <div className="space-y-3">
          {birthdays.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">
                  {student.Name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {student.Phone}
                </p>
              </div>

              <div className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
                🎂 Birthday
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
