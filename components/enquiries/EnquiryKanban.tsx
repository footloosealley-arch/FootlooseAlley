"use client";

import Link from "next/link";
import {
  CalendarClock,
  Check,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
  UserPlus,
} from "lucide-react";

import StatusBadge from "@/components/enquiries/StatusBadge";
import type { Enquiry } from "@/components/enquiries/EnquiryTable";

interface EnquiryKanbanProps {
  loading: boolean;
  enquiries: Enquiry[];
  markingFollowUpId?: number | null;
  onEdit: (enquiry: Enquiry) => void;
  onDelete: (enquiry: Enquiry) => void;
  onConvert: (enquiry: Enquiry) => void;
  onMarkFollowedUp: (enquiry: Enquiry) => void;
}

type PipelineKey =
  | "New"
  | "Contacted"
  | "Trial"
  | "Joined"
  | "Closed";

const PIPELINE: Array<{
  key: PipelineKey;
  title: string;
  subtitle: string;
  accent: string;
  countClassName: string;
}> = [
  {
    key: "New",
    title: "New",
    subtitle: "Waiting for first contact",
    accent: "border-t-blue-500",
    countClassName: "bg-blue-100 text-blue-700",
  },
  {
    key: "Contacted",
    title: "Contacted",
    subtitle: "Follow-up in progress",
    accent: "border-t-amber-500",
    countClassName: "bg-amber-100 text-amber-700",
  },
  {
    key: "Trial",
    title: "Trial",
    subtitle: "Trial booked or completed",
    accent: "border-t-purple-500",
    countClassName: "bg-purple-100 text-purple-700",
  },
  {
    key: "Joined",
    title: "Joined",
    subtitle: "Converted to student",
    accent: "border-t-green-500",
    countClassName: "bg-green-100 text-green-700",
  },
  {
    key: "Closed",
    title: "Closed",
    subtitle: "Closed or not interested",
    accent: "border-t-gray-400",
    countClassName: "bg-gray-200 text-gray-700",
  },
];

function getPipelineKey(status: string | null): PipelineKey {
  const value = status?.trim().toLowerCase() ?? "new";

  if (value === "joined" || value === "converted") {
    return "Joined";
  }

  if (value === "closed" || value === "not interested") {
    return "Closed";
  }

  if (value.includes("trial")) {
    return "Trial";
  }

  if (
    value === "contacted" ||
    value === "follow up" ||
    value === "follow-up"
  ) {
    return "Contacted";
  }

  return "New";
}

