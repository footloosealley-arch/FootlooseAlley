"use client";

import {
  FeeDueDateFilter,
  FeeDueFilters,
  FeeDueStatus,
  FeeDueSummary,
  FEE_DUE_STATUSES,
  feeDuesService,
} from "@/services/fee-dues.service";

interface FeeDueDashboardProps {
  summary: FeeDueSummary;
  filters: FeeDueFilters;
  loading?: boolean;
  onFiltersChange: (
    filters: FeeDueFilters
  ) => void;
  onAddFeeDue: () => void;
  onRefresh?: () => void;
}

const DATE_FILTERS: FeeDueDateFilter[] = [
  "All",
  "Today",
  "Overdue",
  "Upcoming",
  "Next 3 Days",
  "Next 7 Days",
  "This Month",
];

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  className: string;
  iconClassName: string;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  className,
  iconClassName,
}: SummaryCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconClassName,
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path
        d="m20 20-3.5-3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon({
  spinning = false,
}: {
  spinning?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={[
        "h-4 w-4",
        spinning
          ? "animate-spin"
          : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <path
        d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M4 4v6h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M20 20v-6h-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M20 9A8 8 0 0 0 6.6 5.6L4 10m16 4-2.6 4.4A8 8 0 0 1 4 15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FeeDueDashboard({
  summary,
  filters,
  loading = false,
  onFiltersChange,
  onAddFeeDue,
  onRefresh,
}: FeeDueDashboardProps) {
  const hasActiveFilters =
    Boolean(
      filters.search?.trim()
    ) ||
    Boolean(
      filters.status &&
        filters.status !== "All"
    ) ||
    Boolean(
      filters.dateFilter &&
        filters.dateFilter !== "All"
    ) ||
    Boolean(
      filters.studentId
    );

  function updateFilter<
    Key extends keyof FeeDueFilters
  >(
    key: Key,
    value: FeeDueFilters[Key]
  ) {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }

  function resetFilters() {
    onFiltersChange({
      search: "",
      status: "All",
      dateFilter: "All",
      studentId: null,
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            Membership renewals
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Fee Due Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Track upcoming renewals, overdue fees, payments, and reminder activity.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon
                spinning={loading}
              />

              Refresh
            </button>
          ) : null}

          <button
            type="button"
            onClick={onAddFeeDue}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <PlusIcon />

            Add Fee Due
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Outstanding"
          value={feeDuesService.formatCurrency(
            summary.totalOutstanding
          )}
          subtitle={`${summary.activeRecords} active fee ${
            summary.activeRecords === 1
              ? "record"
              : "records"
          }`}
          className="border-violet-100 bg-gradient-to-br from-white to-violet-50"
          iconClassName="bg-violet-100 text-violet-700"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="6"
                width="18"
                height="13"
                rx="2"
              />

              <path
                d="M3 10h18M16 15h2"
                strokeLinecap="round"
              />
            </svg>
          }
        />

        <SummaryCard
          title="Overdue"
          value={feeDuesService.formatCurrency(
            summary.overdueAmount
          )}
          subtitle={`${summary.overdueRecords} overdue ${
            summary.overdueRecords === 1
              ? "student"
              : "students"
          }`}
          className="border-red-100 bg-gradient-to-br from-white to-red-50"
          iconClassName="bg-red-100 text-red-700"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path
                d="M12 7v6m0 4h.01"
                strokeLinecap="round"
              />
            </svg>
          }
        />

        <SummaryCard
          title="Due Today"
          value={feeDuesService.formatCurrency(
            summary.dueTodayAmount
          )}
          subtitle={`${summary.dueTodayRecords} due ${
            summary.dueTodayRecords === 1
              ? "record"
              : "records"
          } today`}
          className="border-amber-100 bg-gradient-to-br from-white to-amber-50"
          iconClassName="bg-amber-100 text-amber-700"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
              />

              <path
                d="M16 3v4M8 3v4M3 10h18M12 14v3"
                strokeLinecap="round"
              />
            </svg>
          }
        />

        <SummaryCard
          title="Collected This Month"
          value={feeDuesService.formatCurrency(
            summary.collectedThisMonth
          )}
          subtitle={`${summary.paidRecords} total paid ${
            summary.paidRecords === 1
              ? "record"
              : "records"
          }`}
          className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50"
          iconClassName="bg-emerald-100 text-emerald-700"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M12 2v20M17 6.5A4 4 0 0 0 13 4H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H11a4 4 0 0 1-4-2.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Pending
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-xl font-bold text-slate-900">
              {summary.pendingRecords}
            </p>

            <p className="text-xs text-slate-500">
              Future dues
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Upcoming
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-xl font-bold text-slate-900">
              {summary.upcomingRecords}
            </p>

            <p className="text-xs text-slate-500">
              {feeDuesService.formatCurrency(
                summary.upcomingAmount
              )}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Collected
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-xl font-bold text-slate-900">
              {feeDuesService.formatCurrency(
                summary.totalCollected
              )}
            </p>

            <p className="text-xs text-slate-500">
              All time
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Closed Records
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-xl font-bold text-slate-900">
              {summary.waivedRecords +
                summary.cancelledRecords}
            </p>

            <p className="text-xs text-slate-500">
              Waived or cancelled
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Search and filter
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Find students by name, phone number, membership plan, or payment status.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_190px_190px_auto]">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <SearchIcon />
              </div>

              <input
                type="search"
                value={
                  filters.search ??
                  ""
                }
                onChange={(event) =>
                  updateFilter(
                    "search",
                    event.target.value
                  )
                }
                placeholder="Search student, phone, plan..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <select
              value={
                filters.status ??
                "All"
              }
              onChange={(event) =>
                updateFilter(
                  "status",
                  event.target
                    .value as
                    | FeeDueStatus
                    | "All"
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="All">
                All statuses
              </option>

              {FEE_DUE_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>

            <select
              value={
                filters.dateFilter ??
                "All"
              }
              onChange={(event) =>
                updateFilter(
                  "dateFilter",
                  event.target
                    .value as FeeDueDateFilter
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              {DATE_FILTERS.map(
                (dateFilter) => (
                  <option
                    key={dateFilter}
                    value={dateFilter}
                  >
                    {dateFilter ===
                    "All"
                      ? "All due dates"
                      : dateFilter}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              disabled={
                !hasActiveFilters
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ResetIcon />

              Reset
            </button>
          </div>

          {hasActiveFilters ? (
            <div className="flex flex-wrap gap-2">
              {filters.search?.trim() ? (
                <button
                  type="button"
                  onClick={() =>
                    updateFilter(
                      "search",
                      ""
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Search:{" "}
                  <span className="font-semibold">
                    {
                      filters.search
                    }
                  </span>

                  <span aria-hidden="true">
                    ×
                  </span>
                </button>
              ) : null}

              {filters.status &&
              filters.status !==
                "All" ? (
                <button
                  type="button"
                  onClick={() =>
                    updateFilter(
                      "status",
                      "All"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-200"
                >
                  Status:{" "}
                  <span className="font-semibold">
                    {
                      filters.status
                    }
                  </span>

                  <span aria-hidden="true">
                    ×
                  </span>
                </button>
              ) : null}

              {filters.dateFilter &&
              filters.dateFilter !==
                "All" ? (
                <button
                  type="button"
                  onClick={() =>
                    updateFilter(
                      "dateFilter",
                      "All"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-200"
                >
                  Date:{" "}
                  <span className="font-semibold">
                    {
                      filters.dateFilter
                    }
                  </span>

                  <span aria-hidden="true">
                    ×
                  </span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}