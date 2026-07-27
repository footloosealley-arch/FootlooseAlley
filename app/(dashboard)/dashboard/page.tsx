"use client";

import PageHeader from "@/components/layout/PageHeader";

import AttendanceCard from "@/components/dashboard/AttendanceCard";
import BirthdayCard from "@/components/dashboard/BirthdayCard";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import FeeDueActionCard from "@/components/dashboard/FeeDueActionCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentEnquiries from "@/components/dashboard/RecentEnquiries";
import RecentPayments from "@/components/dashboard/RecentPayments";
import RevenueCard from "@/components/dashboard/RevenueCard";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";

import { useAsync } from "@/hooks/useAsync";

import {
  dashboardService,
} from "@/services/dashboard.service";

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
        <>
          <DashboardGrid>
            <LoadingCard title="Loading Revenue..." />

            <LoadingCard title="Loading Attendance..." />

            <LoadingCard title="Loading Birthdays..." />
          </DashboardGrid>

          <div className="mt-6">
            <LoadingCard title="Loading Fee Dues..." />
          </div>
        </>
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
            <RevenueCard stats={data.stats} />

            <AttendanceCard stats={data.stats} />

            <BirthdayCard
              birthdays={data.birthdays}
            />
          </DashboardGrid>

          <div className="mt-6">
            <FeeDueActionCard
              feeDues={data.urgentFeeDues}
            />
          </div>

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