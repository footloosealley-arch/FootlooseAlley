import type { Attendance } from "@/types/attendance";

type Props = {
  attendance: Attendance[];
};

export default function AttendanceSummary({
  attendance,
}: Props) {
  const present = attendance.filter(
    (a) => a.status === "Present"
  ).length;

  const absent = attendance.filter(
    (a) => a.status === "Absent"
  ).length;

  const late = attendance.filter(
    (a) => a.status === "Late"
  ).length;

  const leave = attendance.filter(
    (a) => a.status === "Leave"
  ).length;

  const percentage =
    attendance.length === 0
      ? 0
      : Math.round((present / attendance.length) * 100);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">

      <h2 className="mb-6 text-2xl font-bold">
        Attendance Summary
      </h2>

      <div className="grid grid-cols-2 gap-5">

        <div>
          <p className="text-slate-500">Present</p>
          <p className="text-2xl font-bold text-green-600">
            {present}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Absent</p>
          <p className="text-2xl font-bold text-red-600">
            {absent}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Late</p>
          <p className="text-2xl font-bold text-yellow-600">
            {late}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Leave</p>
          <p className="text-2xl font-bold text-blue-600">
            {leave}
          </p>
        </div>

      </div>

      <div className="mt-8 border-t pt-5">

        <p className="text-slate-500">
          Attendance %
        </p>

        <p className="text-4xl font-bold text-indigo-600">
          {percentage}%
        </p>

      </div>

    </div>
  );
}