"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import type { AttendanceHistoryRecord } from "@/services/attendance-history.service";

interface AtRiskStudentsProps { records: AttendanceHistoryRecord[]; today: Date; }

export default function AtRiskStudents({ records, today }: AtRiskStudentsProps) {
  const students = new Map<number, { id: number; name: string; phone: string | null; present: number; total: number; lastPresent: string | null }>();
  for (const record of records) {
    if (!record.student_id) continue;
    const current = students.get(record.student_id) ?? { id: record.student_id, name: record.student?.Name ?? `Student #${record.student_id}`, phone: record.student?.Phone ?? null, present: 0, total: 0, lastPresent: null };
    current.total += 1;
    if (record.status?.trim().toLowerCase() === "present") {
      current.present += 1;
      if (record.date && (!current.lastPresent || record.date > current.lastPresent)) current.lastPresent = record.date;
    }
    students.set(record.student_id, current);
  }
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const risks = [...students.values()].map((student) => {
    const rate = student.total ? Math.round(student.present / student.total * 100) : 0;
    const daysAway = student.lastPresent ? Math.floor((todayMs - new Date(`${student.lastPresent}T00:00:00`).getTime()) / 86400000) : 999;
    const reason = daysAway >= 7 ? `No attendance for ${daysAway === 999 ? "this month" : `${daysAway} days`}` : `Low attendance rate (${rate}%)`;
    return { ...student, rate, daysAway, reason };
  }).filter((student) => student.daysAway >= 7 || student.rate < 50).sort((a,b) => b.daysAway-a.daysAway || a.rate-b.rate).slice(0,6);

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-rose-100 p-2 text-rose-700"><AlertTriangle className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold">At-Risk Students</h2><p className="text-sm text-muted-foreground">Students with low attendance or no recent present record.</p></div></div>
      <div className="mt-5 space-y-3">
        {risks.length ? risks.map((student) => <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/40 p-3"><div className="min-w-0"><div className="truncate font-medium">{student.name}</div><div className="text-xs text-rose-700">{student.reason}</div></div><Link href={`/students/${student.id}`} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">View <ArrowUpRight className="h-4 w-4" /></Link></div>) : <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No at-risk students found in this month&apos;s attendance records.</div>}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Risk analysis uses attendance records available for the current month.</p>
    </section>
  );
}
