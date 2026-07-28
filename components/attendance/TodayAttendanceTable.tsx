"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type { AttendanceHistoryRecord } from "@/services/attendance-history.service";

interface TodayAttendanceTableProps {
  records: AttendanceHistoryRecord[];
}

function getStatusClass(status: string | null) {
  const normalized = status?.trim().toLowerCase();

  if (normalized === "present") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (normalized === "absent") {
    return "bg-red-500/10 text-red-700 dark:text-red-300";
  }

  return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

function formatTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const timePart = value.includes("T") ? value.split("T")[1] : value;
  return timePart.slice(0, 5);
}

export default function TodayAttendanceTable({
  records,
}: TodayAttendanceTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus =
        status === "All" || record.status?.toLowerCase() === status.toLowerCase();

      const searchable = [
        record.student?.Name,
        record.student?.Phone,
        record.student?.student_code,
        record.student?.Program,
        record.studio_class?.class_name,
        record.session_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [records, search, status]);

  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Today&apos;s Attendance</h2>
          <p className="text-sm text-muted-foreground">
            Review today&apos;s marked attendance across all classes.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student or class"
              className="pl-9"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option>All</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Leave</option>
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No attendance records match the current filters.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {record.student?.Name || "Unknown student"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.student?.student_code || record.student?.Phone || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {record.studio_class?.class_name || record.session_name || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          record.status
                        )}`}
                      >
                        {record.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {formatTime(record.check_in_time || record.marked_at)}
                    </td>
                    <td className="px-5 py-4">
                      {record.instructor?.name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y md:hidden">
            {filteredRecords.map((record) => (
              <article key={record.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {record.student?.Name || "Unknown student"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.studio_class?.class_name || record.session_name || "No class"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                      record.status
                    )}`}
                  >
                    {record.status || "Unknown"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="mt-1 font-medium">
                      {formatTime(record.check_in_time || record.marked_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Instructor</p>
                    <p className="mt-1 font-medium">
                      {record.instructor?.name || "—"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
