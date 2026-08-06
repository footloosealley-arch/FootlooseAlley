"use client";

import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AttendanceHistoryRecord } from "@/services/attendance-history.service";

type Props = { records: AttendanceHistoryRecord[] };

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function formatAttendanceTime(value: string | null) {
  if (!value) return "";

  if (value.includes("T")) {
    const timestamp = new Date(value);
    if (!Number.isNaN(timestamp.getTime())) {
      return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(timestamp);
    }
  }

  const [hoursValue, minutesValue] = value.split(":");
  const hours = Number(hoursValue);
  const minutes = Number(minutesValue);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}

export default function AttendanceReportExport({ records }: Props) {
  function exportCsv() {
    const header = ["Date", "Student", "Student Code", "Phone", "Program", "Class", "Instructor", "Status", "Check In", "Remarks"];
    const rows = records.map((record) => [
      record.date,
      record.student?.Name,
      record.student?.student_code,
      record.student?.Phone,
      record.student?.Program,
      record.studio_class?.class_name || record.session_name,
      record.instructor?.name,
      record.status,
      formatAttendanceTime(record.marked_at || record.check_in_time),
      record.remarks,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `attendance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="flex items-center gap-2 font-semibold"><FileSpreadsheet className="h-5 w-5 text-primary" />Attendance Report Export</h2>
        <p className="mt-1 text-sm text-muted-foreground">Download the current dashboard records as a spreadsheet-ready CSV file.</p>
      </div>
      <Button type="button" onClick={exportCsv} disabled={records.length === 0}><Download className="mr-2 h-4 w-4"/>Export CSV</Button>
    </section>
  );
}
