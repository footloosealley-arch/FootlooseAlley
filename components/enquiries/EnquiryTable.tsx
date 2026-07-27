"use client";

import {
  CalendarClock,
  CheckCircle2,
  Edit,
  Eye,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Trash2,
  UserRoundCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  enquiriesService,
  type Enquiry,
  type EnquiryStatus,
} from "@/services/enquiries.service";

interface EnquiryTableProps {
  enquiries: Enquiry[];
  loading?: boolean;
  onEdit: (enquiry: Enquiry) => void;
  onDelete: (enquiry: Enquiry) => void;
  onStatusChange: (
    enquiry: Enquiry,
    status: EnquiryStatus
  ) => Promise<void> | void;
  onView?: (enquiry: Enquiry) => void;
}

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  New: "border-blue-200 bg-blue-50 text-blue-700",
  Contacted:
    "border-violet-200 bg-violet-50 text-violet-700",
  "Follow-up":
    "border-amber-200 bg-amber-50 text-amber-700",
  "Trial Scheduled":
    "border-cyan-200 bg-cyan-50 text-cyan-700",
  "Trial Completed":
    "border-indigo-200 bg-indigo-50 text-indigo-700",
  Joined:
    "border-green-200 bg-green-50 text-green-700",
  "Not Interested":
    "border-red-200 bg-red-50 text-red-700",
};

const STATUS_OPTIONS: EnquiryStatus[] = [
  "New",
  "Contacted",
  "Follow-up",
  "Trial Scheduled",
  "Trial Completed",
  "Joined",
  "Not Interested",
];

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getFollowUpLabel(enquiry: Enquiry): {
  label: string;
  className: string;
} {
  if (!enquiry.follow_up_date) {
    return {
      label: "Not scheduled",
      className: "text-muted-foreground",
    };
  }

  if (enquiriesService.isFollowUpOverdue(enquiry)) {
    return {
      label: `Overdue · ${formatDate(
        enquiry.follow_up_date
      )}`,
      className: "font-medium text-red-600",
    };
  }

  if (enquiriesService.isFollowUpToday(enquiry)) {
    return {
      label: "Due today",
      className: "font-medium text-amber-600",
    };
  }

  return {
    label: formatDate(enquiry.follow_up_date),
    className: "text-foreground",
  };
}

