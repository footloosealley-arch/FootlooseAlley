import DaySection from "./DaySection";
import type { Schedule } from "@/types/schedule";

type Props = {
  schedules: Schedule[];
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ScheduleList({
  schedules,
}: Props) {
  if (schedules.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700">
          No Classes Scheduled
        </h2>

        <p className="mt-2 text-slate-500">
          Add your first class using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {DAYS.map((day) => {
        const daySchedules = schedules.filter(
          (schedule) => schedule.day === day
        );

        if (daySchedules.length === 0) return null;

        return (
          <DaySection
            key={day}
            day={day}
            schedules={daySchedules}
          />
        );
      })}
    </div>
  );
}