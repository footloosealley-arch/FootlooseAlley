"use client";

import { eachDayOfInterval, format, startOfWeek, subWeeks } from "date-fns";
import { CalendarRange } from "lucide-react";
import { useMemo } from "react";

import type { AttendanceHistoryRecord } from "@/services/attendance-history.service";

type Props = { records: AttendanceHistoryRecord[]; today: Date };

function status(value: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function cellClass(rate: number | null) {
  if (rate === null) return "bg-muted";
  if (rate >= 85) return "bg-emerald-500";
  if (rate >= 65) return "bg-lime-500";
  if (rate >= 45) return "bg-amber-400";
  return "bg-rose-500";
}

export default function AttendanceHeatmap({ records, today }: Props) {
  const days = useMemo(() => {
    const start = startOfWeek(subWeeks(today, 11), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: today }).map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const dayRecords = records.filter((record) => record.date === key);
      const present = dayRecords.filter((record) => status(record.status) === "present").length;
      const marked = dayRecords.length;
      return {
        key,
        label: format(day, "dd MMM yyyy"),
        rate: marked ? Math.round((present / marked) * 100) : null,
        marked,
      };
    });
  }, [records, today]);

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-semibold"><CalendarRange className="h-5 w-5 text-primary" />12-Week Attendance Heatmap</h2>
          <p className="mt-1 text-sm text-muted-foreground">A quick view of daily attendance health across the studio.</p>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <span>Low</span><span className="h-3 w-3 rounded-sm bg-rose-500"/><span className="h-3 w-3 rounded-sm bg-amber-400"/><span className="h-3 w-3 rounded-sm bg-lime-500"/><span className="h-3 w-3 rounded-sm bg-emerald-500"/><span>High</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 sm:grid-cols-14 lg:grid-cols-21">
        {days.map((day) => (
          <div
            key={day.key}
            title={`${day.label}: ${day.rate === null ? "No attendance marked" : `${day.rate}% (${day.marked} records)`}`}
            className={`aspect-square min-h-5 rounded-md ${cellClass(day.rate)} ring-1 ring-black/5`}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Hover a square to see the date and attendance rate. Grey means no attendance was marked.</p>
    </section>
  );
}
