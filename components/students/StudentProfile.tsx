"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Clock,
  CreditCard,
  Edit,
  HeartPulse,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  Snowflake,
  User,
  UserCheck,
  WalletCards,
} from "lucide-react";

import type {
  StudentProfileData,
  StudentAttendanceRecord,
} from "@/services/students.service";

interface StudentProfileProps {
  profile: StudentProfileData;
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatTime(
  value: string | null | undefined
): string {
  if (!value) {
    return "-";
  }

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const date = new Date();

  date.setHours(
    Number(parts[0]),
    Number(parts[1]),
    0,
    0
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  ).format(date);
}

function formatCurrency(
  value: number | null | undefined
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(value ?? 0)
  );
}

function getInitials(
  name: string | null | undefined
): string {
  if (!name?.trim()) {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0)
    )
    .join("")
    .toUpperCase();
}

function getWhatsAppNumber(
  phone: string | null | undefined
): string {
  if (!phone) {
    return "";
  }

  const cleaned =
    phone.replace(/\D/g, "");

  if (!cleaned) {
    return "";
  }

  if (
    cleaned.startsWith("91")
  ) {
    return cleaned;
  }

  return `91${cleaned}`;
}

function getAttendanceStatusClass(
  status: string | null
): string {
  const normalized =
    status?.toLowerCase() ?? "";

  if (
    normalized === "present"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    normalized === "late"
  ) {
    return "bg-amber-100 text-amber-700";
  }

  if (
    normalized === "absent"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-muted text-muted-foreground";
}

function getFeeStatusClass(
  feeStatus: string | null,
  feesDue: number | null
): string {
  const normalized =
    feeStatus?.toLowerCase() ?? "";

  if (
    normalized === "paid" ||
    Number(feesDue ?? 0) <= 0
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    normalized === "partial"
  ) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
}

function calculateAttendance(
  attendance: StudentAttendanceRecord[]
) {
  const total =
    attendance.length;

  const present =
    attendance.filter(
      (record) =>
        record.status
          ?.toLowerCase() ===
        "present"
    ).length;

  const absent =
    attendance.filter(
      (record) =>
        record.status
          ?.toLowerCase() ===
        "absent"
    ).length;

  const late =
    attendance.filter(
      (record) =>
        record.status
          ?.toLowerCase() ===
        "late"
    ).length;

  const percentage =
    total > 0
      ? Math.round(
          (present / total) *
            100
        )
      : 0;

  return {
    total,
    present,
    absent,
    late,
    percentage,
  };
}

export default function StudentProfile({
  profile,
}: StudentProfileProps) {
  const {
    student,
    attendance,
    payments,
    notes,
  } = profile;

  const attendanceStats =
    calculateAttendance(
      attendance
    );

  const attendancePercentage =
    student.attendance_percentage ??
    attendanceStats.percentage;

  const totalPayments =
    payments.reduce(
      (total, payment) =>
        total +
        Number(
          payment.amount ?? 0
        ),
      0
    );

  const whatsappNumber =
    getWhatsAppNumber(
      student.Phone
    );

  const classDetails =
    student.Classes;

  const instructor =
    student.Instructors;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/students"
          className="inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>

        <div className="flex flex-wrap gap-2">
          {student.Phone && (
            <a
              href={`tel:${student.Phone}`}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}

          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}

          <Link
            href={`/students/${student.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Edit className="h-4 w-4" />
            Edit Student
          </Link>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="bg-gradient-to-r from-primary/10 via-background to-background p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {student.photo_url ? (
              <Image
                src={student.photo_url}
                alt={
                  student.Name ??
                  "Student"
                }
                width={104}
                height={104}
                className="h-24 w-24 rounded-2xl border object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-sm">
                {getInitials(
                  student.Name
                )}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                  {student.Name ??
                    "Unnamed Student"}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    student.Status
                      ?.toLowerCase() ===
                    "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {student.Status ??
                    "Inactive"}
                </span>

                {student.membership_frozen && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    <Snowflake className="h-3 w-3" />
                    Membership Frozen
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {student.student_code ??
                  `Student #${student.id}`}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {student.Program ??
                    "No program"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Joined{" "}
                  {formatDate(
                    student.join_date
                  )}
                </span>

                <span className="inline-flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  {student.batch ??
                    "No batch"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Fees Due
            </p>

            <WalletCards className="h-5 w-5 text-muted-foreground" />
          </div>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(
              student.Fees_due
            )}
          </p>

          <span
            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getFeeStatusClass(
              student.fee_status,
              student.Fees_due
            )}`}
          >
            {student.fee_status ??
              (Number(
                student.Fees_due ??
                  0
              ) <= 0
                ? "Paid"
                : "Pending")}
          </span>
        </div>

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Attendance
            </p>

            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>

          <p className="mt-2 text-2xl font-bold">
            {attendancePercentage}%
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            {attendanceStats.present}{" "}
            present from{" "}
            {attendanceStats.total}{" "}
            records
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total Payments
            </p>

            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(
              totalPayments
            )}
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            {payments.length} payment
            {payments.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Next Due Date
            </p>

            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>

          <p className="mt-2 text-xl font-bold">
            {formatDate(
              student.next_due_date
            )}
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            Last paid{" "}
            {formatDate(
              student.last_payment_date
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border bg-background p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold">
            Personal Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <DetailItem
              icon={Phone}
              label="Phone"
              value={student.Phone}
            />

            <DetailItem
              icon={Mail}
              label="Email"
              value={student.Email}
            />

            <DetailItem
              icon={User}
              label="Gender"
              value={student.gender}
            />

            <DetailItem
              icon={CalendarDays}
              label="Date of Birth"
              value={formatDate(
                student.date_of_birth
              )}
            />

            <DetailItem
              icon={MapPin}
              label="Address"
              value={student.Address}
            />

            <DetailItem
              icon={Phone}
              label="Emergency Contact"
              value={
                student.Emergency_contact
              }
            />

            <DetailItem
              icon={UserCheck}
              label="Referred By"
              value={
                student.referred_by
              }
            />

            <DetailItem
              icon={HeartPulse}
              label="Medical Notes"
              value={
                student.medical_notes
              }
            />
          </div>
        </section>

        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            Membership
          </h2>

          <div className="mt-5 space-y-4">
            <SimpleRow
              label="Plan"
              value={
                student.membership_plan
              }
            />

            <SimpleRow
              label="Program"
              value={student.Program}
            />

            <SimpleRow
              label="Batch"
              value={student.batch}
            />

            <SimpleRow
              label="Monthly Fee"
              value={formatCurrency(
                student.Fees
              )}
            />

            <SimpleRow
              label="Class"
              value={
                classDetails?.class_name
              }
            />

            <SimpleRow
              label="Class Day"
              value={classDetails?.day}
            />

            <SimpleRow
              label="Class Time"
              value={
                classDetails
                  ? `${formatTime(
                      classDetails.start_time
                    )} - ${formatTime(
                      classDetails.end_time
                    )}`
                  : "-"
              }
            />

            <SimpleRow
              label="Instructor"
              value={instructor?.name}
            />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="text-lg font-semibold">
                Recent Attendance
              </h2>

              <p className="text-sm text-muted-foreground">
                Latest attendance records
              </p>
            </div>

            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>

          {attendance.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No attendance records found.
            </div>
          ) : (
            <div className="divide-y">
              {attendance
                .slice(0, 8)
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {record.Classes
                          ?.class_name ??
                          record.session_name ??
                          "Studio Class"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          record.date
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getAttendanceStatusClass(
                        record.status
                      )}`}
                    >
                      {record.status ??
                        "Unknown"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-background shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="text-lg font-semibold">
                Payment History
              </h2>

              <p className="text-sm text-muted-foreground">
                Latest recorded payments
              </p>
            </div>

            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No payment records found.
            </div>
          ) : (
            <div className="divide-y">
              {payments
                .slice(0, 8)
                .map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {formatCurrency(
                          payment.amount
                        )}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          payment.payment_date
                        )}
                        {" · "}
                        {payment.payment_method ??
                          "Payment"}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {payment.payment_status ??
                        "Paid"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border bg-background p-5 shadow-sm">
        <h2 className="text-lg font-semibold">
          Notes
        </h2>

        {student.notes && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="text-sm">
              {student.notes}
            </p>
          </div>
        )}

        {notes.length > 0 && (
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border p-4"
              >
                {note.title && (
                  <p className="font-medium">
                    {note.title}
                  </p>
                )}

                <p className="mt-1 text-sm text-muted-foreground">
                  {note.note ??
                    "No note text"}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(
                    note.created_at
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {!student.notes &&
          notes.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              No notes have been added for this student.
            </p>
          )}
      </section>
    </div>
  );
}

interface DetailItemProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value:
    | string
    | null
    | undefined;
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

interface SimpleRowProps {
  label: string;
  value:
    | string
    | null
    | undefined;
}

function SimpleRow({
  label,
  value,
}: SimpleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-right text-sm font-medium">
        {value || "-"}
      </span>
    </div>
  );
}