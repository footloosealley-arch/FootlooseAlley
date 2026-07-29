import { supabase } from "@/lib/supabase";
import type { Membership, MembershipPlan, MembershipStatus, Student } from "@/types/database";

export const MEMBERSHIP_PLANS: Record<MembershipPlan, { label: string; months: number; amount: number }> = {
  Monthly: { label: "Monthly", months: 1, amount: 2500 },
  "3 Months": { label: "3 Months", months: 3, amount: 6000 },
  "6 Months": { label: "6 Months", months: 6, amount: 10000 },
  Yearly: { label: "Yearly", months: 12, amount: 18000 },
};

export interface RenewMembershipInput {
  studentId: number;
  plan: MembershipPlan;
  startDate: string;
  discount?: number;
  paidAmount?: number;
  notes?: string;
}

export interface FreezeMembershipInput {
  studentId: number;
  reason?: string;
}

function assertStudentId(studentId: number) {
  if (!Number.isInteger(studentId) || studentId <= 0) throw new Error("Invalid student ID.");
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addPlanDuration(startDate: string, plan: MembershipPlan): string {
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) throw new Error("Invalid membership start date.");
  const expiry = new Date(start);
  expiry.setMonth(expiry.getMonth() + MEMBERSHIP_PLANS[plan].months);
  expiry.setDate(expiry.getDate() - 1);
  return isoDate(expiry);
}

