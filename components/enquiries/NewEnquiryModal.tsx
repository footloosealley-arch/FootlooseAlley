"use client";

import { Save, X } from "lucide-react";

type FormData = {
  Name: string;
  Phone: string;
  Email: string;
  Program: string;
  Status: string;
  Follow_up_date: string;
  Notes: string;
  source: string;
  assigned_to: string;
  last_contacted: string;
  trial_date: string;
};

interface NewEnquiryModalProps {
  open: boolean;
  saving: boolean;
  form: FormData;
  onClose: () => void;
  onSave: () => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

export default function NewEnquiryModal({
  open,
  saving,
  form,
  onClose,
  onSave,
  onChange,
}: NewEnquiryModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-2xl sm:rounded-xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold">
            New Enquiry
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <div className="min-h-0 flex-1 touch-pan-y overflow-y-scroll overscroll-contain px-4 py-5 [-webkit-overflow-scrolling:touch] sm:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Name */}
          <div>
            <label className="mb-1 block font-medium">
              Name
            </label>

            <input
              name="Name"
              value={form.Name}
              onChange={onChange}
              placeholder="Student Name"
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block font-medium">
              Phone
            </label>

            <input
              name="Phone"
              value={form.Phone}
              onChange={onChange}
              placeholder="9876543210"
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block font-medium">
              Email
            </label>

            <input
              type="email"
              name="Email"
              value={form.Email}
              onChange={onChange}
              placeholder="example@email.com"
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Program */}
          <div>
            <label className="mb-1 block font-medium">
              Program
            </label>

            <input
              name="Program"
              value={form.Program}
              onChange={onChange}
              placeholder="Zumba / Yoga / Hip Hop"
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block font-medium">
              Status
            </label>

            <select
              name="Status"
              value={form.Status}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            >
              <option>New</option>
              <option>Contacted</option>
              <option>Follow Up</option>
              <option>Joined</option>
              <option>Not Interested</option>
            </select>
          </div>

          {/* Follow Up */}
          <div>
            <label className="mb-1 block font-medium">
              Follow-up Date
            </label>

            <input
              type="date"
              name="Follow_up_date"
              value={form.Follow_up_date}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Source */}
          <div>
            <label className="mb-1 block font-medium">
              Source
            </label>

            <input
              name="source"
              value={form.source}
              onChange={onChange}
              placeholder="Instagram, Walk-in..."
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Trial Date */}
          <div>
            <label className="mb-1 block font-medium">
              Trial Date
            </label>

            <input
              type="date"
              name="trial_date"
              value={form.trial_date}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">
              Notes
            </label>

            <textarea
              name="Notes"
              value={form.Notes}
              onChange={onChange}
              rows={4}
              className="w-full rounded-lg border p-2"
            />
          </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-5 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Enquiry"}
          </button>
        </div>

      </div>
    </div>
  );
}
