import Link from "next/link";
import { CreditCard, UserPlus } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import WidgetCard from "./WidgetCard";
import type { DashboardRecentPayment } from "@/services/dashboard.service";
import type { Enquiry } from "@/types/database";

interface RecentActivityProps {
  payments: DashboardRecentPayment[];
  enquiries: Enquiry[];
}

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  href: string;
  kind: "payment" | "enquiry";
};

function formatDate(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
}

export default function RecentActivity({ payments, enquiries }: RecentActivityProps) {
  const activities: ActivityItem[] = [
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      title: payment.Students?.Name || "Student payment",
      description: `Payment of ₹${payment.amount.toLocaleString("en-IN")} recorded`,
      date: payment.payment_date,
      href: "/payments",
      kind: "payment" as const,
    })),
    ...enquiries.map((enquiry) => ({
      id: `enquiry-${enquiry.id}`,
      title: enquiry.Name || `Enquiry #${enquiry.id}`,
      description: enquiry.Program ? `New enquiry for ${enquiry.Program}` : "New studio enquiry",
      date: enquiry.created_at,
      href: "/enquiries",
      kind: "enquiry" as const,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  return (
    <WidgetCard title="Recent Activity" description="Latest payments and enquiries across the studio">
      {activities.length === 0 ? (
        <EmptyState title="No recent activity" description="New payments and enquiries will appear here." />
      ) : (
        <div className="space-y-1">
          {activities.map((activity, index) => {
            const Icon = activity.kind === "payment" ? CreditCard : UserPlus;
            return (
              <Link key={activity.id} href={activity.href} className="group flex gap-3 rounded-xl p-3 transition hover:bg-muted/40">
                <div className="relative flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  {index < activities.length - 1 && <div className="mt-1 h-full min-h-4 w-px bg-border" />}
                </div>
                <div className="min-w-0 flex-1 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate font-medium group-hover:text-primary">{activity.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(activity.date)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
