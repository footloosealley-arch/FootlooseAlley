"use client";

import { X, IndianRupee } from "lucide-react";

export type PaymentForm = {
  amount: string;
  payment_method: string;
  payment_date: string;
  remarks: string;
};

type Props = {
  open: boolean;
  saving: boolean;
  dueAmount: number;
  form: PaymentForm;
  onClose: () => void;
  onSave: () => void;
  onChange: (form: PaymentForm) => void;
};

export default function AddPaymentModal({
  open,
  saving,
  dueAmount,
  form,
  onClose,
  onSave,
  onChange,
}: Props) {
  if (!open) return null;

  function update<K extends keyof PaymentForm>(
    key: K,
    value: PaymentForm[K]
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  const amount = Number(form.amount || 0);

  const remaining = Math.max(
    dueAmount - amount,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Add Payment
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="mb-6 rounded-xl bg-purple-50 p-5">

          <div className="flex items-center gap-3">

            <IndianRupee className="text-purple-600" />

            <div>

              <p className="text-sm text-slate-500">
                Outstanding Balance
              </p>

              <h2 className="text-3xl font-bold text-purple-700">
                ₹{dueAmount}
              </h2>

            </div>

          </div>

        </div>

        <div className="space-y-5">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Payment Amount
            </label>

            <input
              type="number"
              value={form.amount}
              onChange={(e) =>
                update("amount", e.target.value)
              }
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Payment Method
            </label>

            <select
              value={form.payment_method}
              onChange={(e) =>
                update(
                  "payment_method",
                  e.target.value
                )
              }
              className="w-full rounded-xl border p-3"
            >

              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>

            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Payment Date
            </label>

            <input
              type="date"
              value={form.payment_date}
              onChange={(e) =>
                update(
                  "payment_date",
                  e.target.value
                )
              }
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Remarks
            </label>

            <textarea
              rows={4}
              value={form.remarks}
              onChange={(e) =>
                update("remarks", e.target.value)
              }
              className="w-full rounded-xl border p-3"
            />

          </div>

        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">

          <div className="flex justify-between">

            <span className="text-slate-500">
              Outstanding
            </span>

            <span className="font-semibold">
              ₹{dueAmount}
            </span>

          </div>

          <div className="mt-2 flex justify-between">

            <span className="text-slate-500">
              Paying
            </span>

            <span className="font-semibold text-green-600">
              ₹{amount}
            </span>

          </div>

          <div className="mt-2 border-t pt-3 flex justify-between">

            <span className="font-semibold">
              Remaining
            </span>

            <span className="text-xl font-bold text-red-600">
              ₹{remaining}
            </span>

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={onSave}
            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white"
          >
            {saving
              ? "Saving..."
              : "Save Payment"}
          </button>

        </div>

      </div>

    </div>
  );
}