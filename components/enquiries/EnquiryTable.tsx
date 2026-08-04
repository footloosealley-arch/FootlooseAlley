"use client";

import Link from "next/link";
import {
  CalendarClock,
  Ban,
  Check,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
  UserPlus,
} from "lucide-react";

import StatusBadge from "@/components/enquiries/StatusBadge";

export type Enquiry = {
  id: number;
  created_at: string;

  Name: string | null;
  Phone: string | null;
  Email: string | null;
  Program: string | null;
  Status: string | null;
  Follow_up_date: string | null;
  Notes: string | null;
  source: string | null;
  assigned_to: string | null;
  last_contacted: string | null;
  trial_date: string | null;
  trial_status?: string | null;
  trial_notes?: string | null;

  converted_student_id?: number | null;
};

interface EnquiryTableProps {
  loading: boolean;
  enquiries: Enquiry[];
  markingFollowUpId?: number | null;

  onEdit: (enquiry: Enquiry) => void;
  onDelete: (enquiry: Enquiry) => void;
  onConvert: (enquiry: Enquiry) => void;
  onMarkFollowedUp: (enquiry: Enquiry) => void;
  onCancelTrial: (enquiry: Enquiry) => void;
}

function getTodayString(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isFinishedStatus(
  status: string | null
): boolean {
  return (
    status === "Joined" ||
    status === "Converted" ||
    status === "Closed" ||
    status === "Not Interested"
  );
}

function getFollowUpState(
  enquiry: Enquiry
):
  | "overdue"
  | "today"
  | "upcoming"
  | "none" {
  if (
    !enquiry.Follow_up_date ||
    isFinishedStatus(enquiry.Status)
  ) {
    return "none";
  }

  const today = getTodayString();

  if (enquiry.Follow_up_date < today) {
    return "overdue";
  }

  if (enquiry.Follow_up_date === today) {
    return "today";
  }

  return "upcoming";
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "-";
  }

  const [year, month, day] =
    value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(year, month - 1, day)
  );
}

function getWhatsAppUrl(
  phone: string | null,
  name: string | null
): string {
  let cleanNumber = (
    phone ?? ""
  ).replace(/\D/g, "");

  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }

  const customerName =
    name?.trim() || "there";

  const message = encodeURIComponent(
    `Hi ${customerName}, this is Footloose Alley Dance & Fitness Studio. We are following up regarding your enquiry. Please let us know how we can assist you.`
  );

  return `https://wa.me/${cleanNumber}?text=${message}`;
}

function getCallUrl(
  phone: string | null
): string {
  const cleanNumber = (
    phone ?? ""
  ).replace(/[^\d+]/g, "");

  return `tel:${cleanNumber}`;
}