export function getMembershipStatus(expiryDate: string | null, frozen = false): MembershipStatus {
  if (frozen) return "Frozen";
  if (!expiryDate) return "Active";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${expiryDate}T00:00:00`);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  if (days < 0) return "Expired";
  if (days <= 7) return "Expiring Soon";
  return "Active";
}

class MembershipService {
  async renewMembership(input: RenewMembershipInput): Promise<Membership> {
    assertStudentId(input.studentId);
    const plan = MEMBERSHIP_PLANS[input.plan];
    const discount = Math.max(0, Number(input.discount ?? 0));
    const paidAmount = Math.max(0, Number(input.paidAmount ?? 0));
    const netAmount = Math.max(0, plan.amount - discount);
    const amountDue = Math.max(0, netAmount - paidAmount);
    const expiryDate = addPlanDuration(input.startDate, input.plan);
    const paymentStatus = amountDue <= 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";

    const { data: currentMembership } = await supabase
      .from("Memberships")
      .select("id")
      .eq("student_id", input.studentId)
      .in("status", ["Active", "Expiring Soon", "Frozen"])
      .order("expiry_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("Memberships")
      .insert({
        student_id: input.studentId,
        plan: input.plan,
        amount: plan.amount,
        discount,
        paid_amount: paidAmount,
        amount_due: amountDue,
        start_date: input.startDate,
        expiry_date: expiryDate,
        status: "Active",
        payment_status: paymentStatus,
        renewal_date: isoDate(new Date()),
        renewed_from: currentMembership?.id ?? null,
        notes: input.notes?.trim() || null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message || "Unable to renew membership.");

    const { error: studentError } = await supabase
      .from("Students")
      .update({
        membership_plan: input.plan,
        membership_start_date: input.startDate,
        membership_end_date: expiryDate,
        next_due_date: expiryDate,
        membership_status: "Active",
        membership_frozen: false,
        membership_freeze_started_at: null,
        membership_freeze_reason: null,
        membership_discount: discount,
        membership_paid_amount: paidAmount,
        Fees: plan.amount,
        Fees_due: amountDue,
        fee_status: paymentStatus,
        Status: "Active",
      })
      .eq("id", input.studentId);

    if (studentError) {
      await supabase.from("Memberships").delete().eq("id", data.id);
      throw new Error(studentError.message || "Membership was created, but the student record could not be updated.");
    }

    if (currentMembership?.id) {
      await supabase
        .from("Memberships")
        .update({ status: "Expired" })
        .eq("id", currentMembership.id)
        .neq("id", data.id);
    }

    await supabase.from("Membership_Events").insert({
      student_id: input.studentId,
      membership_id: data.id,
      event_type: currentMembership?.id ? "Renewed" : "Created",
      event_date: isoDate(new Date()),
      previous_status: currentMembership?.id ? "Active" : null,
      new_status: "Active",
      notes: input.notes?.trim() || null,
    });

    return data as Membership;
  }

  async freezeMembership(input: FreezeMembershipInput): Promise<void> {
    assertStudentId(input.studentId);
    const today = isoDate(new Date());
    const { data: membership } = await supabase
      .from("Memberships")
      .select("id,status")
      .eq("student_id", input.studentId)
      .in("status", ["Active", "Expiring Soon"])
      .order("expiry_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("Students").update({
      membership_frozen: true,
      membership_status: "Frozen",
      membership_freeze_started_at: today,
      membership_freeze_reason: input.reason?.trim() || null,
    }).eq("id", input.studentId);
    if (error) throw new Error(error.message || "Unable to freeze membership.");

    if (membership?.id) await supabase.from("Memberships").update({ status: "Frozen" }).eq("id", membership.id);
    await supabase.from("Membership_Events").insert({
      student_id: input.studentId,
      membership_id: membership?.id ?? null,
      event_type: "Frozen",
      event_date: today,
      previous_status: membership?.status ?? "Active",
      new_status: "Frozen",
      reason: input.reason?.trim() || null,
    });
  }

  async reactivateMembership(student: Student): Promise<void> {
    assertStudentId(student.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const frozenAt = student.membership_freeze_started_at
      ? new Date(`${student.membership_freeze_started_at}T00:00:00`)
      : today;
    const freezeDays = Math.max(0, Math.floor((today.getTime() - frozenAt.getTime()) / 86400000));
    const oldEnd = student.membership_end_date || student.next_due_date;
    let newEnd = oldEnd;
    if (oldEnd && freezeDays > 0) {
      const date = new Date(`${oldEnd}T00:00:00`);
      date.setDate(date.getDate() + freezeDays);
      newEnd = isoDate(date);
    }
    const status = getMembershipStatus(newEnd, false);

    const { data: membership } = await supabase
      .from("Memberships")
      .select("id")
      .eq("student_id", student.id)
      .eq("status", "Frozen")
      .order("expiry_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("Students").update({
      membership_frozen: false,
      membership_status: status,
      membership_freeze_started_at: null,
      membership_freeze_reason: null,
      membership_end_date: newEnd,
      next_due_date: newEnd,
    }).eq("id", student.id);
    if (error) throw new Error(error.message || "Unable to reactivate membership.");

    if (membership?.id) await supabase.from("Memberships").update({ status, expiry_date: newEnd }).eq("id", membership.id);
    await supabase.from("Membership_Events").insert({
      student_id: student.id,
      membership_id: membership?.id ?? null,
      event_type: "Reactivated",
      event_date: isoDate(today),
      previous_status: "Frozen",
      new_status: status,
      notes: freezeDays > 0 ? `Expiry extended by ${freezeDays} day${freezeDays === 1 ? "" : "s"}.` : null,
    });
  }

  async cancelMembership(studentId: number, reason?: string): Promise<void> {
    assertStudentId(studentId);
    const { data: membership } = await supabase
      .from("Memberships")
      .select("id,status")
      .eq("student_id", studentId)
      .in("status", ["Active", "Expiring Soon", "Frozen"])
      .order("expiry_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("Students").update({
      membership_status: "Cancelled",
      membership_frozen: false,
      Status: "Inactive",
    }).eq("id", studentId);
    if (error) throw new Error(error.message || "Unable to cancel membership.");
    if (membership?.id) await supabase.from("Memberships").update({ status: "Cancelled" }).eq("id", membership.id);
    await supabase.from("Membership_Events").insert({
      student_id: studentId,
      membership_id: membership?.id ?? null,
      event_type: "Cancelled",
      event_date: isoDate(new Date()),
      previous_status: membership?.status ?? null,
      new_status: "Cancelled",
      reason: reason?.trim() || null,
    });
  }
}

export const membershipService = new MembershipService();
