import Link from "next/link";

import {
  CalendarClock,
  ExternalLink,
} from "lucide-react";

import WidgetCard from "./WidgetCard";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";

import type { Enquiry } from "@/types/database";

interface RecentEnquiriesProps {
  enquiries: Enquiry[];
}

type DashboardEnquiry = Enquiry & {
  Name?: string | null;
  Phone?: string | null;
  Program?: string | null;
  Status?: string | null;
  Follow_up_date?: string | null;
};

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "No follow-up";
  }

  const [year, month, day] =
    value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(year, month - 1, day)
  );
}

export default function RecentEnquiries({
  enquiries,
}: RecentEnquiriesProps) {
  const dashboardEnquiries =
    enquiries as DashboardEnquiry[];

  return (
    <WidgetCard
      title="Recent Enquiries"
      description="Latest prospective students"
      action={
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {dashboardEnquiries.length ===
      0 ? (
        <EmptyState
          title="No Enquiries"
          description="There are no recent enquiries."
        />
      ) : (
        <div className="space-y-3">
          {dashboardEnquiries.map(
            (enquiry) => (
              <Link
                key={enquiry.id}
                href="/enquiries"
                className="flex items-center justify-between gap-4 rounded-xl border p-3 transition hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {enquiry.Name ||
                      `Enquiry #${enquiry.id}`}
                  </p>

                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {enquiry.Program ||
                      enquiry.Phone ||
                      "No program selected"}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />

                    {formatDate(
                      enquiry.Follow_up_date
                    )}
                  </p>
                </div>

                <StatusBadge
                  status={
                    enquiry.Status ??
                    "New"
                  }
                />
              </Link>
            )
          )}
        </div>
      )}
    </WidgetCard>
  );
}