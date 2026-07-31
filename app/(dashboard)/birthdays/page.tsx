"use client";

import Link from "next/link";
import { Cake, MessageCircle, RefreshCw } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import { useAsync } from "@/hooks/useAsync";
import { birthdayService } from "@/services/birthday.service";
import type { BirthdayStudent } from "@/services/birthday.service";

function formatBirthday(dateValue: string): string {
  const [year, month, day] = dateValue.split("-").map(Number);

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function normalizeWhatsAppNumber(phone: string | null): string {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return "";
}

function whatsappUrl(student: BirthdayStudent): string | null {
  const number = normalizeWhatsAppNumber(student.Phone);

  if (!number || student.whatsapp_enabled === false) {
    return null;
  }

  const name = student.Name?.trim() || "there";
  const message = student.daysUntilBirthday === 0
    ? `Happy Birthday ${name}! 🎉 Wishing you a wonderful year ahead from everyone at Footloose Alley Dance and Fitness Studio.`
    : `Hi ${name}, Footloose Alley Dance and Fitness Studio is looking forward to celebrating your birthday with you! 🎂`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function timingLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default function BirthdaysPage() {
  const { data, loading, error, refresh } = useAsync(() =>
    birthdayService.getUpcomingBirthdays()
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-200 bg-gradient-to-br from-pink-600 via-rose-600 to-amber-500 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-pink-100">
              <Cake className="h-5 w-5" />
              <span className="text-sm font-semibold">Student celebrations</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Birthdays
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-pink-50 sm:text-base">
              View upcoming student birthdays, plan celebrations, and send greetings from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/25 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      {loading && <LoadingCard title="Loading Birthdays..." />}

      {!loading && error && (
        <ErrorCard
          title="Unable to load birthdays"
          message={error.message}
          onRetry={refresh}
        />
      )}

      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          title="No birthdays available"
          description="Add dates of birth to student profiles to see them here."
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.map((student) => {
            const messageUrl = whatsappUrl(student);

            return (
              <article
                key={student.id}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">
                      {student.Name || "Student"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {student.Program || student.batch || "Student"}
                    </p>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    student.daysUntilBirthday <= 1
                      ? "bg-pink-100 text-pink-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {timingLabel(student.daysUntilBirthday)}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-muted/60 p-3">
                  <p className="text-sm font-medium">
                    {formatBirthday(student.nextBirthday)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {student.Phone || "No phone number available"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/students/${student.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition hover:bg-muted"
                  >
                    View Student
                  </Link>

                  {messageUrl ? (
                    <Link
                      href={messageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Link>
                  ) : (
                    <span className="inline-flex h-9 items-center text-xs text-muted-foreground">
                      WhatsApp unavailable
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
