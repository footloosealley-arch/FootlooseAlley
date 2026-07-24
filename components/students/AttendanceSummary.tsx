"use client";

import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  TrendingUp,
} from "lucide-react";

export type Attendance = {
  id: number;
  date: string;
  status: string;
};

type Props = {
  attendance: Attendance[];
  lastAttendance: string | null;
};

export default function AttendanceSummary({
  attendance,
  lastAttendance,
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

  const total = attendance.length;

  const percentage =
    total === 0
      ? 0
      : Math.round((present / total) * 100);

  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold">
            Attendance
          </h2>

          <p className="text-slate-500">
            Student attendance overview
          </p>

        </div>

        <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
          <CalendarCheck size={28} />
        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-4">

        <Card
          title="Present"
          value={present}
          color="green"
          icon={<CheckCircle2 size={22} />}
        />

        <Card
          title="Absent"
          value={absent}
          color="red"
          icon={<XCircle size={22} />}
        />

        <Card
          title="Late"
          value={late}
          color="yellow"
          icon={<Clock3 size={22} />}
        />

        <Card
          title="Attendance"
          value={`${percentage}%`}
          color="blue"
          icon={<TrendingUp size={22} />}
        />

      </div>

      <div className="mt-8">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-sm text-slate-500">
            Attendance Percentage
          </span>

          <span className="font-semibold">
            {percentage}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      <div className="mt-8 rounded-xl border bg-slate-50 p-5">

        <p className="text-sm text-slate-500">
          Last Attendance
        </p>

        <h3 className="mt-2 text-lg font-bold">

          {lastAttendance
            ? new Date(
                lastAttendance
              ).toLocaleDateString()
            : "No attendance recorded"}

        </h3>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  color:
    | "green"
    | "red"
    | "yellow"
    | "blue";
  icon: React.ReactNode;
}) {
  const styles = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="rounded-xl border p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>

        </div>

        <div
          className={`rounded-xl p-3 ${styles[color]}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}