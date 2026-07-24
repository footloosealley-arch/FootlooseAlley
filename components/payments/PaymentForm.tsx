"use client";

import { useState } from "react";
import {
  IndianRupee,
  Calendar,
  CreditCard,
  User,
  FileText,
} from "lucide-react";

export type PaymentFormData = {
  amount: number;
  payment_date: string;
  payment_method: string;
  remarks: string;
  received_by: string;
};

type Props = {
  onSave: (payment: PaymentFormData) => Promise<void>;
  onCancel: () => void;
};

export default function PaymentForm({
  onSave,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<PaymentFormData>({
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "Cash",
    remarks: "",
    received_by: "",
  });

  function update<K extends keyof PaymentFormData>(
    key: K,
    value: PaymentFormData[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    try {
      setLoading(true);
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-slate-800">
        Record Payment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-slate-700">
            <IndianRupee size={18} />
            Amount
          </label>

          <input
            type="number"
            min="1"
            value={form.amount}
            onChange={(e) =>
              update("amount", Number(e.target.value))
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-slate-700">
            <Calendar size={18} />
            Payment Date
          </label>

          <input
            type="date"
            value={form.payment_date}
            onChange={(e) =>
              update("payment_date", e.target.value)
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Method */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-slate-700">
            <CreditCard size={18} />
            Payment Method
          </label>

          <select
            value={form.payment_method}
            onChange={(e) =>
              update("payment_method", e.target.value)
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Bank Transfer</option>
          </select>
        </div>

        {/* Received By */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-slate-700">
            <User size={18} />
            Received By
          </label>

          <input
            value={form.received_by}
            onChange={(e) =>
              update("received_by", e.target.value)
            }
            placeholder="Instructor / Staff Name"
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-slate-700">
            <FileText size={18} />
            Remarks
          </label>

          <textarea
            value={form.remarks}
            onChange={(e) =>
              update("remarks", e.target.value)
            }
            rows={4}
            placeholder="Optional notes..."
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}