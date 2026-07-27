import Link from "next/link";

import WidgetCard from "./WidgetCard";
import EmptyState from "@/components/common/EmptyState";

interface PaymentWithStudent {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  Students?: {
    Name: string | null;
  } | null;
}

interface RecentPaymentsProps {
  payments: PaymentWithStudent[];
}

export default function RecentPayments({
  payments,
}: RecentPaymentsProps) {
  return (
    <WidgetCard
      title="Recent Payments"
      description="Latest fee collections"
    >
      {payments.length === 0 ? (
        <EmptyState
          title="No Payments"
          description="No recent payments found."
        />
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {payment.Students?.Name ?? "Unknown Student"}
                </p>

                <p className="text-sm text-muted-foreground">
                  {new Date(
                    payment.payment_date
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="ml-4 text-right">
                <p className="font-semibold">
                  ₹{Number(payment.amount).toLocaleString()}
                </p>

                {payment.payment_method && (
                  <p className="text-xs text-muted-foreground">
                    {payment.payment_method}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              href="/payments"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All Payments →
            </Link>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}