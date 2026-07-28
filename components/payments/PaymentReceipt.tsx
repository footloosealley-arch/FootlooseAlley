import BrandLogo from "@/components/branding/BrandLogo";
import type { PaymentWithStudent } from "@/types/database";

interface PaymentReceiptProps {
  payment: PaymentWithStudent;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
}

export default function PaymentReceipt({ payment }: PaymentReceiptProps) {
  const normalizedStatus = payment.payment_status?.trim().toLowerCase();
  const isCompleted =
    !normalizedStatus ||
    normalizedStatus === "paid" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "success";

  const details = [
    ["Receipt Number", payment.receipt_number || "Not assigned"],
    ["Payment Date", formatDate(payment.payment_date)],
    ["Student Name", payment.student?.Name || "Unknown Student"],
    ["Student Phone", payment.student?.Phone],
    ["Student Code", payment.student?.student_code],
    ["Program", payment.student?.Program],
    ["Payment Method", payment.payment_method || "Not specified"],
    ["Payment Status", payment.payment_status || "Paid"],
    ["Transaction / Reference", payment.reference_number],
    ["External Invoice", payment.invoice_number],
    ["Received By", payment.received_by],
  ].filter(([, value]) => Boolean(value));

  return (
    <article id="payment-receipt-print-root" className="receipt-sheet mx-auto w-full max-w-[760px] overflow-hidden rounded-sm border border-neutral-300 bg-white text-black shadow-sm">
      <header className="border-b-4 border-[#861d2d] px-6 py-5 sm:px-8">
        <div className="flex items-start gap-5">
          <BrandLogo width={118} height={74} className="shrink-0" />
          <div className="min-w-0 border-l border-neutral-300 pl-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Footloose Alley</h2>
            <p className="mt-0.5 text-sm font-semibold text-[#861d2d]">Dance and Fitness Studio</p>
            <address className="mt-2 text-xs not-italic leading-5 text-neutral-700">
              64, 8th Cross Rd, above Monte Carlo, RMV 2nd Stage,<br />
              M S R Nagar, Mathikere, Bengaluru, Karnataka 560054<br />
              Contact: 8884978589
            </address>
          </div>
        </div>
      </header>

      <div className="px-6 py-5 sm:px-8">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-neutral-300 pb-3">
          <h1 className="text-xl font-extrabold tracking-[0.16em] text-[#861d2d] sm:text-2xl">PAYMENT RECEIPT</h1>
          <p className="text-right font-mono text-sm font-bold">{payment.receipt_number || "Not assigned"}</p>
        </div>

        <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[9rem_1fr] border-b border-neutral-200 py-2.5 text-sm sm:grid-cols-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</dt>
              <dd className="mt-0.5 break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <section className="my-5 flex items-center justify-between gap-4 rounded-sm border-2 border-neutral-900 px-4 py-4">
          <span className="text-sm font-bold uppercase tracking-wide">
            {isCompleted ? "Amount Received" : "Payment Amount"}
          </span>
          <strong className="text-2xl text-[#861d2d]">{formatCurrency(Number(payment.amount || 0))}</strong>
        </section>

        {payment.remarks && (
          <section className="mb-5 rounded-sm bg-neutral-100 px-4 py-3 text-sm">
            <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-600">Remarks</h3>
            <p className="mt-1 whitespace-pre-wrap break-words">{payment.remarks}</p>
          </section>
        )}

        <footer className="border-t border-neutral-300 pt-4 text-center text-xs text-neutral-600">
          This is a computer-generated payment receipt.
        </footer>
      </div>
    </article>
  );
}
