import { supabase } from "@/lib/supabase";
import type { Student } from "@/types/database";

export interface BirthdayStudent extends Student {
  nextBirthday: string;
  daysUntilBirthday: number;
}

function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextBirthdayFor(dateOfBirth: string, today: string): string {
  const [, month, day] = dateOfBirth.slice(0, 10).split("-");
  const thisYear = `${today.slice(0, 4)}-${month}-${day}`;

  if (thisYear >= today) {
    return thisYear;
  }

  return `${Number(today.slice(0, 4)) + 1}-${month}-${day}`;
}

function daysBetween(from: string, to: string): number {
  const fromDate = new Date(`${from}T12:00:00`);
  const toDate = new Date(`${to}T12:00:00`);
  return Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000);
}

class BirthdayService {
  async getUpcomingBirthdays(): Promise<BirthdayStudent[]> {
    const { data, error } = await supabase
      .from("Students")
      .select("*")
      .not("date_of_birth", "is", null)
      .neq("Status", "Inactive");

    if (error) {
      throw new Error(error.message || "Unable to load birthdays.");
    }

    const today = localDateString();

    return ((data ?? []) as Student[])
      .map((student) => {
        const nextBirthday = nextBirthdayFor(student.date_of_birth!, today);

        return {
          ...student,
          nextBirthday,
          daysUntilBirthday: daysBetween(today, nextBirthday),
        };
      })
      .sort(
        (left, right) =>
          left.daysUntilBirthday - right.daysUntilBirthday ||
          (left.Name ?? "").localeCompare(right.Name ?? "")
      );
  }
}

export const birthdayService = new BirthdayService();
