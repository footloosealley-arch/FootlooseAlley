import Link from "next/link";
import { CalendarClock, ExternalLink } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import WidgetCard from "./WidgetCard";
import type { DashboardUpcomingRenewal } from "@/services/dashboard.service";

interface UpcomingRenewalsProps {
  renewals: DashboardUpcomingRenewal[];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

export default function UpcomingRenewals({ renewals }: UpcomingRenewalsProps) {
  return (
    <WidgetCard
      title="Upcoming Renewals"
      description="Memberships ending in the next 30 days"
      action={
        <Link href="/students" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View students <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {renewals.length === 0 ? (
        <EmptyState title="No upcoming renewals" description="No memberships expire during the next 30 days." />
      ) : (
        <div className="space-y-3">
          {renewals.map((renewal) => (
            <Link
              key={renewal.studentId}
              href={`/students/${renewal.studentId}`}
              className="flex items-center justify-between gap-4 rounded-xl border p-3 transition hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{renewal.studentName}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {renewal.membershipPlan || "Membership"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="flex items-center justify-end gap-1 text-sm font-semibold">
                  <CalendarClock className="h-4 w-4" /> {formatDate(renewal.endDate)}
                </p>
                <p className={`mt-1 text-xs ${renewal.daysRemaining <= 7 ? "text-red-600" : "text-muted-foreground"}`}>
                  {renewal.daysRemaining === 0 ? "Ends today" : `${renewal.daysRemaining} days left`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
