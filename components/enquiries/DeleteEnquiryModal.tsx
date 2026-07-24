"use client";

interface DeleteEnquiryModalProps {
  open: boolean;
  deleting: boolean;
  studentName: string;

  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteEnquiryModal({
  open,
  deleting,
  studentName,
  onClose,
  onDelete,
}: DeleteEnquiryModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-md rounded-xl bg-white p-6">

        <h2 className="mb-4 text-xl font-bold text-red-600">
          Delete Enquiry
        </h2>

        <p className="text-gray-700">
          Are you sure you want to delete this enquiry?
        </p>

        <p className="mt-3 rounded-lg bg-red-50 p-3 font-semibold text-red-700">
          {studentName}
        </p>

                <p className="mt-4 text-sm text-gray-500">
          This action cannot be undone. Once deleted, all enquiry
          information for this person will be permanently removed.
        </p>

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
            onClick={onDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>

                  </div>

      </div>

    </div>
  );
}