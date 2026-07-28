import { WalletCards } from "lucide-react";

import type { PaymentWithStudent } from "@/types/database";

interface PaymentMethodBreakdownProps {
  payments: PaymentWithStudent[];
  formatCurrency: (value: number) => string;
}

function isCompleted(status: string | null) {
  const value = status?.trim().toLowerCase();
  return !value || value === "paid" || value === "completed" || value === "success";
}

export default function PaymentMethodBreakdown({
  payments,
  formatCurrency,
}: PaymentMethodBreakdownProps) {
  const totals = payments
    .filter((payment) => isCompleted(payment.payment_status))
    .reduce<Record<string, number>>((result, payment) => {
      const method = payment.payment_method?.trim() || "Other";
      result[method] = (result[method] ?? 0) + Number(payment.amount ?? 0);
      return result;
    }, {});

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grandTotal = entries.reduce((total, [, amount]) => total + amount, 0);

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Collection by Method</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Completed payments in the current payment history.
          </p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <WalletCards className="h-5 w-5" />
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="mt-5 rounded-lg bg-muted/50 px-4 py-5 text-center text-sm text-muted-foreground">
          No completed payments available yet.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {entries.map(([method, amount]) => {
            const percentage = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;

            return (
              <div key={method}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{method}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(amount)} · {percentage}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
