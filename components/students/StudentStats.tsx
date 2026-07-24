"use client";

import {
  IndianRupee,
  Wallet,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Clock3,
} from "lucide-react";

type Props = {
  totalFees: number;
  totalPaid: number;
  pendingFees: number;
  attendancePercentage: number;
  nextDueDate: string | null;
  feeStatus: string | null;
};

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow border">
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
          className={`rounded-xl p-4 ${color}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

export default function StudentStats({
  totalFees,
  totalPaid,
  pendingFees,
  attendancePercentage,
  nextDueDate,
  feeStatus,
}: Props) {
  function getStatusColor() {
    switch (feeStatus) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Due Soon":
        return "bg-yellow-100 text-yellow-700";

      case "Overdue":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Fees"
          value={`₹${totalFees}`}
          icon={<IndianRupee size={28} />}
          color="bg-purple-100 text-purple-700"
        />

        <StatCard
          title="Total Paid"
          value={`₹${totalPaid}`}
          icon={<Wallet size={28} />}
          color="bg-green-100 text-green-700"
        />

        <StatCard
          title="Outstanding"
          value={`₹${pendingFees}`}
          icon={<AlertTriangle size={28} />}
          color="bg-red-100 text-red-700"
        />

        <StatCard
          title="Attendance"
          value={`${attendancePercentage}%`}
          icon={<CheckCircle2 size={28} />}
          color="bg-blue-100 text-blue-700"
        />

      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow">

        <div className="grid gap-6 md:grid-cols-2">

          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
              <CalendarDays size={24} />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Next Due Date
              </p>

              <h3 className="text-lg font-bold">
                {nextDueDate
                  ? new Date(nextDueDate).toLocaleDateString()
                  : "-"}
              </h3>

            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-slate-100 p-3">
              <Clock3 size={24} />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Fee Status
              </p>

              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor()}`}
              >
                {feeStatus ?? "-"}
              </span>

            </div>

          </div>

        </div>

      </div>

    </>
  );
}