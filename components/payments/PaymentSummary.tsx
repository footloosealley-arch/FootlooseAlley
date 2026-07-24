import type { Student } from "@/types/student";

type Props = {
  student: Student;
  totalPaid: number;
};

export default function PaymentSummary({
  student,
  totalPaid,
}: Props) {
  const totalFees = student.Fees ?? 0;
  const balance = Math.max(student.Fees_due ?? 0, 0);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Payment Summary
        </h2>

        <p className="text-sm text-slate-500">
          Current fee status
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Total Fees</span>

          <span className="text-xl font-bold">
            ₹{totalFees.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Paid</span>

          <span className="text-xl font-bold text-green-600">
            ₹{totalPaid.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-semibold">
            Outstanding
          </span>

          <span
            className={`text-2xl font-bold ${
              balance > 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            ₹{balance.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}