"use client";

import Link from "next/link";

import {
  AlertCircle,
  CalendarDays,
  IndianRupee,
  MessageCircle,
} from "lucide-react";

import WidgetCard from "./WidgetCard";

import type {
  DashboardFeeDue,
} from "@/services/dashboard.service";

interface FeeDueActionCardProps {
  feeDues: DashboardFeeDue[];
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

function createWhatsAppMessage(
  feeDue: DashboardFeeDue
): string {
  const planText = feeDue.membership_plan
    ? ` for your ${feeDue.membership_plan} membership`
    : "";

  const dueText =
    feeDue.status === "Overdue"
      ? `was due on ${formatDate(feeDue.due_date)}`
      : `is due today`;

  return [
    `Hi ${feeDue.student_name},`,
    "",
    `This is a friendly reminder from Footloose Alley Dance & Fitness Studio.`,
    "",
    `Your fee payment of ${formatCurrency(
      feeDue.amount_due
    )}${planText} ${dueText}.`,
    "",
    "Please complete the payment at your earliest convenience.",
    "",
    "Thank you,",
    "Footloose Alley",
  ].join("\n");
}

function openWhatsApp(feeDue: DashboardFeeDue): void {
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

  const message = createWhatsAppMessage(feeDue);

  const whatsappUrl =
    `https://wa.me/${phone}` +
    `?text=${encodeURIComponent(message)}`;

  window.open(
    whatsappUrl,
    "_blank",
    "noopener,noreferrer"
  );
}

export default function FeeDueActionCard({
  feeDues,
}: FeeDueActionCardProps) {
  const overdueCount = feeDues.filter(
    (feeDue) => feeDue.status === "Overdue"
  ).length;

  const dueTodayCount = feeDues.filter(
    (feeDue) => feeDue.status === "Due Today"
  ).length;

  return (
    <WidgetCard
      title="Fee Due Action Centre"
      description="Payments that need your attention today"
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
      <div className="mb-5 flex flex-wrap gap-3">
        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            bg-red-50
            px-3
            py-1.5
            text-sm
            font-medium
            text-red-700
          "
        >
          <AlertCircle className="h-4 w-4" />

          {overdueCount} overdue
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            bg-amber-50
            px-3
            py-1.5
            text-sm
            font-medium
            text-amber-700
          "
        >
          <CalendarDays className="h-4 w-4" />

          {dueTodayCount} due today
        </div>
      </div>

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
            No urgent fee dues
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            There are no overdue payments or payments
            due today.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feeDues.map((feeDue) => (
            <div
              key={feeDue.id}
              className="
                flex
                flex-col
                gap-4
                rounded-xl
                border
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {feeDue.student_name}
                  </p>

                  <span
                    className={
                      feeDue.status === "Overdue"
                        ? `
                          rounded-full
                          bg-red-100
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-red-700
                        `
                        : `
                          rounded-full
                          bg-amber-100
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-amber-700
                        `
                    }
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

                    {formatDate(feeDue.due_date)}
                  </span>

                  {feeDue.membership_plan && (
                    <span>
                      {feeDue.membership_plan}
                    </span>
                  )}
                </div>

                {!feeDue.student_phone && (
                  <p className="mt-2 text-xs text-red-600">
                    Phone number is missing
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  openWhatsApp(feeDue)
                }
                disabled={!feeDue.student_phone}
                className="
                  inline-flex
                  shrink-0
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
                <MessageCircle className="h-4 w-4" />

                WhatsApp
              </button>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}