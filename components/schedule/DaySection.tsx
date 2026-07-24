import ScheduleCard from "./ScheduleCard";
import type { Schedule } from "@/types/schedule";

type Props = {
  day: string;
  schedules: Schedule[];
};

export default function DaySection({
  day,
  schedules,
}: Props) {
  if (schedules.length === 0) return null;

  const sortedSchedules = [...schedules].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  return (
    <section className="space-y-4">
      <div className="sticky top-0 z-10 rounded-xl bg-indigo-600 px-5 py-3 shadow">
        <h2 className="text-xl font-bold text-white">
          {day}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedSchedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
          />
        ))}
      </div>
    </section>
  );
}