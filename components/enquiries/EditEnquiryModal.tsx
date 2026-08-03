"use client";

export type EditForm = {
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

interface EditEnquiryModalProps {
  open: boolean;
  saving: boolean;
  form: EditForm;

  onClose: () => void;
  onSave: () => void;

  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => void;
}

export default function EditEnquiryModal({
  open,
  saving,
  form,
  onClose,
  onSave,
  onChange,
}: EditEnquiryModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-2 sm:p-4">

      <div className="mx-auto my-2 w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl sm:my-4 sm:p-6">

        <h2 className="mb-6 text-2xl font-bold">
          Edit Enquiry
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              name="Name"
              value={form.Name}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Phone
            </label>

            <input
              name="Phone"
              value={form.Phone}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              name="Email"
              value={form.Email}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Program
            </label>

            <input
              name="Program"
              value={form.Program}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Status
            </label>

            <select
              name="Status"
              value={form.Status}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            >
              <option value="New">New</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Trial Booked">Trial Booked</option>
              <option value="Joined">Joined</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

                    <div>
            <label className="mb-1 block text-sm font-medium">
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

          <div>
            <label className="mb-1 block text-sm font-medium">
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

          <div>
            <label className="mb-1 block text-sm font-medium">
              Source
            </label>

            <input
              name="source"
              value={form.source}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Assigned To
            </label>

            <input
              name="assigned_to"
              value={form.assigned_to}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Last Contacted
            </label>

            <input
              type="date"
              name="last_contacted"
              value={form.last_contacted}
              onChange={onChange}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
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

        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </div>

    </div>
  );
}