function getTodayString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFollowUpState(
  enquiry: Enquiry
): "overdue" | "today" | "upcoming" | "none" {
  const pipelineKey = getPipelineKey(enquiry.Status);

  if (
    !enquiry.Follow_up_date ||
    pipelineKey === "Joined" ||
    pipelineKey === "Closed"
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

function formatDate(value: string | null): string {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

function getWhatsAppUrl(phone: string | null, name: string | null): string {
  let cleanNumber = (phone ?? "").replace(/\D/g, "");

  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }

  const customerName = name?.trim() || "there";
  const message = encodeURIComponent(
    `Hi ${customerName}, this is Footloose Alley Dance & Fitness Studio. We are following up regarding your enquiry. Please let us know how we can assist you.`
  );

  return `https://wa.me/${cleanNumber}?text=${message}`;
}

function getCallUrl(phone: string | null): string {
  return `tel:${(phone ?? "").replace(/[^\d+]/g, "")}`;
}

function FollowUpPill({ enquiry }: { enquiry: Enquiry }) {
  const state = getFollowUpState(enquiry);

  if (state === "none") {
    return null;
  }

  const styles = {
    overdue: "bg-red-50 text-red-700 ring-red-200",
    today: "bg-amber-50 text-amber-700 ring-amber-200",
    upcoming: "bg-green-50 text-green-700 ring-green-200",
  };

  const labels = {
    overdue: "Overdue",
    today: "Today",
    upcoming: formatDate(enquiry.Follow_up_date),
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${styles[state]}`}
    >
      <CalendarClock size={12} />
      {labels[state]}
    </span>
  );
}

function EnquiryCard({
  enquiry,
  markingFollowUpId,
  onEdit,
  onDelete,
  onConvert,
  onMarkFollowedUp,
}: Omit<EnquiryKanbanProps, "loading" | "enquiries"> & {
  enquiry: Enquiry;
}) {
  const phoneAvailable = Boolean(enquiry.Phone?.trim());
  const pipelineKey = getPipelineKey(enquiry.Status);
  const followUpState = getFollowUpState(enquiry);
  const isMarking = markingFollowUpId === enquiry.id;
  const canMarkFollowedUp =
    followUpState !== "none" &&
    pipelineKey !== "Joined" &&
    pipelineKey !== "Closed";

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">
            {enquiry.Name || "Unnamed enquiry"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {enquiry.Phone || "No phone number"}
          </p>
        </div>

        <StatusBadge status={enquiry.Status} />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">Program</span>
          <span className="max-w-[150px] truncate font-medium text-gray-800">
            {enquiry.Program || "Not selected"}
          </span>
        </div>

        {enquiry.source && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Source</span>
            <span className="font-medium text-gray-800">{enquiry.source}</span>
          </div>
        )}

        {enquiry.assigned_to && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Assigned</span>
            <span className="max-w-[150px] truncate font-medium text-gray-800">
              {enquiry.assigned_to}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex min-h-7 flex-wrap items-center gap-2">
        <FollowUpPill enquiry={enquiry} />

        {enquiry.trial_date && (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700 ring-1 ring-purple-200">
            Trial {formatDate(enquiry.trial_date)}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
        {phoneAvailable && (
          <>
            <a
              href={getCallUrl(enquiry.Phone)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              title="Call"
            >
              <Phone size={15} />
            </a>

            <a
              href={getWhatsAppUrl(enquiry.Phone, enquiry.Name)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700 transition hover:bg-green-100"
              title="WhatsApp"
            >
              <MessageCircle size={15} />
            </a>
          </>
        )}

        {canMarkFollowedUp && (
          <button
            type="button"
            onClick={() => onMarkFollowedUp(enquiry)}
            disabled={isMarking}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={14} />
            {isMarking ? "Saving" : "Done"}
          </button>
        )}

        <button
          type="button"
          onClick={() => onEdit(enquiry)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          title="Edit enquiry"
        >
          <Pencil size={15} />
        </button>

        {pipelineKey !== "Joined" && (
          <button
            type="button"
            onClick={() => onConvert(enquiry)}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white transition hover:bg-gray-800"
          >
            <UserPlus size={14} />
            Convert
          </button>
        )}

        {pipelineKey === "Joined" && enquiry.converted_student_id && (
          <Link
            href={`/students/${enquiry.converted_student_id}`}
            className="ml-auto inline-flex h-9 items-center rounded-lg bg-green-50 px-3 text-xs font-semibold text-green-700 transition hover:bg-green-100"
          >
            View Student
          </Link>
        )}

        <button
          type="button"
          onClick={() => onDelete(enquiry)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
          title="Delete enquiry"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}

export default function EnquiryKanban({
  loading,
  enquiries,
  markingFollowUpId,
  onEdit,
  onDelete,
  onConvert,
  onMarkFollowedUp,
}: EnquiryKanbanProps) {
  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-5">
        {PIPELINE.map((column) => (
          <div
            key={column.key}
            className={`min-h-56 rounded-2xl border border-t-4 border-gray-200 bg-gray-50/70 p-3 ${column.accent}`}
          >
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-36 animate-pulse rounded-2xl bg-gray-200/80" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pb-2 md:overflow-x-auto">
      <div className="grid w-full grid-cols-1 gap-4 md:min-w-[1320px] md:grid-cols-5">
        {PIPELINE.map((column) => {
          const columnEnquiries = enquiries.filter(
            (enquiry) => getPipelineKey(enquiry.Status) === column.key
          );

          return (
            <section
              key={column.key}
              className={`min-h-[420px] rounded-2xl border border-t-4 border-gray-200 bg-gray-50/70 p-3 ${column.accent}`}
            >
              <div className="flex items-start justify-between gap-3 px-1 pb-3">
                <div>
                  <h2 className="font-semibold text-gray-900">{column.title}</h2>
                  <p className="mt-0.5 text-xs text-gray-500">{column.subtitle}</p>
                </div>

                <span
                  className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${column.countClassName}`}
                >
                  {columnEnquiries.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnEnquiries.map((enquiry) => (
                  <EnquiryCard
                    key={enquiry.id}
                    enquiry={enquiry}
                    markingFollowUpId={markingFollowUpId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onConvert={onConvert}
                    onMarkFollowedUp={onMarkFollowedUp}
                  />
                ))}

                {columnEnquiries.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-gray-500">No enquiries</p>
                    <p className="mt-1 text-xs text-gray-400">Nothing in this stage</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
