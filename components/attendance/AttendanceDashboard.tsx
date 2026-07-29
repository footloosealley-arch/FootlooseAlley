"use client";

import { useLatestAsync } from "@/hooks/useLatestAsync";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { eachDayOfInterval, format, startOfDay, startOfMonth, subDays } from "date-fns";

import AttendanceAnalytics from "@/components/attendance/AttendanceAnalytics";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import AttendanceHeatmap from "@/components/attendance/AttendanceHeatmap";
import AttendanceReportExport from "@/components/attendance/AttendanceReportExport";
import ClassAttendanceView from "@/components/attendance/ClassAttendanceView";
import AttendanceRegister from "@/components/attendance/AttendanceRegister";
import AttendanceStreakCard from "@/components/attendance/AttendanceStreakCard";
import AttendanceSummaryCards, { type AttendanceSummary } from "@/components/attendance/AttendanceSummaryCards";
import AttendanceTrendChart, { type AttendanceTrendPoint } from "@/components/attendance/AttendanceTrendChart";
import AttendanceRiskFollowUps from "@/components/attendance/AttendanceRiskFollowUps";
import TodayAttendanceTable from "@/components/attendance/TodayAttendanceTable";
import { Button } from "@/components/ui/button";
import { attendanceHistoryService, type AttendanceHistoryRecord } from "@/services/attendance-history.service";

function getDateKey(date: Date) { return format(date, "yyyy-MM-dd"); }
function normalizeStatus(status: string | null) { return status?.trim().toLowerCase() ?? ""; }

export default function AttendanceDashboard() {
  const [records, setRecords] = useState<AttendanceHistoryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = getDateKey(today);
  const monthStart = useMemo(() => startOfMonth(today), [today]);
  const weekStart = useMemo(() => subDays(today, 6), [today]);

  const fetchDashboard = useCallback(() =>
    attendanceHistoryService.getHistory({ startDate: getDateKey(monthStart), endDate: todayKey }),
    [monthStart, todayKey]
  );
  const commitDashboard = useCallback((history: AttendanceHistoryRecord[]) => {
    setRecords(history);
    setError(null);
  }, []);
  const handleDashboardError = useCallback((loadError: unknown) => {
    console.error("Attendance dashboard loading failed:", loadError);
    setError(loadError instanceof Error ? loadError.message : "Unable to load attendance intelligence.");
  }, []);
  const { loading, refresh: loadDashboard } = useLatestAsync({
    fetchData: fetchDashboard,
    onSuccess: commitDashboard,
    onError: handleDashboardError,
  });

  const todayRecords = useMemo(() => records.filter((record) => record.date === todayKey), [records, todayKey]);
  const summary = useMemo<AttendanceSummary>(() => {
    const present = todayRecords.filter((record) => normalizeStatus(record.status) === "present").length;
    const absent = todayRecords.filter((record) => normalizeStatus(record.status) === "absent").length;
    const leave = todayRecords.filter((record) => ["leave", "on leave"].includes(normalizeStatus(record.status))).length;
    const totalMarked = todayRecords.length;
    return { totalMarked, present, absent, leave, attendanceRate: totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0 };
  }, [todayRecords]);

  const trend = useMemo<AttendanceTrendPoint[]>(() => eachDayOfInterval({ start: weekStart, end: today }).map((day) => {
    const date = getDateKey(day);
    const dayRecords = records.filter((record) => record.date === date);
    return {
      date,
      label: format(day, "EEE"),
      present: dayRecords.filter((record) => normalizeStatus(record.status) === "present").length,
      absent: dayRecords.filter((record) => normalizeStatus(record.status) === "absent").length,
      leave: dayRecords.filter((record) => ["leave", "on leave"].includes(normalizeStatus(record.status))).length,
    };
  }), [records, today, weekStart]);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Activity className="h-6 w-6" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight md:text-3xl">Attendance Intelligence</h1><p className="mt-1 text-sm text-muted-foreground">Monitor daily attendance, monthly patterns, student streaks, and retention risks.</p></div>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadDashboard()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Refresh dashboard
        </Button>
      </header>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border bg-card"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading attendance intelligence...</div></div>
      ) : (
        <>
          <AttendanceSummaryCards summary={summary} />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"><AttendanceTrendChart data={trend} /><TodayAttendanceTable records={todayRecords} /></div>
          <AttendanceCalendar records={records} month={today} />
          <AttendanceHeatmap records={records} today={today} />
          <AttendanceRiskFollowUps />
          <div className="grid gap-6 xl:grid-cols-2"><AttendanceAnalytics records={records} /><ClassAttendanceView records={records} /></div>
          <AttendanceStreakCard records={records} />
          <AttendanceReportExport records={records} />
        </>
      )}

      <section className="space-y-3 border-t pt-8">
        <div><h2 className="text-xl font-semibold">Daily Attendance Register</h2><p className="text-sm text-muted-foreground">Mark, update, and save attendance for a selected class.</p></div>
        <AttendanceRegister />
      </section>
    </div>
  );
}
