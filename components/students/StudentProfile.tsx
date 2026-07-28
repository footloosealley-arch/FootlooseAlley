"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Edit3,
  HeartPulse,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ReceiptIndianRupee,
  Snowflake,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

import MembershipEngine from "@/components/students/MembershipEngine";
import type {
  StudentAttendanceRecord,
  StudentProfileData,
} from "@/services/students.service";

interface StudentProfileProps {
  profile: StudentProfileData;
  onRefresh: () => void | Promise<void>;
}

type ProfileTab =
  | "overview"
  | "membership"
  | "attendance"
  | "payments"
  | "notes"
  | "timeline";

const tabs: Array<{ id: ProfileTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "membership", label: "Membership" },
  { id: "attendance", label: "Attendance" },
  { id: "payments", label: "Payments" },
  { id: "notes", label: "Notes" },
  { id: "timeline", label: "Timeline" },
];

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "-";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(Number(value ?? 0));
}

function initials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function whatsappNumber(phone: string | null | undefined): string {
  const cleaned = phone?.replace(/\D/g, "") ?? "";
  if (!cleaned) return "";
  return cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
}

function calculateAttendance(attendance: StudentAttendanceRecord[]) {
  const present = attendance.filter(
    (record) => record.status?.toLowerCase() === "present"
  ).length;
  const absent = attendance.filter(
    (record) => record.status?.toLowerCase() === "absent"
  ).length;
  const late = attendance.filter(
    (record) => record.status?.toLowerCase() === "late"
  ).length;
  const total = attendance.length;

  return {
    total,
    present,
    absent,
    late,
    percentage: total ? Math.round((present / total) * 100) : 0,
  };
}

