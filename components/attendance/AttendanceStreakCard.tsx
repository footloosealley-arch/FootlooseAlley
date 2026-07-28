"use client";

import { Flame } from "lucide-react";
import type { AttendanceHistoryRecord } from "@/services/attendance-history.service";

interface AttendanceStreakCardProps { records: AttendanceHistoryRecord[]; }

type StudentStats = { id: number; name: string; dates: string[]; };

function longestConsecutiveRun(dates: string[]) {
  const unique = [...new Set(dates)].sort();
  let longest = 0; let current = 0; let previous: Date | null = null;
  for (const value of unique) {
    const date = new Date(`${value}T00:00:00`);
    if (previous && Math.round((date.getTime() - previous.getTime()) / 86400000) === 1) current += 1;
    else current = 1;
    longest = Math.max(longest, current); previous = date;
  }
  return longest;
}

export default function AttendanceStreakCard({ records }: AttendanceStreakCardProps) {
  const students = new Map<number, StudentStats>();
  for (const record of records) {
    if (!record.student_id || !record.date || record.status?.trim().toLowerCase() !== "present") continue;
    const current = students.get(record.student_id) ?? { id: record.student_id, name: record.student?.Name ?? `Student #${record.student_id}`, dates: [] };
    current.dates.push(record.date); students.set(record.student_id, current);
  }
  const leaders = [...students.values()].map((student) => ({ ...student, streak: longestConsecutiveRun(student.dates), attended: new Set(student.dates).size })).sort((a,b) => b.streak-a.streak || b.attended-a.attended).slice(0,5);

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-orange-100 p-2 text-orange-700"><Flame className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold">Attendance Streak Leaders</h2><p className="text-sm text-muted-foreground">Longest consecutive present-day runs this month.</p></div></div>
      <div className="mt-5 space-y-3">
        {leaders.length ? leaders.map((student, index) => <div key={student.id} className="flex items-center justify-between rounded-xl border p-3"><div className="min-w-0"><div className="font-medium">#{index + 1} {student.name}</div><div className="text-xs text-muted-foreground">{student.attended} attended days</div></div><div className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">{student.streak} day{student.streak === 1 ? "" : "s"}</div></div>) : <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No present records available for streak analysis.</div>}
      </div>
    </section>
  );
}
