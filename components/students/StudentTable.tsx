"use client";

import Link from "next/link";
import {
  CalendarClock,
  Eye,
  MessageCircle,
  Pencil,
  Phone,
  ReceiptIndianRupee,
} from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import LoadingCard from "@/components/common/LoadingCard";
import PrivateStudentPhoto from "@/components/students/PrivateStudentPhoto";
import type { Student } from "@/types/database";

interface StudentTableProps {
  students: Student[];
  loading?: boolean;
}

function getInitials(name: string | null | undefined) {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function getWhatsAppNumber(phone: string | null | undefined) {
  const cleaned = phone?.replace(/\D/g, "") ?? "";
  if (!cleaned) return "";
  return cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function daysRemaining(student: Student) {
  const value = student.membership_end_date ?? student.next_due_date;
  if (!value) return null;
  const end = new Date(`${value.slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
}

function membershipTone(status: string) {
  const value = status.toLowerCase();
  if (value.includes("frozen")) return "bg-sky-100 text-sky-700";
  if (value.includes("expir")) return "bg-amber-100 text-amber-700";
  if (value.includes("cancel") || value.includes("inactive")) return "bg-slate-100 text-slate-600";
  return "bg-emerald-100 text-emerald-700";
}

function feeTone(amount: number) {
  return amount > 0
    ? "bg-rose-100 text-rose-700"
    : "bg-emerald-100 text-emerald-700";
}

function Avatar({ student }: { student: Student }) {
  const fallback = (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary ring-1 ring-primary/10">
      {getInitials(student.Name)}
    </div>
  );

  return student.photo_url ? (
    <PrivateStudentPhoto
      path={student.photo_url}
      alt={student.Name ?? "Student"}
      className="h-12 w-12 rounded-2xl object-cover ring-1 ring-border"
      fallback={fallback}
    />
  ) : fallback;
}

function QuickActions({ student }: { student: Student }) {
  const whatsappNumber = getWhatsAppNumber(student.Phone);
  const actionClass = "inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link href={`/students/${student.id}`} className={actionClass} title="View profile">
        <Eye className="h-4 w-4" />
      </Link>
      <Link href={`/students/${student.id}/edit`} className={actionClass} title="Edit student">
        <Pencil className="h-4 w-4" />
      </Link>
      {student.Phone && (
        <a href={`tel:${student.Phone}`} className={actionClass} title="Call student">
          <Phone className="h-4 w-4" />
        </a>
      )}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className={`${actionClass} text-emerald-600`}
          title="WhatsApp student"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export default function StudentTable({ students, loading = false }: StudentTableProps) {
  if (loading) return <LoadingCard title="Loading students..." />;
  if (students.length === 0) {
    return <EmptyState title="No Students Found" description="No students match your current search and filters." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {students.map((student) => {
          const due = Number(student.Fees_due ?? 0);
          const attendance = Math.max(0, Math.min(100, Number(student.attendance_percentage ?? 0)));
          const remaining = daysRemaining(student);
          const membershipStatus = student.membership_status ?? student.Status ?? "Inactive";

          return (
            <article key={student.id} className="rounded-2xl border bg-background p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Avatar student={student} />
                <div className="min-w-0 flex-1">
                  <Link href={`/students/${student.id}`} className="truncate font-semibold hover:text-primary hover:underline">
                    {student.Name ?? "Unnamed Student"}
                  </Link>
                  <p className="text-xs text-muted-foreground">{student.student_code ?? "No student code"}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${membershipTone(membershipStatus)}`}>
                      {membershipStatus}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${feeTone(due)}`}>
                      {due > 0 ? `₹${due.toLocaleString("en-IN")} due` : "Fees clear"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Program</p>
                  <p className="font-medium">{student.Program ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Days remaining</p>
                  <p className="font-medium">{remaining === null ? "-" : remaining < 0 ? "Expired" : remaining}</p>
                </div>
                <div className="col-span-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="font-semibold">{attendance}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${attendance}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Joined {formatDate(student.join_date)}</p>
                <QuickActions student={student} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border bg-background shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px]">
            <thead className="bg-muted/50">
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-4 text-left font-semibold">Student</th>
                <th className="px-5 py-4 text-left font-semibold">Program</th>
                <th className="px-5 py-4 text-left font-semibold">Membership</th>
                <th className="px-5 py-4 text-left font-semibold">Attendance</th>
                <th className="px-5 py-4 text-left font-semibold">Fee status</th>
                <th className="px-5 py-4 text-left font-semibold">Contact</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const due = Number(student.Fees_due ?? 0);
                const attendance = Math.max(0, Math.min(100, Number(student.attendance_percentage ?? 0)));
                const remaining = daysRemaining(student);
                const membershipStatus = student.membership_status ?? student.Status ?? "Inactive";

                return (
                  <tr key={student.id} className="border-b last:border-0 transition-colors hover:bg-muted/25">
                    <td className="px-5 py-4">
                      <Link href={`/students/${student.id}`} className="group flex w-fit items-center gap-3">
                        <Avatar student={student} />
                        <div>
                          <p className="font-semibold group-hover:text-primary group-hover:underline">{student.Name ?? "Unnamed Student"}</p>
                          <p className="text-xs text-muted-foreground">{student.student_code ?? "No code"} · Joined {formatDate(student.join_date)}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{student.Program ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">{student.batch ?? "No batch"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${membershipTone(membershipStatus)}`}>
                        {membershipStatus}
                      </span>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {remaining === null ? "No expiry date" : remaining < 0 ? `Expired ${Math.abs(remaining)}d ago` : `${remaining} days remaining`}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-36">
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-muted-foreground">Consistency</span>
                          <span className="font-semibold">{attendance}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${attendance}%` }} />
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">Last: {formatDate(student.last_attendance)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${feeTone(due)}`}>
                        <ReceiptIndianRupee className="h-3.5 w-3.5" />
                        {due > 0 ? `₹${due.toLocaleString("en-IN")} due` : "Fees clear"}
                      </span>
                      <p className="mt-2 text-xs text-muted-foreground">Next due: {formatDate(student.next_due_date)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{student.Phone ?? "-"}</p>
                      <p className="max-w-[190px] truncate text-xs text-muted-foreground">{student.Email ?? "No email"}</p>
                    </td>
                    <td className="px-5 py-4"><QuickActions student={student} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <span>Showing {students.length} student{students.length === 1 ? "" : "s"}</span>
          <span>Footloose Alley Studio Manager</span>
        </div>
      </div>
    </div>
  );
}
