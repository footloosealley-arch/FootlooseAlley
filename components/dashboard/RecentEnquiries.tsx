import Link from "next/link";

import WidgetCard from "./WidgetCard";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";

import type { Enquiry } from "@/types/database";

interface RecentEnquiriesProps {
  enquiries: Enquiry[];
}

export default function RecentEnquiries({
  enquiries,
}: RecentEnquiriesProps) {
  return (
    <WidgetCard
      title="Recent Enquiries"
      description="Latest student enquiries"
    >
      {enquiries.length === 0 ? (
        <EmptyState
          title="No Enquiries"
          description="There are no recent enquiries."
        />
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {enquiry.Name}
                </p>

                <p className="truncate text-sm text-muted-foreground">
                  {enquiry.Phone}
                </p>
              </div>

              <div className="ml-4 flex items-center gap-3">
                <StatusBadge status={enquiry.Status} />

                <Link
                  href={`/enquiries/${enquiry.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}