function MobileEnquiryCard({
  enquiry,
  onEdit,
  onDelete,
  onStatusChange,
  onView,
}: {
  enquiry: Enquiry;
  onEdit: (enquiry: Enquiry) => void;
  onDelete: (enquiry: Enquiry) => void;
  onStatusChange: (
    enquiry: Enquiry,
    status: EnquiryStatus
  ) => Promise<void> | void;
  onView?: (enquiry: Enquiry) => void;
}) {
  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const followUp = getFollowUpLabel(enquiry);

  async function handleStatusChange(
    status: EnquiryStatus
  ) {
    setUpdatingStatus(true);

    try {
      await onStatusChange(enquiry, status);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <article className="space-y-4 rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(enquiry.name)}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold">
              {enquiry.name}
            </h3>

            <p className="truncate text-sm text-muted-foreground">
              {enquiry.phone}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[enquiry.status]
          }`}
        >
          {enquiry.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">
            Interested In
          </p>

          <p className="mt-1 font-medium">
            {enquiry.interested_in}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Source
          </p>

          <p className="mt-1 font-medium">
            {enquiry.source}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Enquiry Date
          </p>

          <p className="mt-1 font-medium">
            {formatDate(enquiry.enquiry_date)}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Follow-up
          </p>

          <p className={`mt-1 ${followUp.className}`}>
            {followUp.label}
          </p>
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-muted-foreground">
          Update Status
        </span>

        <select
          value={enquiry.status}
          disabled={updatingStatus}
          onChange={(event) => {
            void handleStatusChange(
              event.target.value as EnquiryStatus
            );
          }}
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <a
          href={enquiriesService.getCallUrl(enquiry.phone)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>

        <a
          href={enquiriesService.getWhatsAppUrl(
            enquiry.phone,
            enquiry.name
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>

        {onView && (
          <button
            type="button"
            onClick={() => onView(enquiry)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Eye className="h-4 w-4" />
            View
          </button>
        )}

        <button
          type="button"
          onClick={() => onEdit(enquiry)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(enquiry)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </article>
  );
}

export default function EnquiryTable({
  enquiries,
  loading = false,
  onEdit,
  onDelete,
  onStatusChange,
  onView,
}: EnquiryTableProps) {
  const [openMenu, setOpenMenu] = useState<{
    enquiry: Enquiry;
    top: number;
    left: number;
  } | null>(null);

  const [updatingStatusId, setUpdatingStatusId] =
    useState<number | null>(null);

  useEffect(() => {
    if (!openMenu) return;

    const closeMenu = () => setOpenMenu(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  function toggleActionsMenu(
    enquiry: Enquiry,
    button: HTMLButtonElement
  ) {
    if (openMenu?.enquiry.id === enquiry.id) {
      setOpenMenu(null);
      return;
    }

    const rect = button.getBoundingClientRect();
    const menuWidth = 192;
    const menuHeight = onView ? 190 : 146;
    const gap = 8;
    const padding = 12;

    const left = Math.min(
      Math.max(padding, rect.right - menuWidth),
      window.innerWidth - menuWidth - padding
    );

    const top =
      window.innerHeight - rect.bottom >= menuHeight + gap
        ? rect.bottom + gap
        : Math.max(padding, rect.top - menuHeight - gap);

    setOpenMenu({ enquiry, top, left });
  }

  const sortedEnquiries = useMemo(() => {
    return [...enquiries].sort((first, second) => {
      const firstOverdue =
        enquiriesService.isFollowUpOverdue(first);

      const secondOverdue =
        enquiriesService.isFollowUpOverdue(second);

      if (firstOverdue !== secondOverdue) {
        return firstOverdue ? -1 : 1;
      }

      const firstToday =
        enquiriesService.isFollowUpToday(first);

      const secondToday =
        enquiriesService.isFollowUpToday(second);

      if (firstToday !== secondToday) {
        return firstToday ? -1 : 1;
      }

      return (
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
      );
    });
  }, [enquiries]);

  async function handleStatusChange(
    enquiry: Enquiry,
    status: EnquiryStatus
  ) {
    setUpdatingStatusId(enquiry.id);

    try {
      await onStatusChange(enquiry, status);
    } finally {
      setUpdatingStatusId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

        <p className="mt-4 text-sm text-muted-foreground">
          Loading enquiries...
        </p>
      </div>
    );
  }

  if (sortedEnquiries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-background px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <UserRoundCheck className="h-7 w-7 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          No enquiries found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Add your first enquiry or change the current search and
          filter options.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 lg:hidden">
        {sortedEnquiries.map((enquiry) => (
          <MobileEnquiryCard
            key={enquiry.id}
            enquiry={enquiry}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onView={onView}
          />
        ))}
      </div>

      <div className="hidden overflow-visible rounded-xl border bg-background shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Enquiry
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Interest
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Source
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Enquiry Date
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Follow-up
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Trial
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedEnquiries.map((enquiry) => {
                const followUp =
                  getFollowUpLabel(enquiry);

                const isOverdue =
                  enquiriesService.isFollowUpOverdue(
                    enquiry
                  );

                const isToday =
                  enquiriesService.isFollowUpToday(
                    enquiry
                  );

                return (
                  <tr
                    key={enquiry.id}
                    className={`border-b last:border-b-0 ${
                      isOverdue
                        ? "bg-red-50/40"
                        : isToday
                          ? "bg-amber-50/40"
                          : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {getInitials(enquiry.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[190px] truncate font-medium">
                            {enquiry.name}
                          </p>

                          <p className="mt-0.5 max-w-[190px] truncate text-xs text-muted-foreground">
                            {enquiry.phone}
                          </p>

                          {enquiry.email && (
                            <p className="mt-0.5 max-w-[190px] truncate text-xs text-muted-foreground">
                              {enquiry.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="max-w-[150px] truncate text-sm font-medium">
                        {enquiry.interested_in}
                      </p>

                      {enquiry.assigned_to && (
                        <p className="mt-1 max-w-[150px] truncate text-xs text-muted-foreground">
                          Assigned: {enquiry.assigned_to}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {enquiry.source}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {formatDate(enquiry.enquiry_date)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarClock
                          className={`h-4 w-4 shrink-0 ${
                            isOverdue
                              ? "text-red-500"
                              : isToday
                                ? "text-amber-500"
                                : "text-muted-foreground"
                          }`}
                        />

                        <span
                          className={`text-sm ${followUp.className}`}
                        >
                          {followUp.label}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {enquiry.trial_date ? (
                        <div>
                          <p>
                            {formatDate(enquiry.trial_date)}
                          </p>

                          {enquiry.status ===
                            "Trial Completed" && (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Not scheduled
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={enquiry.status}
                        disabled={
                          updatingStatusId === enquiry.id
                        }
                        onChange={(event) => {
                          void handleStatusChange(
                            enquiry,
                            event.target
                              .value as EnquiryStatus
                          );
                        }}
                        className={`h-9 min-w-[150px] rounded-lg border px-2.5 text-xs font-medium outline-none transition focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${
                          STATUS_STYLES[enquiry.status]
                        }`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option
                            key={status}
                            value={status}
                            className="bg-background text-foreground"
                          >
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="relative px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={enquiriesService.getCallUrl(
                            enquiry.phone
                          )}
                          title="Call"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
                        >
                          <Phone className="h-4 w-4" />
                        </a>

                        <a
                          href={enquiriesService.getWhatsAppUrl(
                            enquiry.phone,
                            enquiry.name
                          )}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700 transition-colors hover:bg-green-100"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>

                        <button
                          type="button"
                          onClick={(event) =>
                            toggleActionsMenu(
                              enquiry,
                              event.currentTarget
                            )
                          }
                          title="More actions"
                          aria-haspopup="menu"
                          aria-expanded={
                            openMenu?.enquiry.id === enquiry.id
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {openMenu &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close actions menu"
              onClick={() => setOpenMenu(null)}
              className="fixed inset-0 z-[90] cursor-default"
            />

            <div
              role="menu"
              className="fixed z-[100] w-48 overflow-hidden rounded-xl border bg-background p-1.5 shadow-2xl"
              style={{ top: openMenu.top, left: openMenu.left }}
            >
              {onView && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    const enquiry = openMenu.enquiry;
                    setOpenMenu(null);
                    onView(enquiry);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  const enquiry = openMenu.enquiry;
                  setOpenMenu(null);
                  onEdit(enquiry);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <Edit className="h-4 w-4" />
                Edit Enquiry
              </button>

              {openMenu.enquiry.status !== "Joined" && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    const enquiry = openMenu.enquiry;
                    setOpenMenu(null);
                    void handleStatusChange(enquiry, "Joined");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-green-700 transition-colors hover:bg-green-50"
                >
                  <UserRoundCheck className="h-4 w-4" />
                  Mark as Joined
                </button>
              )}

              <div className="my-1 border-t" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  const enquiry = openMenu.enquiry;
                  setOpenMenu(null);
                  onDelete(enquiry);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Enquiry
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  );
}