"use client";

import { format, getDay, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { AttendanceHistoryRecord } from "@/services/attendance-history.service";

interface AttendanceCalendarProps {
  records: AttendanceHistoryRecord[];
  month: Date;
}

function statusTone(present: number, absent: number, leave: number) {
  const total = present + absent + leave;
  if (total === 0) return "border-dashed bg-muted/20 text-muted-foreground";
  const rate = present / total;
  if (rate >= 0.75) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (rate >= 0.5) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-rose-200 bg-rose-50 text-rose-800";
}

export default function AttendanceCalendar({ records, month }: AttendanceCalendarProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOffset = getDay(new Date(year, monthIndex, 1));

  const byDate = new Map<string, { present: number; absent: number; leave: number }>();
  for (const record of records) {
    if (!record.date) continue;
    const status = record.status?.trim().toLowerCase();
    const current = byDate.get(record.date) ?? { present: 0, absent: 0, leave: 0 };
    if (status === "present") current.present += 1;
    else if (status === "absent") current.absent += 1;
    else if (status === "leave" || status === "on leave") current.leave += 1;
    byDate.set(record.date, current);
  }

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary"><CalendarDays className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-semibold">Monthly Attendance Calendar</h2>
          <p className="text-sm text-muted-foreground">Daily attendance health for {format(month, "MMMM yyyy")}.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <div key={day} className="py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, index) => <div key={`empty-${index}`} className="min-h-20" />)}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateKey = format(new Date(year, monthIndex, day), "yyyy-MM-dd");
          const stats = byDate.get(dateKey) ?? { present: 0, absent: 0, leave: 0 };
          return (
            <div key={dateKey} title={`${dateKey}: ${stats.present} present, ${stats.absent} absent, ${stats.leave} leave`} className={`min-h-20 rounded-lg border p-2 ${statusTone(stats.present, stats.absent, stats.leave)}`}>
              <div className="text-sm font-semibold">{day}</div>
              {(stats.present + stats.absent + stats.leave) > 0 && (
                <div className="mt-2 space-y-0.5 text-[10px] leading-tight">
                  <div>{stats.present} present</div>
                  {stats.absent > 0 && <div>{stats.absent} absent</div>}
                  {stats.leave > 0 && <div>{stats.leave} leave</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>Green: 75%+ present</span><span>Amber: 50–74%</span><span>Red: below 50%</span>
      </div>
    </section>
  );
}
