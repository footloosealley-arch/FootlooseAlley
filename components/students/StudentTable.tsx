"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Eye,
  MessageCircle,
  Pencil,
  Phone,
} from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import LoadingCard from "@/components/common/LoadingCard";
import StatusBadge from "@/components/common/StatusBadge";

import type { Student } from "@/types/database";

interface StudentTableProps {
  students: Student[];
  loading?: boolean;
}

function getInitials(
  name: string | null | undefined
) {
  if (!name?.trim()) {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getWhatsAppNumber(
  phone: string | null | undefined
) {
  if (!phone) {
    return "";
  }

  const cleanedPhone =
    phone.replace(/\D/g, "");

  if (!cleanedPhone) {
    return "";
  }

  if (cleanedPhone.startsWith("91")) {
    return cleanedPhone;
  }

  return `91${cleanedPhone}`;
}

function formatJoinDate(
  value: string | null | undefined
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

export default function StudentTable({
  students,
  loading = false,
}: StudentTableProps) {
  if (loading) {
    return (
      <LoadingCard title="Loading students..." />
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        title="No Students Found"
        description="No students match your current filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Student
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Contact
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Program
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>

              <th className="px-4 py-3 text-right text-sm font-semibold">
                Fees Due
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Joined
              </th>

              <th className="px-4 py-3 text-center text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const profileUrl =
                `/students/${student.id}`;

              const whatsappNumber =
                getWhatsAppNumber(
                  student.Phone
                );

              return (
                <tr
                  key={student.id}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={profileUrl}
                      className="group flex w-fit items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      title="View student profile"
                    >
                      {student.photo_url ? (
                        <Image
                          src={student.photo_url}
                          alt={
                            student.Name ??
                            "Student photograph"
                          }
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover transition group-hover:opacity-90"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground transition group-hover:opacity-90">
                          {getInitials(
                            student.Name
                          )}
                        </div>
                      )}

                      <div>
                        <p className="font-medium text-foreground transition-colors group-hover:text-primary group-hover:underline">
                          {student.Name ??
                            "Unnamed Student"}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {student.student_code ??
                            "No Code"}
                        </p>
                      </div>
                    </Link>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p>
                        {student.Phone ?? "-"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {student.Email ?? "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p>
                        {student.Program ?? "-"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {student.batch ?? "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge
                      status={
                        student.Status ??
                        "Inactive"
                      }
                    />
                  </td>

                  <td className="px-4 py-4 text-right font-semibold">
                    ₹
                    {Number(
                      student.Fees_due ?? 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-4">
                    {formatJoinDate(
                      student.join_date
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={profileUrl}
                        className="rounded-md border p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="View Profile"
                        aria-label={`View ${
                          student.Name ??
                          "student"
                        } profile`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/students/${student.id}/edit`}
                        className="rounded-md border p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Edit Student"
                        aria-label={`Edit ${
                          student.Name ??
                          "student"
                        }`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      {student.whatsapp_enabled &&
                        whatsappNumber && (
                          <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border p-2 text-green-600 transition-colors hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                            title="WhatsApp"
                            aria-label={`Send WhatsApp message to ${
                              student.Name ??
                              "student"
                            }`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}

                      {student.Phone && (
                        <a
                          href={`tel:${student.Phone}`}
                          className="rounded-md border p-2 text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          title="Call Student"
                          aria-label={`Call ${
                            student.Name ??
                            "student"
                          }`}
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">
            {students.length}
          </span>{" "}
          student
          {students.length !== 1
            ? "s"
            : ""}
        </p>

        <p className="text-xs text-muted-foreground">
          Footloose Alley Studio Manager
        </p>
      </div>
    </div>
  );
}