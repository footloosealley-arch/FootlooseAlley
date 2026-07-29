"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Search,
  Snowflake,
  UserRoundPlus,
  WalletCards,
  XCircle,
} from "lucide-react";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import { useAsync } from "@/hooks/useAsync";
import { MEMBERSHIP_PLANS } from "@/services/membership.service";
import {
  daysUntil,
  deriveMembershipStatus,
  getRenewalWhatsAppUrl,
  membershipDashboardService,
  type MembershipDashboardStatus,
  type MembershipDashboardStudent,
} from "@/services/memberships-dashboard.service";
import type { MembershipPlan } from "@/types/database";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const statusOptions: Array<MembershipDashboardStatus | "All"> = [
  "All",
  "Active",
  "Expiring Soon",
  "Expired",
  "Frozen",
  "Cancelled",
  "Not Started",
];

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? "—"
    : dateFormatter.format(date);
}

function statusClass(status: MembershipDashboardStatus): string {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";
    case "Expiring Soon":
      return "bg-amber-100 text-amber-700";
    case "Expired":
      return "bg-rose-100 text-rose-700";
    case "Frozen":
      return "bg-blue-100 text-blue-700";
    case "Cancelled":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-violet-100 text-violet-700";
  }
}

function priority(status: MembershipDashboardStatus, due: number): number {
  if (status === "Expired") return 0;
  if (status === "Expiring Soon") return 1;
  if (due > 0) return 2;
  if (status === "Frozen") return 3;
  if (status === "Not Started") return 4;
  return 5;
}

function renewalText(
  status: MembershipDashboardStatus,
  remaining: number | null
): string {
  if (status === "Not Started") return "Membership not started";
  if (status === "Frozen") return "Membership frozen";
  if (status === "Cancelled") return "Membership cancelled";
  if (remaining === null) return "No expiry date";
  if (remaining < 0) {
    const overdue = Math.abs(remaining);
    return `${overdue} day${overdue === 1 ? "" : "s"} overdue`;
  }
  if (remaining === 0) return "Expires today";
  return `${remaining} day${remaining === 1 ? "" : "s"} remaining`;
}

interface MembershipRow {
  student: MembershipDashboardStudent;
  status: MembershipDashboardStatus;
  remaining: number | null;
  due: number;
}

