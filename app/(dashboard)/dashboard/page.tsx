"use client";

import {
  AlertCircle,
  CalendarCheck,
  IndianRupee,
  RefreshCw,
  UserCheck,
  UserRoundSearch,
} from "lucide-react";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import BirthdayCard from "@/components/dashboard/BirthdayCard";
import DashboardKpiCard from "@/components/dashboard/DashboardKpiCard";
import FeeDueActionCard from "@/components/dashboard/FeeDueActionCard";
import PriorityActions from "@/components/dashboard/PriorityActions";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentEnquiries from "@/components/dashboard/RecentEnquiries";
import RecentPayments from "@/components/dashboard/RecentPayments";
import ReceptionActivity from "@/components/dashboard/ReceptionActivity";
import UpcomingRenewals from "@/components/dashboard/UpcomingRenewals";
import { useAsync } from "@/hooks/useAsync";
import { dashboardService } from "@/services/dashboard.service";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getLongDate(): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function DashboardPage() {
  const { data, loading, error, refresh } = useAsync(() =>
    dashboardService.getDashboardData()
  );

  return (
    <div className="space-y-6">
      <section className="studio-glow relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-rose-600 to-amber-500 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-amber-100">
              {getLongDate()}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Reception Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-50 sm:text-base">
              {getGreeting()} — everything your front desk needs for today.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      {loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <LoadingCard title="Loading Check-ins..." />
            <LoadingCard title="Loading Trials..." />
            <LoadingCard title="Loading Collections..." />
            <LoadingCard title="Loading Follow-ups..." />
          </div>
          <LoadingCard title="Loading Reception Actions..." />
          <div className="grid gap-6 xl:grid-cols-2">
            <LoadingCard title="Loading Check-ins..." />
            <LoadingCard title="Loading Reception Queue..." />
          </div>
        </>
      )}

      {!loading && error && (
        <ErrorCard title="Unable to load reception dashboard" message={error.message} onRetry={refresh} />
      )}

      {!loading && !error && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardKpiCard
              title="Checked In Today"
              value={data.commandSummary.todayPresent}
              description="Students marked present"
              icon={UserCheck}
              tone="emerald"
            />
            <DashboardKpiCard
              title="Trials Expected"
              value={data.commandSummary.todayTrials}
              description="Prospective students scheduled today"
              icon={CalendarCheck}
              tone="violet"
            />
            <DashboardKpiCard
              title="Collected Today"
              value={formatCurrency(data.commandSummary.todayRevenue)}
              description="Completed payments received today"
              icon={IndianRupee}
              tone="blue"
            />
            <DashboardKpiCard
              title="Follow-ups Waiting"
              value={data.commandSummary.overdueFollowUps + data.commandSummary.todayFollowUps}
              description={`${data.commandSummary.overdueFollowUps} overdue · ${data.commandSummary.todayFollowUps} today`}
              icon={UserRoundSearch}
              tone="rose"
            />
          </div>

          <QuickActions />

          <div className={`rounded-2xl border p-4 shadow-sm ${
            data.commandSummary.urgentTasks > 0
              ? "border-red-200 bg-red-50/70"
              : "border-emerald-200 bg-emerald-50/70"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2 ${
                data.commandSummary.urgentTasks > 0
                  ? "bg-red-100 text-red-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">
                  {data.commandSummary.urgentTasks > 0
                    ? `${data.commandSummary.urgentTasks} urgent reception task${data.commandSummary.urgentTasks === 1 ? "" : "s"}`
                    : "Reception queue is under control"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.commandSummary.todayBirthdays} birthday{data.commandSummary.todayBirthdays === 1 ? "" : "s"} today · {data.upcomingRenewals.length} upcoming renewal{data.upcomingRenewals.length === 1 ? "" : "s"} shown
                </p>
              </div>
            </div>
          </div>

          <ReceptionActivity
            checkIns={data.recentCheckIns}
            arrivals={data.receptionArrivals}
          />

          <PriorityActions actions={data.priorityActions} />

          <div className="grid gap-6 xl:grid-cols-3">
            <UpcomingRenewals renewals={data.upcomingRenewals} />
            <BirthdayCard birthdays={data.birthdays} />
            <RecentPayments payments={data.recentPayments} />
          </div>

          <FeeDueActionCard
            feeDues={data.urgentFeeDues}
            summary={data.feeDueSummary}
            onDataChanged={refresh}
          />

          <RecentEnquiries enquiries={data.recentEnquiries} />
        </>
      )}
    </div>
  );
}
