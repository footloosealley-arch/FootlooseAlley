"use client";

import {
  Search,
  Receipt,
  Printer,
} from "lucide-react";
import { useMemo, useState } from "react";

export type Payment = {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  remarks: string | null;
};

type Props = {
  payments: Payment[];
  totalFees: number;
};

export default function PaymentHistory({
  payments,
  totalFees,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const method =
        payment.payment_method?.toLowerCase() ?? "";

      const remarks =
        payment.remarks?.toLowerCase() ?? "";

      return (
        method.includes(search.toLowerCase()) ||
        remarks.includes(search.toLowerCase()) ||
        String(payment.amount).includes(search)
      );
    });
  }, [payments, search]);

  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount ?? 0),
    0
  );

  const balance = Math.max(
    totalFees - totalPaid,
    0
  );

  function badgeColor(method: string) {
    switch (method) {
      case "Cash":
        return "bg-green-100 text-green-700";

      case "Card":
        return "bg-blue-100 text-blue-700";

      case "UPI":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h2 className="text-2xl font-bold">
            Payment History
          </h2>

          <p className="text-slate-500">
            Complete payment records.
          </p>

        </div>

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            placeholder="Search payment..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="rounded-xl border py-3 pl-10 pr-4"
          />

        </div>

      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">

        <SummaryCard
          title="Total Paid"
          value={`₹${totalPaid}`}
          color="green"
        />

        <SummaryCard
          title="Outstanding"
          value={`₹${balance}`}
          color="red"
        />

        <SummaryCard
          title="Transactions"
          value={String(payments.length)}
          color="purple"
        />

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Receipt
              </th>

              <th className="p-4 text-left">
                Date
              </th>

              <th className="p-4 text-left">
                Amount
              </th>

              <th className="p-4 text-left">
                Method
              </th>

              <th className="p-4 text-left">
                Remarks
              </th>

              <th className="p-4 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredPayments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-4 font-semibold">
                  <div className="flex items-center gap-2">

                    <Receipt size={16} />

                    REC-
                    {String(payment.id).padStart(
                      5,
                      "0"
                    )}

                  </div>
                </td>

                <td className="p-4">
                  {new Date(
                    payment.payment_date
                  ).toLocaleDateString()}
                </td>

                <td className="p-4 font-bold text-green-600">
                  ₹{payment.amount}
                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${badgeColor(
                      payment.payment_method
                    )}`}
                  >
                    {payment.payment_method}
                  </span>

                </td>

                <td className="p-4">
                  {payment.remarks || "-"}
                </td>

                <td className="p-4 text-center">

                  <button
                    onClick={() =>
                      window.print()
                    }
                    className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200"
                  >
                    <Printer size={18} />
                  </button>

                </td>

              </tr>
            ))}

            {filteredPayments.length === 0 && (
              <tr>

                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500"
                >
                  No payment records found.
                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: "green" | "red" | "purple";
}) {
  const styles = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="rounded-xl border p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2
        className={`mt-2 text-2xl font-bold ${styles[color]}`}
      >
        {value}
      </h2>

    </div>
  );
}