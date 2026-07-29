import { supabase } from "@/lib/supabase";

import type { MembershipStatus } from "@/types/database";

export interface MembershipDashboardStudent {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
  student_code: string | null;
  membership_plan: string | null;
  membership_start_date: string | null;
  membership_end_date: string | null;
  membership_status: MembershipStatus | null;
  membership_frozen: boolean | null;
  membership_freeze_started_at: string | null;
  membership_freeze_reason: string | null;
  Fees: number | null;
  Fees_due: number | null;
  fee_status: string | null;
}

export type MembershipDashboardStatus =
  | MembershipStatus
  | "Not Started";

function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function daysUntil(dateValue: string | null): number | null {
  if (!dateValue) {
    return null;
  }

  const date = new Date(`${dateValue.slice(0, 10)}T00:00:00`);
  const today = new Date(`${localDateString()}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
}

export function deriveMembershipStatus(
  student: MembershipDashboardStudent
): MembershipDashboardStatus {
  if (student.membership_frozen || student.membership_status === "Frozen") {
    return "Frozen";
  }

  if (student.membership_status === "Cancelled") {
    return "Cancelled";
  }

  const remaining = daysUntil(student.membership_end_date);

  if (remaining === null) {
    return student.membership_plan ? "Active" : "Not Started";
  }

  if (remaining < 0) {
    return "Expired";
  }

  if (remaining <= 7) {
    return "Expiring Soon";
  }

  return "Active";
}

export function normalizeWhatsAppNumber(phone: string | null): string {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  return "";
}

export function getRenewalWhatsAppUrl(
  student: MembershipDashboardStudent
): string | null {
  const phone = normalizeWhatsAppNumber(student.Phone);

  if (!phone) {
    return null;
  }

  const name = student.Name?.trim() || "there";
  const endDate = student.membership_end_date
    ? new Date(`${student.membership_end_date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : null;

  const message = endDate
    ? `Hello ${name}, this is a friendly reminder from Footloose Alley Dance and Fitness Studio. Your membership ${deriveMembershipStatus(student) === "Expired" ? "expired" : "will expire"} on ${endDate}. Please contact us to renew your membership. Thank you!`
    : `Hello ${name}, this is Footloose Alley Dance and Fitness Studio. Please contact us to activate your membership. Thank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

class MembershipDashboardService {
  async getStudents(): Promise<MembershipDashboardStudent[]> {
    const { data, error } = await supabase
      .from("Students")
      .select(`
        id,
        Name,
        Phone,
        Program,
        Status,
        student_code,
        membership_plan,
        membership_start_date,
        membership_end_date,
        membership_status,
        membership_frozen,
        membership_freeze_started_at,
        membership_freeze_reason,
        Fees,
        Fees_due,
        fee_status
      `)
      .order("Name", { ascending: true });

    if (error) {
      throw new Error(error.message || "Unable to load memberships.");
    }

    return (data ?? []) as MembershipDashboardStudent[];
  }

}

export const membershipDashboardService =
  new MembershipDashboardService();