export default function MembershipsManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<MembershipDashboardStatus | "All">("All");

  const { data, loading, error, refresh } = useAsync(
    () => membershipDashboardService.getStudents(),
    "membership-dashboard"
  );

  const rows = useMemo<MembershipRow[]>(() => {
    return (data ?? []).map((student) => ({
      student,
      status: deriveMembershipStatus(student),
      remaining: daysUntil(student.membership_end_date),
      due: Math.max(0, Number(student.Fees_due ?? 0)),
    }));
  }, [data]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows
      .filter(({ student, status }) => {
        if (statusFilter !== "All" && status !== statusFilter) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [
          student.Name,
          student.Phone,
          student.student_code,
          student.Program,
          student.membership_plan,
        ].some((value) => value?.toLowerCase().includes(query));
      })
      .sort((first, second) => {
        const rank =
          priority(first.status, first.due) -
          priority(second.status, second.due);

        if (rank !== 0) return rank;

        return (first.student.Name ?? "").localeCompare(
          second.student.Name ?? ""
        );
      });
  }, [rows, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: rows.length,
      active: rows.filter((row) => row.status === "Active").length,
      expiring: rows.filter((row) => row.status === "Expiring Soon").length,
      expired: rows.filter((row) => row.status === "Expired").length,
      frozen: rows.filter((row) => row.status === "Frozen").length,
      notStarted: rows.filter((row) => row.status === "Not Started").length,
      outstanding: rows.reduce((total, row) => total + row.due, 0),
    };
  }, [rows]);

  const priorityRows = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            row.status === "Expired" ||
            row.status === "Expiring Soon" ||
            row.status === "Not Started" ||
            row.due > 0
        )
        .sort(
          (first, second) =>
            priority(first.status, first.due) -
              priority(second.status, second.due) ||
            (first.remaining ?? 99999) - (second.remaining ?? 99999)
        )
        .slice(0, 6),
    [rows]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          label="All students"
          value={String(summary.total)}
          icon={WalletCards}
        />
        <SummaryCard
          label="Active"
          value={String(summary.active)}
          icon={CheckCircle2}
          tone="text-emerald-600"
        />
        <SummaryCard
          label="Expiring soon"
          value={String(summary.expiring)}
          icon={CalendarClock}
          tone="text-amber-600"
        />
        <SummaryCard
          label="Expired"
          value={String(summary.expired)}
          icon={XCircle}
          tone="text-rose-600"
        />
        <SummaryCard
          label="Frozen"
          value={String(summary.frozen)}
          icon={Snowflake}
          tone="text-blue-600"
        />
        <SummaryCard
          label="Fees outstanding"
          value={currency.format(summary.outstanding)}
          icon={BadgeIndianRupee}
          tone="text-rose-600"
        />
      </section>

      <section className="rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Membership plans</h2>
            <p className="text-sm text-muted-foreground">
              Official Footloose Alley plan prices
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {summary.notStarted} student{summary.notStarted === 1 ? "" : "s"} awaiting activation
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(MEMBERSHIP_PLANS) as MembershipPlan[]).map((plan) => (
            <div key={plan} className="rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-medium">{MEMBERSHIP_PLANS[plan].label}</p>
              <p className="mt-2 text-2xl font-bold">
                {currency.format(MEMBERSHIP_PLANS[plan].amount)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {MEMBERSHIP_PLANS[plan].months} month{MEMBERSHIP_PLANS[plan].months === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {priorityRows.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-amber-950">
              Today&apos;s membership tasks
            </h2>
            <p className="text-sm text-amber-800">
              Start with expired memberships, upcoming renewals, and outstanding balances.
            </p>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {priorityRows.map((row) => (
              <MembershipTask key={row.student.id} row={row} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-background shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold">All memberships</h2>
            <p className="text-sm text-muted-foreground">
              {filteredRows.length} of {rows.length} students
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, phone, code..."
                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm sm:w-72"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as MembershipDashboardStatus | "All"
                )
              }
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading && <div className="p-4"><LoadingCard title="Loading memberships..." /></div>}

        {!loading && error && (
          <div className="p-4">
            <ErrorCard
              title="Unable to load memberships"
              message={error.message}
              onRetry={() => void refresh()}
            />
          </div>
        )}

        {!loading && !error && filteredRows.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No memberships match these filters.
          </div>
        )}

        {!loading && !error && filteredRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Period</th>
                  <th className="px-5 py-3">Fee balance</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRows.map((row) => (
                  <MembershipTableRow key={row.student.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = "text-primary",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function MembershipTask({ row }: { row: MembershipRow }) {
  const { student, status, remaining, due } = row;
  const whatsappUrl = getRenewalWhatsAppUrl(student);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold">{student.Name || `Student #${student.id}`}</p>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>
            {status}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {renewalText(status, remaining)}
          {due > 0 ? ` · ${currency.format(due)} due` : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            <MessageCircle className="h-4 w-4" />
            Remind
          </a>
        )}
        <Link
          href={`/students/${student.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Manage
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function MembershipTableRow({ row }: { row: MembershipRow }) {
  const { student, status, remaining, due } = row;
  const whatsappUrl = getRenewalWhatsAppUrl(student);

  return (
    <tr className="hover:bg-muted/20">
      <td className="px-5 py-4">
        <p className="font-medium">{student.Name || `Student #${student.id}`}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {[student.student_code, student.Phone, student.Program]
            .filter(Boolean)
            .join(" · ") || "No contact details"}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="font-medium">{student.membership_plan || "Not selected"}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {student.fee_status || "No fee status"}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>
          {status}
        </span>
        <p className="mt-2 text-xs text-muted-foreground">
          {renewalText(status, remaining)}
        </p>
      </td>
      <td className="px-5 py-4 text-muted-foreground">
        <p>{formatDate(student.membership_start_date)}</p>
        <p className="mt-1 text-xs">to {formatDate(student.membership_end_date)}</p>
      </td>
      <td className="px-5 py-4">
        <p className={due > 0 ? "font-semibold text-rose-700" : "font-medium text-emerald-700"}>
          {currency.format(due)}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              title="Send WhatsApp renewal reminder"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-emerald-700 hover:bg-emerald-50"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="sr-only">Send WhatsApp reminder</span>
            </a>
          )}
          <Link
            href={`/students/${student.id}`}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            {status === "Not Started" ? (
              <UserRoundPlus className="h-4 w-4" />
            ) : (
              <Clock3 className="h-4 w-4" />
            )}
            Manage
          </Link>
        </div>
      </td>
    </tr>
  );
}
