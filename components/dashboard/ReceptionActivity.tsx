"use client";

import Link from "next/link";
import {
  Clock3,
  ExternalLink,
  MessageCircle,
  Phone,
  UserCheck,
  UserRoundSearch,
} from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import WidgetCard from "./WidgetCard";

import type {
  DashboardCheckIn,
  DashboardReceptionArrival,
} from "@/services/dashboard.service";

interface ReceptionActivityProps {
  checkIns: DashboardCheckIn[];
  arrivals: DashboardReceptionArrival[];
}

function formatTime(value: string | null): string {
  if (!value) return "Time not recorded";

  if (value.includes("T")) {
    const timestamp = new Date(value);
    if (!Number.isNaN(timestamp.getTime())) {
      return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(timestamp);
    }
  }

  const parts = value.split(":");
  if (parts.length < 2) return value;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hour, minute));
}

function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function getWhatsAppUrl(arrival: DashboardReceptionArrival): string {
  const message = encodeURIComponent(
    `Hi ${arrival.name}, this is Footloose Alley Dance & Fitness Studio regarding your ${arrival.kind.toLowerCase()}.`
  );
  return `https://wa.me/${cleanPhoneNumber(arrival.phone || "")}?text=${message}`;
}

function statusClasses(status: DashboardReceptionArrival["status"]): string {
  if (status === "Overdue") return "border-red-200 bg-red-50 text-red-700";
  if (status === "Expected") return "border-violet-200 bg-violet-50 text-violet-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function ReceptionActivity({
  checkIns,
  arrivals,
}: ReceptionActivityProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <WidgetCard
        title="Live Check-ins"
        description="Students marked present today"
        action={
          <Link
            href="/attendance"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Attendance <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {checkIns.length === 0 ? (
          <EmptyState
            title="No check-ins yet"
            description="Today’s students will appear here as attendance is marked."
          />
        ) : (
          <div className="space-y-3">
            {checkIns.map((checkIn) => (
              <Link
                key={checkIn.id}
                href={checkIn.studentId ? `/students/${checkIn.studentId}` : "/attendance"}
                className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-muted/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{checkIn.studentName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {checkIn.sessionName || checkIn.program || "Studio attendance"}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatTime(checkIn.checkInTime)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </WidgetCard>

      <WidgetCard
        title="Reception Queue"
        description="Today’s trials and enquiry follow-ups"
        action={
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {arrivals.length} waiting
          </span>
        }
      >
        {arrivals.length === 0 ? (
          <EmptyState
            title="Reception queue is clear"
            description="There are no trials or follow-ups waiting today."
          />
        ) : (
          <div className="space-y-3">
            {arrivals.map((arrival) => (
              <div
                key={`${arrival.kind}-${arrival.id}-${arrival.status}`}
                className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <UserRoundSearch className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{arrival.name}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClasses(arrival.status)}`}>
                        {arrival.status}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {arrival.kind} · {arrival.program || "Program not selected"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {arrival.phone && (
                    <>
                      <a
                        href={getWhatsAppUrl(arrival)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white transition hover:bg-green-700"
                        aria-label={`WhatsApp ${arrival.name}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <a
                        href={`tel:${arrival.phone}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                        aria-label={`Call ${arrival.name}`}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </>
                  )}
                  <Link
                    href={arrival.href}
                    className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
