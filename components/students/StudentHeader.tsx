"use client";

import {
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  User,
} from "lucide-react";

type StudentHeaderStudent = {
  id: number;
  Name: string;
  Phone: string | null;
  Program: string | null;
  membership_plan: string | null;
  Status: string | null;
  student_code: string | null;
  batch: string | null;
  photo_url: string | null;
};

type Props = {
  student: StudentHeaderStudent;

  className?: string;
  instructorName?: string;
  classSchedule?: string;

  onEdit: () => void;
  onDelete: () => void;
};

export default function StudentHeader({
  student,
  className,
  instructorName,
  classSchedule,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.Name}
              className="h-28 w-28 rounded-full border-4 border-purple-100 object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100">
              <User size={52} className="text-slate-400" />
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold">{student.Name}</h1>

            <p className="mt-1 text-slate-500">
              {student.student_code || "No Student Code"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {student.Program && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                  {student.Program}
                </span>
              )}

              {student.membership_plan && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {student.membership_plan}
                </span>
              )}

              {student.batch && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  Batch {student.batch}
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  student.Status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {student.Status ?? "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {student.Phone && (
            <>
              <a
                href={`tel:${student.Phone}`}
                className="flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-200"
              >
                <Phone size={18} />
                Call
              </a>

              <a
                href={`https://wa.me/91${student.Phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-3 font-semibold text-green-700 transition hover:bg-green-200"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </>
          )}

          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl bg-purple-100 px-4 py-3 font-semibold text-purple-700 transition hover:bg-purple-200"
          >
            <Pencil size={18} />
            Edit
          </button>

          <button
            onClick={onDelete}
            className="flex items-center gap-2 rounded-xl bg-red-100 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-200"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {(className || instructorName || classSchedule) && (
        <div className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Class</p>
            <p className="mt-1 font-semibold">{className || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Instructor</p>
            <p className="mt-1 font-semibold">{instructorName || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Schedule</p>
            <p className="mt-1 font-semibold">{classSchedule || "-"}</p>
          </div>
        </div>
      )}
    </div>
  );
}