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
  onFiltersChange: (filters: FeeDueFilters) => void;
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

function SummaryCard({
  title,
  amount,
  detail,
  tone,
}: {
  title: string;
  amount: number;
  detail: string;
  tone: "violet" | "red" | "amber" | "emerald";
}) {
  const tones = {
    violet: "border-violet-100 bg-violet-50/70 text-violet-700",
    red: "border-red-100 bg-red-50/70 text-red-700",
    amber: "border-amber-100 bg-amber-50/70 text-amber-700",
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">{title}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
        {feeDuesService.formatCurrency(amount)}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
    </div>
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
  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
      (filters.status && filters.status !== "All") ||
      (filters.dateFilter && filters.dateFilter !== "All") ||
      filters.studentId
  );

  function updateFilter<Key extends keyof FeeDueFilters>(
    key: Key,
    value: FeeDueFilters[Key]
  ) {
    onFiltersChange({ ...filters, [key]: value });
  }

  function resetFilters() {
    onFiltersChange({ search: "", status: "All", dateFilter: "All", studentId: null });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
            Revenue action centre
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Fee Dues 2.0
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            See the most urgent renewals first, contact students quickly, and record collections without losing context.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onAddFeeDue}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
          >
            + Add Fee Due
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Outstanding"
          amount={summary.totalOutstanding}
          detail={`${summary.activeRecords} active records`}
          tone="violet"
        />
        <SummaryCard
          title="Overdue"
          amount={summary.overdueAmount}
          detail={`${summary.overdueRecords} students need attention`}
          tone="red"
        />
        <SummaryCard
          title="Due Today"
          amount={summary.dueTodayAmount}
          detail={`${summary.dueTodayRecords} payments expected today`}
          tone="amber"
        />
        <SummaryCard
          title="Upcoming"
          amount={summary.upcomingAmount}
          detail={`${summary.upcomingRecords} upcoming renewals`}
          tone="emerald"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(180px,.6fr)_minmax(180px,.6fr)_auto]">
          <input
            value={filters.search ?? ""}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search student, phone, plan or amount…"
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />

          <select
            value={filters.status ?? "All"}
            onChange={(event) => updateFilter("status", event.target.value as FeeDueStatus | "All")}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-violet-500"
          >
            <option value="All">All statuses</option>
            {FEE_DUE_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filters.dateFilter ?? "All"}
            onChange={(event) => updateFilter("dateFilter", event.target.value as FeeDueDateFilter)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-violet-500"
          >
            {DATE_FILTERS.map((filter) => (
              <option key={filter} value={filter}>{filter === "All" ? "All due dates" : filter}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="h-11 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
}
