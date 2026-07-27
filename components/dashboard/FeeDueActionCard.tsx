"use client";

import Link from "next/link";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  LoaderCircle,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

import WidgetCard from "./WidgetCard";

import {
  feeDuesService,
} from "@/services/fee-dues.service";

import type {
  DashboardFeeDue,
  DashboardFeeDueStatus,
  DashboardFeeDueSummary,
} from "@/services/dashboard.service";

interface FeeDueActionCardProps {
  feeDues: DashboardFeeDue[];
  summary: DashboardFeeDueSummary;
  onDataChanged?: () => unknown | Promise<unknown>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return digits;
  }

  return digits;
}

function getDueDescription(
  feeDue: DashboardFeeDue
): string {
  if (feeDue.status === "Overdue") {
    return `was due on ${formatDate(
      feeDue.due_date
    )}`;
  }

  if (feeDue.status === "Due Today") {
    return "is due today";
  }

  return `is due on ${formatDate(
    feeDue.due_date
  )}`;
}

function createWhatsAppMessage(
  feeDue: DashboardFeeDue
): string {
  const planText = feeDue.membership_plan
    ? ` for your ${feeDue.membership_plan} membership`
    : "";

  const closingText =
    feeDue.status === "Due Soon"
      ? "Please plan your renewal before the due date."
      : "Please complete the payment at your earliest convenience.";

  return [
    `Hi ${feeDue.student_name},`,
    "",
    "This is a friendly reminder from Footloose Alley Dance & Fitness Studio.",
    "",
    `Your fee payment of ${formatCurrency(
      feeDue.amount_due
    )}${planText} ${getDueDescription(
      feeDue
    )}.`,
    "",
    closingText,
    "",
    "Thank you,",
    "Footloose Alley",
  ].join("\n");
}

function getStatusClasses(
  status: DashboardFeeDueStatus
): string {
  if (status === "Overdue") {
    return `
      rounded-full
      bg-red-100
      px-2.5
      py-1
      text-xs
      font-semibold
      text-red-700
    `;
  }

  if (status === "Due Today") {
    return `
      rounded-full
      bg-amber-100
      px-2.5
      py-1
      text-xs
      font-semibold
      text-amber-700
    `;
  }

  return `
    rounded-full
    bg-yellow-100
    px-2.5
    py-1
    text-xs
    font-semibold
    text-yellow-700
  `;
}

