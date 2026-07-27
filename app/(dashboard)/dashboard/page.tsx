"use client";

import PageHeader from "@/components/layout/PageHeader";

import DashboardGrid from "@/components/dashboard/DashboardGrid";
import RevenueCard from "@/components/dashboard/RevenueCard";
import AttendanceCard from "@/components/dashboard/AttendanceCard";
import BirthdayCard from "@/components/dashboard/BirthdayCard";
import RecentEnquiries from "@/components/dashboard/RecentEnquiries";
import RecentPayments from "@/components/dashboard/RecentPayments";
import QuickActions from "@/components/dashboard/QuickActions";

import LoadingCard from "@/components/common/LoadingCard";
import ErrorCard from "@/components/common/ErrorCard";

import { useAsync } from "@/hooks/useAsync";
import { dashboardService } from "@/services/dashboard.service";

export default function DashboardPage() {
  const {
    data,
    loading,
    error,
    refresh,
  } = useAsync(() =>
    dashboardService.getDashboardData()
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome to Footloose Alley Studio Manager"
      />

      {loading && (
        <DashboardGrid>
          <LoadingCard title="Loading Revenue..." />
          <LoadingCard title="Loading Attendance..." />
          <LoadingCard title="Loading Birthdays..." />
        </DashboardGrid>
      )}

      {!loading && error && (
        <ErrorCard
          title="Unable to load dashboard"
          message={error.message}
          onRetry={refresh}
        />
      )}

      {!loading && !error && data && (
        <>
          <DashboardGrid>
            <RevenueCard
              stats={data.stats}
            />

            <AttendanceCard
              stats={data.stats}
            />

            <BirthdayCard
              birthdays={data.birthdays}
            />
          </DashboardGrid>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RecentEnquiries
              enquiries={data.recentEnquiries}
            />

            <RecentPayments
              payments={data.recentPayments}
            />
          </div>

          <div className="mt-6">
            <QuickActions />
          </div>
        </>
      )}
    </>
  );
}