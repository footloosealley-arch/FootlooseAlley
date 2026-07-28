"use client";

import { BarChart3 } from "lucide-react";
import type { AttendanceHistoryRecord } from "@/services/attendance-history.service";

interface AttendanceAnalyticsProps { records: AttendanceHistoryRecord[]; }

export default function AttendanceAnalytics({ records }: AttendanceAnalyticsProps) {
  const classes = new Map<string, { present: number; total: number }>();
  for (const record of records) {
    const name = record.studio_class?.class_name ?? record.session_name ?? "Unassigned class";
    const current = classes.get(name) ?? { present: 0, total: 0 };
    current.total += 1;
    if (record.status?.trim().toLowerCase() === "present") current.present += 1;
    classes.set(name, current);
  }
  const rows = [...classes.entries()].map(([name, value]) => ({ name, ...value, rate: value.total ? Math.round(value.present / value.total * 100) : 0 })).sort((a,b) => b.total-a.total).slice(0,6);

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary"><BarChart3 className="h-5 w-5" /></div>
        <div><h2 className="text-lg font-semibold">Class Attendance</h2><p className="text-sm text-muted-foreground">Top classes by marked attendance in the selected month.</p></div>
      </div>
      <div className="mt-5 space-y-4">
        {rows.length ? rows.map((row) => (
          <div key={row.name}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium">{row.name}</span><span className="text-muted-foreground">{row.present}/{row.total} · {row.rate}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${row.rate}%` }} /></div>
          </div>
        )) : <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No class attendance data for this month.</div>}
      </div>
    </section>
  );
}
