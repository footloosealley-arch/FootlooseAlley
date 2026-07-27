"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

import {
  ENQUIRY_SOURCES,
  ENQUIRY_STATUSES,
  type EnquiryFilters,
  type EnquirySource,
  type EnquiryStatus,
  type EnquirySummary,
} from "@/services/enquiries.service";

interface EnquiryDashboardProps {
  summary: EnquirySummary;
  filters: EnquiryFilters;
  resultCount: number;
  onFiltersChange: (filters: EnquiryFilters) => void;
  onAddEnquiry: () => void;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  className: string;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  className,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function EnquiryDashboard({
  summary,
  filters,
  resultCount,
  onFiltersChange,
  onAddEnquiry,
}: EnquiryDashboardProps) {
  const hasActiveFilters =
    Boolean(filters.search?.trim()) ||
    Boolean(filters.status && filters.status !== "All") ||
    Boolean(filters.source && filters.source !== "All") ||
    Boolean(filters.followUp && filters.followUp !== "All");

  function updateFilter<Key extends keyof EnquiryFilters>(
    key: Key,
    value: EnquiryFilters[Key]
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
      source: "All",
      followUp: "All",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Enquiries CRM
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Track leads, follow-ups, trials, and student conversions.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddEnquiry}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Enquiry
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total Enquiries"
          value={summary.total}
          subtitle="All leads recorded"
          icon={<Users className="h-5 w-5" />}
          className="bg-blue-50 text-blue-700"
        />

        <SummaryCard
          title="New Leads"
          value={summary.new}
          subtitle="Waiting for first contact"
          icon={<UserPlus className="h-5 w-5" />}
          className="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Follow-ups Today"
          value={summary.followUpsToday}
          subtitle="Need attention today"
          icon={<CalendarClock className="h-5 w-5" />}
          className="bg-amber-50 text-amber-700"
        />

        <SummaryCard
          title="Overdue"
          value={summary.overdueFollowUps}
          subtitle="Follow-ups pending"
          icon={<AlertTriangle className="h-5 w-5" />}
          className="bg-red-50 text-red-700"
        />

        <SummaryCard
          title="Conversion Rate"
          value={`${summary.conversionRate}%`}
          subtitle={`${summary.joined} joined students`}
          icon={<Target className="h-5 w-5" />}
          className="bg-green-50 text-green-700"
        />
      </div>

      <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={filters.search ?? ""}
                onChange={(event) =>
                  updateFilter("search", event.target.value)
                }
                placeholder="Search by name, phone, email, class, or notes..."
                className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:flex xl:items-center">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <select
                  value={filters.status ?? "All"}
                  onChange={(event) =>
                    updateFilter(
                      "status",
                      event.target.value as EnquiryStatus | "All"
                    )
                  }
                  className="h-11 w-full min-w-[170px] rounded-xl border bg-background pl-10 pr-8 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="All">All Statuses</option>

                  {ENQUIRY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={filters.source ?? "All"}
                onChange={(event) =>
                  updateFilter(
                    "source",
                    event.target.value as EnquirySource | "All"
                  )
                }
                className="h-11 w-full min-w-[160px] rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Sources</option>

                {ENQUIRY_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>

              <select
                value={filters.followUp ?? "All"}
                onChange={(event) =>
                  updateFilter(
                    "followUp",
                    event.target.value as EnquiryFilters["followUp"]
                  )
                }
                className="h-11 w-full min-w-[170px] rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Follow-ups</option>
                <option value="Today">Due Today</option>
                <option value="Overdue">Overdue</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {resultCount}
                </span>{" "}
                {resultCount === 1 ? "enquiry" : "enquiries"}
              </span>

              {summary.trialsScheduled > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {summary.trialsScheduled} trial
                  {summary.trialsScheduled === 1 ? "" : "s"} scheduled
                </span>
              )}

              {summary.joined > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  <Target className="h-3.5 w-3.5" />
                  {summary.joined} joined
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}