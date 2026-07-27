"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  BadgeCheck,
} from "lucide-react";

import type { Student } from "@/types/student";

type Props = {
  student: Student;
};

export default function ProfileHeader({ student }: Props) {
  const phone = student.Phone ?? "";

  const whatsappNumber = `91${phone.replace(/\D/g, "")}`;

  const whatsappMessage = encodeURIComponent(`Hi ${student.Name},

This is Footloose Alley Dance & Fitness Studio.

Hope you're doing well!

We're looking forward to seeing you in class. 💃🕺`);

  const status = student.Status ?? "Inactive";

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl">
      <div className="flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="flex items-center gap-6">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.Name}
              className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white text-5xl font-bold text-indigo-700 shadow-lg">
              {student.Name.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <Link
              href="/students"
              className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm transition hover:bg-white/30"
            >
              <ArrowLeft size={16} />
              Back to Students
            </Link>

            <h1 className="text-4xl font-bold">
              {student.Name}
            </h1>

            <p className="mt-2 text-lg opacity-90">
              {student.Program ?? "No Program Assigned"}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm">
                <BadgeCheck size={16} />
                {student.membership_plan ?? "No Membership"}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  status === "Active"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {status}
              </span>
            </div>

            {student.join_date && (
              <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
                <Calendar size={16} />
                Joined {student.join_date}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-wrap gap-3">
          <a
            href={`tel:${phone}`}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:bg-slate-100"
          >
            <div className="flex items-center gap-2">
              <Phone size={18} />
              Call
            </div>
          </a>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-white transition hover:bg-green-600"
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              WhatsApp
            </div>
          </a>

          {student.Email && (
            <a
              href={`mailto:${student.Email}`}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:bg-slate-100"
            >
              <div className="flex items-center gap-2">
                <Mail size={18} />
                Email
              </div>
            </a>
          )}

          <button
            className="rounded-xl bg-black/20 px-5 py-3 font-semibold transition hover:bg-black/30"
          >
            <div className="flex items-center gap-2">
              <Pencil size={18} />
              Edit
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}