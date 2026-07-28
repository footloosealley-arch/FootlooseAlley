"use client";

import Link from "next/link";

import {
  AlertCircle,
  Cake,
  CalendarCheck,
  IndianRupee,
  MessageCircle,
  Phone,
  UserRoundSearch,
} from "lucide-react";

import WidgetCard from "./WidgetCard";

import type {
  DashboardPriorityAction,
  DashboardPriorityActionType,
  DashboardPriorityLevel,
} from "@/services/dashboard.service";

interface PriorityActionsProps {
  actions: DashboardPriorityAction[];
}

function getTypeIcon(
  type: DashboardPriorityActionType
) {
  if (type === "Fee Due") {
    return IndianRupee;
  }

  if (
    type === "Enquiry Follow-up"
  ) {
    return UserRoundSearch;
  }

  if (type === "Trial Class") {
    return CalendarCheck;
  }

  return Cake;
}

function getPriorityClasses(
  priority: DashboardPriorityLevel
): string {
  if (priority === "Urgent") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (priority === "Today") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function cleanPhoneNumber(
  phone: string
): string {
  const digits = phone.replace(
    /\D/g,
    ""
  );

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

function getWhatsAppUrl(
  action: DashboardPriorityAction
): string {
  const phone = cleanPhoneNumber(
    action.phone ?? ""
  );

  const message = encodeURIComponent(
    `Hi ${action.title}, this is Footloose Alley Dance & Fitness Studio. ${action.description}`
  );

  return `https://wa.me/${phone}?text=${message}`;
}

export default function PriorityActions({
  actions,
}: PriorityActionsProps) {
  return (
    <WidgetCard
      title="Today's Priority Actions"
      description="The most important tasks requiring your attention"
      action={
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {actions.length} task
          {actions.length === 1
            ? ""
            : "s"}
        </span>
      }
    >
      {actions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CalendarCheck className="h-6 w-6" />
          </div>

          <p className="mt-4 font-semibold">
            Everything is under control
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            There are no urgent actions
            requiring attention today.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = getTypeIcon(
              action.type
            );

            return (
              <div
                key={action.id}
                className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${getPriorityClasses(
                      action.priority
                    )}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">
                        {action.title}
                      </p>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                          action.priority
                        )}`}
                      >
                        {action.priority}
                      </span>

                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {action.type}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {action.phone && (
                    <>
                      <a
                        href={getWhatsAppUrl(
                          action
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>

                      <a
                        href={`tel:${action.phone}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                        title="Call"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </>
                  )}

                  <Link
                    href={action.href}
                    className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                  >
                    Open
                  </Link>
                </div>
              </div>
            );
          })}

          {actions.some(
            (action) =>
              action.priority ===
              "Urgent"
          ) && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <p>
                Complete urgent items first,
                especially overdue fees and
                enquiry follow-ups.
              </p>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
}