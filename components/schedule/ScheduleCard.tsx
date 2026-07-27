import {
  Clock,
  User,
  Users,
  BookOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import type { Schedule } from "@/types/schedule";

type Props = {
  schedule: Schedule;
};

export default function ScheduleCard({
  schedule,
}: Props) {
  const statusActive = schedule.status === "Active";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {schedule.class_name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {schedule.program}
          </p>
        </div>

        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
            statusActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {statusActive ? (
            <CheckCircle2 size={14} />
          ) : (
            <XCircle size={14} />
          )}

          {schedule.status}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm text-slate-600">

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-indigo-600" />

          <span>
            {schedule.start_time} - {schedule.end_time}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <User size={16} className="text-indigo-600" />

          <span>
            {schedule.instructor || "Instructor not assigned"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-600" />

          <span>{schedule.program}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users size={16} className="text-indigo-600" />

          <span>
            Capacity: {schedule.capacity}
          </span>
        </div>

      </div>
    </div>
  );
}