function membershipStatusClass(status: string | null | undefined): string {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";
    case "Expiring Soon":
      return "bg-amber-100 text-amber-700";
    case "Frozen":
      return "bg-blue-100 text-blue-700";
    case "Expired":
    case "Cancelled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function attendanceStatusClass(status: string | null | undefined): string {
  switch (status?.toLowerCase()) {
    case "present":
      return "bg-emerald-100 text-emerald-700";
    case "late":
      return "bg-amber-100 text-amber-700";
    case "absent":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function paymentStatusClass(status: string | null | undefined): string {
  switch (status?.toLowerCase()) {
    case "paid":
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "partial":
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "failed":
    case "cancelled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function StudentProfile({
  profile,
  onRefresh,
}: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const {
    student,
    attendance,
    payments,
    notes,
    memberships,
    membershipEvents,
  } = profile;

  const stats = calculateAttendance(attendance);
  const attendancePercentage =
    student.attendance_percentage ?? stats.percentage;
  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount ?? 0),
    0
  );
  const currentMembership = memberships[0] ?? null;
  const endDate =
    student.membership_end_date ??
    currentMembership?.expiry_date ??
    student.next_due_date;
  const daysRemaining = endDate
    ? Math.ceil(
        (new Date(`${endDate.slice(0, 10)}T00:00:00`).getTime() -
          new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00`).getTime()) /
          86_400_000
      )
    : null;
  const membershipStatus =
    student.membership_status ??
    currentMembership?.status ??
    (student.membership_frozen ? "Frozen" : "Active");
  const waNumber = whatsappNumber(student.Phone);

  const timeline = useMemo(() => {
    const membershipItems = membershipEvents.map((event) => ({
      id: `membership-${event.id}`,
      date: event.event_date || event.created_at,
      title: `Membership ${event.event_type}`,
      detail:
        event.reason ||
        event.notes ||
        [event.previous_status, event.new_status].filter(Boolean).join(" → ") ||
        "Membership activity recorded",
      type: "Membership",
    }));

    const paymentItems = payments.map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.payment_date || payment.created_at,
      title: `Payment ${formatCurrency(payment.amount)}`,
      detail: `${payment.payment_method ?? "Payment"}${
        payment.invoice_number ? ` · ${payment.invoice_number}` : ""
      }`,
      type: "Payment",
    }));

    const attendanceItems = attendance.slice(0, 20).map((record) => ({
      id: `attendance-${record.id}`,
      date: record.date ?? record.marked_at ?? "",
      title: `${record.status ?? "Attendance"} · ${
        record.Classes?.class_name ?? record.session_name ?? "Studio Class"
      }`,
      detail: record.remarks ?? "Attendance recorded",
      type: "Attendance",
    }));

    return [...membershipItems, ...paymentItems, ...attendanceItems]
      .filter((item) => item.date)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [attendance, membershipEvents, payments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/students"
          className="inline-flex w-fit items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>

        <div className="flex flex-wrap gap-2">
          {student.Phone && (
            <a
              href={`tel:${student.Phone}`}
              className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          <Link
            href={`/students/${student.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Edit3 className="h-4 w-4" />
            Edit Student
          </Link>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="bg-gradient-to-br from-primary/15 via-background to-background p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            {student.photo_url ? (
              <Image
                src={student.photo_url}
                alt={student.Name ?? "Student"}
                width={120}
                height={120}
                className="h-28 w-28 rounded-3xl border-4 border-background object-cover shadow-md"
              />
            ) : (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-primary text-4xl font-bold text-primary-foreground shadow-md">
                {initials(student.Name)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-3xl font-bold tracking-tight">
                  {student.Name ?? "Unnamed Student"}
                </h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    student.Status?.toLowerCase() === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {student.Status ?? "Inactive"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${membershipStatusClass(
                    membershipStatus
                  )}`}
                >
                  {membershipStatus}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {student.student_code ?? `Student #${student.id}`}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {student.Program ?? "No program"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <UsersRound className="h-4 w-4" />
                  {student.batch ?? "No batch"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Joined {formatDate(student.join_date)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  Last visit {formatDate(student.last_attendance)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border bg-background/80 p-5 backdrop-blur-sm lg:min-w-56">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Membership remaining
              </p>
              <p className="mt-2 text-3xl font-bold">
                {daysRemaining === null
                  ? "-"
                  : daysRemaining < 0
                    ? "Expired"
                    : `${daysRemaining} days`}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ends {formatDate(endDate)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Membership"
          value={student.membership_plan ?? currentMembership?.plan ?? "-"}
          helper={membershipStatus}
          icon={WalletCards}
        />
        <SummaryCard
          label="Attendance"
          value={`${attendancePercentage}%`}
          helper={`${stats.present} present · ${stats.total} records`}
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Total Payments"
          value={formatCurrency(totalPaid)}
          helper={`${payments.length} payment${payments.length === 1 ? "" : "s"}`}
          icon={ReceiptIndianRupee}
        />
        <SummaryCard
          label="Fees Due"
          value={formatCurrency(student.Fees_due)}
          helper={`Next due ${formatDate(student.next_due_date)}`}
          icon={CreditCard}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="overflow-x-auto border-b px-3 sm:px-5">
          <div className="flex min-w-max gap-1 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab profile={profile} attendancePercentage={attendancePercentage} />
          )}

          {activeTab === "membership" && (
            <div className="space-y-6">
              <MembershipEngine
                student={student}
                memberships={memberships}
                membershipEvents={membershipEvents}
                onChanged={onRefresh}
              />
              <MembershipHistory profile={profile} />
            </div>
          )}

          {activeTab === "attendance" && (
            <AttendanceTab attendance={attendance} />
          )}

          {activeTab === "payments" && <PaymentsTab profile={profile} />}

          {activeTab === "notes" && <NotesTab profile={profile} />}

          {activeTab === "timeline" && <TimelineTab items={timeline} />}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="rounded-xl bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="mt-3 truncate text-2xl font-bold">{value}</p>
      <p className="mt-2 truncate text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function OverviewTab({
  profile,
  attendancePercentage,
}: {
  profile: StudentProfileData;
  attendancePercentage: number;
}) {
  const { student, attendance, payments } = profile;
  const classDetails = student.Classes;
  const instructor = student.Instructors;

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Panel title="Personal Information">
          <div className="grid gap-5 sm:grid-cols-2">
            <Detail icon={Phone} label="Phone" value={student.Phone} />
            <Detail icon={Mail} label="Email" value={student.Email} />
            <Detail icon={UserRound} label="Gender" value={student.gender} />
            <Detail
              icon={CalendarDays}
              label="Date of Birth"
              value={formatDate(student.date_of_birth)}
            />
            <Detail icon={MapPin} label="Address" value={student.Address} />
            <Detail
              icon={Phone}
              label="Emergency Contact"
              value={student.Emergency_contact}
            />
            <Detail
              icon={UsersRound}
              label="Referred By"
              value={student.referred_by}
            />
            <Detail
              icon={HeartPulse}
              label="Medical Notes"
              value={student.medical_notes}
            />
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Recent Attendance">
            <CompactAttendance attendance={attendance.slice(0, 5)} />
          </Panel>
          <Panel title="Recent Payments">
            <CompactPayments payments={payments.slice(0, 5)} />
          </Panel>
        </div>
      </div>

      <div className="space-y-6">
        <Panel title="Class & Membership">
          <div className="space-y-4">
            <Row label="Program" value={student.Program} />
            <Row label="Batch" value={student.batch} />
            <Row label="Plan" value={student.membership_plan} />
            <Row label="Monthly Fee" value={formatCurrency(student.Fees)} />
            <Row label="Class" value={classDetails?.class_name} />
            <Row label="Class Day" value={classDetails?.day} />
            <Row
              label="Class Time"
              value={
                classDetails
                  ? `${formatTime(classDetails.start_time)} - ${formatTime(
                      classDetails.end_time
                    )}`
                  : "-"
              }
            />
            <Row label="Instructor" value={instructor?.name} />
          </div>
        </Panel>

        <Panel title="Attendance Snapshot">
          <div className="text-center">
            <p className="text-5xl font-bold">{attendancePercentage}%</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Overall attendance rate
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MembershipHistory({ profile }: { profile: StudentProfileData }) {
  const { memberships } = profile;

  return (
    <Panel title="Membership History">
      {memberships.length === 0 ? (
        <EmptyState text="No membership history found." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Period</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Paid</th>
                <th className="pb-3 font-medium">Due</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {memberships.map((membership) => (
                <tr key={membership.id}>
                  <td className="py-4 font-medium">{membership.plan}</td>
                  <td className="py-4 text-muted-foreground">
                    {formatDate(membership.start_date)} – {formatDate(membership.expiry_date)}
                  </td>
                  <td className="py-4">{formatCurrency(membership.amount)}</td>
                  <td className="py-4">{formatCurrency(membership.paid_amount)}</td>
                  <td className="py-4">{formatCurrency(membership.amount_due)}</td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${membershipStatusClass(
                        membership.status
                      )}`}
                    >
                      {membership.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function AttendanceTab({ attendance }: { attendance: StudentAttendanceRecord[] }) {
  const stats = calculateAttendance(attendance);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <MiniStat label="Total" value={stats.total} />
        <MiniStat label="Present" value={stats.present} />
        <MiniStat label="Late" value={stats.late} />
        <MiniStat label="Absent" value={stats.absent} />
      </div>
      <Panel title="Attendance Records">
        {attendance.length === 0 ? (
          <EmptyState text="No attendance records found." />
        ) : (
          <div className="divide-y">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {record.Classes?.class_name ??
                      record.session_name ??
                      "Studio Class"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(record.date)}
                    {record.check_in_time
                      ? ` · Check-in ${formatTime(record.check_in_time)}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${attendanceStatusClass(
                    record.status
                  )}`}
                >
                  {record.status ?? "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function PaymentsTab({ profile }: { profile: StudentProfileData }) {
  const { payments } = profile;

  return (
    <Panel title="Payment History">
      {payments.length === 0 ? (
        <EmptyState text="No payment records found." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Invoice</th>
                <th className="pb-3 font-medium">Reference</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="py-4">{formatDate(payment.payment_date)}</td>
                  <td className="py-4 font-semibold">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="py-4">{payment.payment_method ?? "-"}</td>
                  <td className="py-4">{payment.invoice_number ?? "-"}</td>
                  <td className="py-4">{payment.reference_number ?? "-"}</td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass(
                        payment.payment_status
                      )}`}
                    >
                      {payment.payment_status ?? "Recorded"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function NotesTab({ profile }: { profile: StudentProfileData }) {
  const { student, notes } = profile;

  return (
    <Panel title="Student Notes">
      {student.notes && (
        <div className="mb-4 rounded-xl bg-muted/60 p-4 text-sm">
          {student.notes}
        </div>
      )}

      {notes.length === 0 && !student.notes ? (
        <EmptyState text="No notes have been added for this student." />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border p-4">
              {note.title && <p className="font-semibold">{note.title}</p>}
              <p className="mt-1 text-sm text-muted-foreground">
                {note.note ?? "No note text"}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatDate(note.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function TimelineTab({
  items,
}: {
  items: Array<{
    id: string;
    date: string;
    title: string;
    detail: string;
    type: string;
  }>;
}) {
  return (
    <Panel title="Student Activity Timeline">
      {items.length === 0 ? (
        <EmptyState text="No timeline activity found." />
      ) : (
        <div className="relative space-y-0 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-border">
          {items.map((item) => (
            <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
              <div className="z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-background bg-primary" />
              <div className="min-w-0 flex-1 rounded-xl border p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold">{item.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.date)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                <span className="mt-3 inline-block rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium">{value || "-"}</p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value || "-"}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-background p-4 text-center shadow-sm">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function CompactAttendance({
  attendance,
}: {
  attendance: StudentAttendanceRecord[];
}) {
  if (attendance.length === 0) return <EmptyState text="No attendance records." />;

  return (
    <div className="divide-y">
      {attendance.map((record) => (
        <div key={record.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div>
            <p className="text-sm font-medium">
              {record.Classes?.class_name ?? record.session_name ?? "Studio Class"}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(record.date)}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${attendanceStatusClass(record.status)}`}>
            {record.status ?? "Unknown"}
          </span>
        </div>
      ))}
    </div>
  );
}

function CompactPayments({
  payments,
}: {
  payments: StudentProfileData["payments"];
}) {
  if (payments.length === 0) return <EmptyState text="No payment records." />;

  return (
    <div className="divide-y">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div>
            <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(payment.payment_date)} · {payment.payment_method ?? "Payment"}
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusClass(payment.payment_status)}`}>
            {payment.payment_status ?? "Recorded"}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
