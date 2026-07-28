import {
  Banknote,
  Building2,
  CircleDollarSign,
  CreditCard,
  Landmark,
  Smartphone,
} from "lucide-react";

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function PaymentStatusBadge({
  status,
}: {
  status: string | null;
}) {
  const value = normalize(status) || "paid";

  const className =
    value === "paid" || value === "completed" || value === "success"
      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
      : value === "pending" || value === "partial"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
        : value === "failed" || value === "cancelled"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          : "border-border bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${className}`}
    >
      {status?.trim() || "Paid"}
    </span>
  );
}

export function PaymentMethodBadge({
  method,
}: {
  method: string | null;
}) {
  const value = normalize(method);
  const label = method?.trim() || "Other";

  const Icon =
    value === "cash"
      ? Banknote
      : value === "upi"
        ? Smartphone
        : value === "card"
          ? CreditCard
          : value === "bank transfer"
            ? Landmark
            : value === "cheque"
              ? Building2
              : CircleDollarSign;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {label}
    </span>
  );
}