function FollowUpBadge({
  enquiry,
}: {
  enquiry: Enquiry;
}) {
  const state =
    getFollowUpState(enquiry);

  if (state === "none") {
    return (
      <span className="text-sm text-gray-400">
        No follow-up
      </span>
    );
  }

  const classes = {
    overdue:
      "bg-red-100 text-red-700",
    today:
      "bg-amber-100 text-amber-700",
    upcoming:
      "bg-green-100 text-green-700",
  };

  const labels = {
    overdue: "Overdue",
    today: "Today",
    upcoming: "Upcoming",
  };

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${classes[state]}`}
      >
        <CalendarClock size={13} />
        {labels[state]}
      </span>

      <p className="text-xs text-gray-500">
        {formatDate(
          enquiry.Follow_up_date
        )}
      </p>
    </div>
  );
}

export default function EnquiryTable({
  loading,
  enquiries,
  markingFollowUpId,
  onEdit,
  onDelete,
  onConvert,
  onMarkFollowedUp,
  onCancelTrial,
}: EnquiryTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Enquiry
              </th>

              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Program
              </th>

              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Follow-up
              </th>

              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Source
              </th>

              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="p-12 text-center text-gray-500"
                >
                  Loading enquiries...
                </td>
              </tr>
            )}

            {!loading &&
              enquiries.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center"
                  >
                    <p className="font-medium text-gray-700">
                      No enquiries found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Try changing your
                      search or filters.
                    </p>
                  </td>
                </tr>
              )}

            {!loading &&
              enquiries.map(
                (enquiry) => {
                  const phoneAvailable =
                    Boolean(
                      enquiry.Phone?.trim()
                    );

                  const isJoined =
                    enquiry.Status ===
                      "Joined" ||
                    enquiry.Status ===
                      "Converted";

                  const followUpState =
                    getFollowUpState(
                      enquiry
                    );

                  const canMarkFollowedUp =
                    followUpState !==
                      "none" &&
                    !isJoined;

                  const isMarking =
                    markingFollowUpId ===
                    enquiry.id;

                  return (
                    <tr
                      key={enquiry.id}
                      className="border-b border-gray-100 align-top transition-colors last:border-b-0 hover:bg-gray-50/70"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {enquiry.Name ||
                              "Unnamed enquiry"}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {enquiry.Phone ||
                              "No phone"}
                          </p>

                          {enquiry.Email && (
                            <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                              {
                                enquiry.Email
                              }
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-medium text-gray-800">
                          {enquiry.Program ||
                            "-"}
                        </p>

                        {enquiry.trial_date && (
                          <p className="mt-1 text-xs text-purple-600">
                            Trial:{" "}
                            {formatDate(
                              enquiry.trial_date
                            )}
                          </p>
                        )}
                        {enquiry.trial_status && <p className={`mt-1 text-xs font-semibold ${enquiry.trial_status === "Cancelled" ? "text-red-600" : "text-emerald-600"}`}>{enquiry.trial_status}</p>}
                      </td>

                      <td className="p-4">
                        <StatusBadge
                          status={
                            enquiry.Status
                          }
                        />
                      </td>

                      <td className="p-4">
                        <FollowUpBadge
                          enquiry={enquiry}
                        />

                        {enquiry.assigned_to && (
                          <p className="mt-2 text-xs text-gray-500">
                            Assigned to:{" "}
                            {
                              enquiry.assigned_to
                            }
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {enquiry.source ||
                            "Not specified"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex max-w-[310px] flex-wrap items-center gap-2">
                          <a
                            href={
                              phoneAvailable
                                ? getWhatsAppUrl(
                                    enquiry.Phone,
                                    enquiry.Name
                                  )
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp ${
                              enquiry.Name ??
                              "enquiry"
                            }`}
                            title="WhatsApp"
                            className={`rounded-lg p-2 transition ${
                              phoneAvailable
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "pointer-events-none bg-gray-100 text-gray-400"
                            }`}
                          >
                            <MessageCircle
                              size={18}
                            />
                          </a>

                          <a
                            href={
                              phoneAvailable
                                ? getCallUrl(
                                    enquiry.Phone
                                  )
                                : undefined
                            }
                            aria-label={`Call ${
                              enquiry.Name ??
                              "enquiry"
                            }`}
                            title="Call"
                            className={`rounded-lg p-2 transition ${
                              phoneAvailable
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                : "pointer-events-none bg-gray-100 text-gray-400"
                            }`}
                          >
                            <Phone size={18} />
                          </a>

                          {canMarkFollowedUp && (
                            <button
                              type="button"
                              onClick={() =>
                                onMarkFollowedUp(
                                  enquiry
                                )
                              }
                              disabled={
                                isMarking
                              }
                              title="Mark followed up"
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Check size={16} />

                              {isMarking
                                ? "Saving..."
                                : "Followed Up"}
                            </button>
                          )}
                          {enquiry.trial_date && enquiry.trial_status !== "Cancelled" && <button type="button" onClick={() => onCancelTrial(enquiry)} title="Cancel trial booking" className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"><Ban size={16}/>Cancel trial</button>}

                          <button
                            type="button"
                            onClick={() =>
                              onEdit(enquiry)
                            }
                            title="Edit enquiry"
                            className="rounded-lg bg-yellow-100 p-2 text-yellow-700 transition hover:bg-yellow-200"
                          >
                            <Pencil
                              size={18}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onDelete(
                                enquiry
                              )
                            }
                            title="Delete enquiry"
                            className="rounded-lg bg-red-100 p-2 text-red-700 transition hover:bg-red-200"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>

                          {!isJoined ? (
                            <button
                              type="button"
                              onClick={() =>
                                onConvert(
                                  enquiry
                                )
                              }
                              className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                              <UserPlus
                                size={17}
                              />
                              Convert
                            </button>
                          ) : (
                            <Link
                              href={
                                enquiry.converted_student_id
                                  ? `/students/${enquiry.converted_student_id}`
                                  : "/students"
                              }
                              className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                            >
                              View Student
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
