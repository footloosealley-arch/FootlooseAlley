"use client";

import { X } from "lucide-react";

export type EditStudentForm = {
  Name: string;
  Phone: string;
  Email: string;
  Program: string;
  Fees: string;
  Fees_due: string;
  membership_plan: string;
  next_due_date: string;
  Address: string;
  Emergency_contact: string;
  gender: string;
  date_of_birth: string;
};

type Props = {
  open: boolean;
  saving: boolean;
  form: EditStudentForm;
  onClose: () => void;
  onSave: () => void;
  onChange: (form: EditStudentForm) => void;
};

export default function EditStudentModal({
  open,
  saving,
  form,
  onClose,
  onSave,
  onChange,
}: Props) {
  if (!open) return null;

  function update<K extends keyof EditStudentForm>(
    key: K,
    value: EditStudentForm[K]
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Edit Student
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <Input
            label="Student Name"
            value={form.Name}
            onChange={(v) => update("Name", v)}
          />

          <Input
            label="Phone"
            value={form.Phone}
            onChange={(v) => update("Phone", v)}
          />

          <Input
            label="Email"
            value={form.Email}
            onChange={(v) => update("Email", v)}
          />

          <Input
            label="Program"
            value={form.Program}
            onChange={(v) => update("Program", v)}
          />

          <Input
            label="Total Fees"
            type="number"
            value={form.Fees}
            onChange={(v) => update("Fees", v)}
          />

          <Input
            label="Fees Due"
            type="number"
            value={form.Fees_due}
            onChange={(v) => update("Fees_due", v)}
          />

          <Input
            label="Membership Plan"
            value={form.membership_plan}
            onChange={(v) => update("membership_plan", v)}
          />

          <Input
            label="Next Due Date"
            type="date"
            value={form.next_due_date}
            onChange={(v) => update("next_due_date", v)}
          />

          <Input
            label="Emergency Contact"
            value={form.Emergency_contact}
            onChange={(v) =>
              update("Emergency_contact", v)
            }
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Gender
            </label>

            <select
              value={form.gender}
              onChange={(e) =>
                update("gender", e.target.value)
              }
              className="w-full rounded-xl border p-3"
            >
              <option value="">
                Select Gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          <Input
            label="Date of Birth"
            type="date"
            value={form.date_of_birth}
            onChange={(v) =>
              update("date_of_birth", v)
            }
          />

        </div>

        <div className="mt-5">

          <label className="mb-2 block text-sm font-medium">
            Address
          </label>

          <textarea
            value={form.Address}
            onChange={(e) =>
              update("Address", e.target.value)
            }
            rows={4}
            className="w-full rounded-xl border p-3"
          />

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>

    </div>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

function Input({
  label,
  value,
  onChange,
  type = "text",
}: InputProps) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border p-3"
      />

    </div>
  );
}