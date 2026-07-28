"use client";

import { BarChart3, Users } from "lucide-react";
import { useMemo } from "react";

import type { AttendanceHistoryRecord } from "@/services/attendance-history.service";

type Props = { records: AttendanceHistoryRecord[] };

function normalize(value: string | null) { return value?.trim().toLowerCase() ?? ""; }

export default function ClassAttendanceView({ records }: Props) {
  const rows = useMemo(() => {
    const map = new Map<string, { name: string; present: number; absent: number; leave: number; total: number }>();
    for (const record of records) {
      const name = record.studio_class?.class_name || record.studio_class?.program || record.session_name || "Unassigned class";
      const current = map.get(name) ?? { name, present: 0, absent: 0, leave: 0, total: 0 };
      const value = normalize(record.status);
      current.total += 1;
      if (value === "present") current.present += 1;
      else if (value === "absent") current.absent += 1;
      else if (value === "leave" || value === "on leave") current.leave += 1;
      map.set(name, current);
    }
    return [...map.values()].map((row) => ({ ...row, rate: row.total ? Math.round((row.present / row.total) * 100) : 0 })).sort((a,b) => b.rate - a.rate || b.total - a.total);
  }, [records]);

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 font-semibold"><BarChart3 className="h-5 w-5 text-primary" />Class Performance</h2>
        <p className="mt-1 text-sm text-muted-foreground">Attendance rate by class for the selected dashboard period.</p>
      </div>
      {rows.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed text-center text-sm text-muted-foreground"><Users className="mb-2 h-7 w-7"/>No class attendance data is available.</div>
      ) : (
        <div className="space-y-4">
          {rows.slice(0, 8).map((row) => (
            <div key={row.name}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium">{row.name}</span><span className="shrink-0 font-semibold">{row.rate}%</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${row.rate}%` }}/></div>
              <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground"><span>{row.present} present</span><span>{row.absent} absent</span><span>{row.leave} leave</span><span>{row.total} marked</span></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
