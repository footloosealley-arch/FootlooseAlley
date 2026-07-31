import Link from "next/link";
import { MessageCircle } from "lucide-react";

import WidgetCard from "./WidgetCard";
import EmptyState from "@/components/common/EmptyState";

import type { Student } from "@/types/database";

interface BirthdayCardProps {
  birthdays: Student[];
}

function normalizeWhatsAppNumber(phone: string | null): string {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  return "";
}

function birthdayWhatsAppUrl(student: Student): string | null {
  const number = normalizeWhatsAppNumber(student.Phone);

  if (!number || student.whatsapp_enabled === false) {
    return null;
  }

  const name = student.Name?.trim() || "there";
  const message = `Happy Birthday ${name}! 🎉 Wishing you a wonderful year ahead from everyone at Footloose Alley Dance and Fitness Studio.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function BirthdayCard({ birthdays }: BirthdayCardProps) {
  return (
    <WidgetCard
      title="Today's Birthdays"
      description="Celebrate your students"
    >
      {birthdays.length === 0 ? (
        <EmptyState
          title="No Birthdays Today"
          description="There are no student birthdays today."
        />
      ) : (
        <div className="space-y-3">
          {birthdays.map((student) => {
            const whatsappUrl = birthdayWhatsAppUrl(student);

            return (
              <div
                key={student.id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{student.Name}</p>

                  <p className="text-sm text-muted-foreground">
                    {student.Phone || "No phone number"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
                    🎂 Birthday
                  </div>

                  {whatsappUrl ? (
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      WhatsApp unavailable
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