export default function FeeDueActionCard({
  feeDues,
  summary,
  onDataChanged,
}: FeeDueActionCardProps) {
  const [
    processingFeeDueId,
    setProcessingFeeDueId,
  ] = useState<number | null>(null);

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(null);

  async function refreshDashboard(): Promise<void> {
    if (onDataChanged) {
      await onDataChanged();
    }
  }

  async function handleWhatsApp(
    feeDue: DashboardFeeDue
  ): Promise<void> {
    setActionError(null);

    if (!feeDue.student_phone) {
      window.alert(
        "This student does not have a phone number."
      );

      return;
    }

    const phone = cleanPhoneNumber(
      feeDue.student_phone
    );

    if (!phone) {
      window.alert(
        "This student does not have a valid phone number."
      );

      return;
    }

    const message =
      createWhatsAppMessage(feeDue);

    const whatsappUrl =
      `https://wa.me/${phone}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    try {
      setProcessingFeeDueId(feeDue.id);

      await feeDuesService.recordReminder(
        feeDue.id
      );

      await refreshDashboard();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "WhatsApp opened, but the reminder count could not be updated."
      );
    } finally {
      setProcessingFeeDueId(null);
    }
  }

  async function handleMarkPaid(
    feeDue: DashboardFeeDue
  ): Promise<void> {
    setActionError(null);

    const confirmed = window.confirm(
      `Mark ${feeDue.student_name}'s fee of ${formatCurrency(
        feeDue.amount_due
      )} as paid?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingFeeDueId(feeDue.id);

      await feeDuesService.markAsPaid(
        feeDue.id,
        {
          paid_amount:
            feeDue.amount_due,
        }
      );

      await refreshDashboard();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to mark this fee as paid."
      );
    } finally {
      setProcessingFeeDueId(null);
    }
  }

  return (
    <WidgetCard
      title="Fee Due Action Centre"
      description="Overdue, due today and upcoming within 7 days"
      className="lg:col-span-2"
      action={
        <Link
          href="/fee-dues"
          className="
            rounded-lg
            border
            px-3
            py-2
            text-sm
            font-medium
            transition-colors
            hover:bg-muted
          "
        >
          View all
        </Link>
      }
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div
          className="
            rounded-xl
            border
            border-red-100
            bg-red-50
            p-3
          "
        >
          <div className="flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4" />
            Overdue
          </div>

          <p className="mt-2 text-xl font-bold text-red-800">
            {summary.overdueCount}
          </p>

          <p className="text-sm text-red-700">
            {formatCurrency(
              summary.overdueAmount
            )}
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-amber-100
            bg-amber-50
            p-3
          "
        >
          <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
            <CalendarDays className="h-4 w-4" />
            Due Today
          </div>

          <p className="mt-2 text-xl font-bold text-amber-800">
            {summary.dueTodayCount}
          </p>

          <p className="text-sm text-amber-700">
            {formatCurrency(
              summary.dueTodayAmount
            )}
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-yellow-100
            bg-yellow-50
            p-3
          "
        >
          <div className="flex items-center gap-2 text-sm font-medium text-yellow-700">
            <Clock3 className="h-4 w-4" />
            Due Within 7 Days
          </div>

          <p className="mt-2 text-xl font-bold text-yellow-800">
            {summary.dueSoonCount}
          </p>

          <p className="text-sm text-yellow-700">
            {formatCurrency(
              summary.dueSoonAmount
            )}
          </p>
        </div>
      </div>

      {actionError && (
        <div
          className="
            mb-4
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          {actionError}
        </div>
      )}

      {feeDues.length === 0 ? (
        <div
          className="
            rounded-xl
            border
            border-dashed
            p-8
            text-center
          "
        >
          <p className="font-medium">
            No fee actions required
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            There are no overdue payments, payments due
            today or payments due within the next 7 days.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feeDues.map((feeDue) => {
            const isProcessing =
              processingFeeDueId ===
              feeDue.id;

            return (
              <div
                key={feeDue.id}
                className="
                  flex
                  flex-col
                  gap-4
                  rounded-xl
                  border
                  p-4
                  xl:flex-row
                  xl:items-center
                  xl:justify-between
                "
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {feeDue.student_name}
                    </p>

                    <span
                      className={getStatusClasses(
                        feeDue.status
                      )}
                    >
                      {feeDue.status}
                    </span>
                  </div>

                  <div
                    className="
                      mt-2
                      flex
                      flex-wrap
                      gap-x-4
                      gap-y-1
                      text-sm
                      text-muted-foreground
                    "
                  >
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5" />

                      {formatCurrency(
                        feeDue.amount_due
                      )}
                    </span>

                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />

                      {formatDate(
                        feeDue.due_date
                      )}
                    </span>

                    {feeDue.membership_plan && (
                      <span>
                        {feeDue.membership_plan}
                      </span>
                    )}

                    {feeDue.reminder_count > 0 && (
                      <span>
                        {feeDue.reminder_count} reminder
                        {feeDue.reminder_count === 1
                          ? ""
                          : "s"}{" "}
                        sent
                      </span>
                    )}
                  </div>

                  {!feeDue.student_phone && (
                    <p className="mt-2 text-xs text-red-600">
                      Phone number is missing
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      handleWhatsApp(
                        feeDue
                      )
                    }
                    disabled={
                      !feeDue.student_phone ||
                      isProcessing
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-green-600
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition-colors
                      hover:bg-green-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isProcessing ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}

                    WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleMarkPaid(
                        feeDue
                      )
                    }
                    disabled={isProcessing}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-emerald-700
                      transition-colors
                      hover:bg-emerald-100
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isProcessing ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                    Mark Paid
                  </button>
                </div>
              </div>
            );
          })}

          {summary.totalActionCount >
            feeDues.length && (
            <p className="pt-2 text-center text-sm text-muted-foreground">
              Showing {feeDues.length} of{" "}
              {summary.totalActionCount} fee actions.{" "}
              <Link
                href="/fee-dues"
                className="font-medium text-foreground underline underline-offset-4"
              >
                View all fee dues
              </Link>
            </p>
          )}
        </div>
      )}
    </WidgetCard>
  );
}