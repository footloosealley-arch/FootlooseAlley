"use client";

import { X } from "lucide-react";

type Class = {
  id: number;
  class_name: string;
};

type Instructor = {
  id: number;
  name: string;
};

interface ConvertStudentModalProps {
  open: boolean;
  classes: Class[];
  instructors: Instructor[];
  selectedClass?: number;
  selectedInstructor?: number;
  onClose: () => void;
  onClassChange: (value: number) => void;
  onInstructorChange: (value: number) => void;
  onConvert: () => void;
}

export default function ConvertStudentModal({
  open,
  classes,
  instructors,
  selectedClass,
  selectedInstructor,
  onClose,
  onClassChange,
  onInstructorChange,
  onConvert,
}: ConvertStudentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-2 sm:p-4">
      <div className="max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Convert Student
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">

          {/* Class */}
          <div>
            <label className="mb-1 block font-medium">
              Class
            </label>

            <select
              value={selectedClass ?? ""}
              onChange={(e) =>
                onClassChange(Number(e.target.value))
              }
              className="w-full rounded-lg border p-2"
            >
              <option value="">
                Select Class
              </option>

              {classes.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.class_name}
                </option>
              ))}
            </select>
          </div>

          {/* Instructor */}
          <div>
            <label className="mb-1 block font-medium">
              Instructor
            </label>

            <select
              value={selectedInstructor ?? ""}
              onChange={(e) =>
                onInstructorChange(Number(e.target.value))
              }
              className="w-full rounded-lg border p-2"
            >
              <option value="">
                Select Instructor
              </option>

              {instructors.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

                  </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-5 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConvert}
            className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
          >
            Convert Student
          </button>
        </div>

      </div>
    </div>
  );
}
