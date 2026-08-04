import { supabase } from "@/lib/supabase";

export const EVENT_PAYMENT_STATUSES = ["Pending", "Paid", "Waived", "Refunded"] as const;
export const EVENT_ATTENDANCE_STATUSES = ["Registered", "Attended", "No Show", "Cancelled"] as const;

export type EventPaymentStatus = (typeof EVENT_PAYMENT_STATUSES)[number];
export type EventAttendanceStatus = (typeof EVENT_ATTENDANCE_STATUSES)[number];

export interface EventRegistration {
  id: number;
  event_id: number;
  participant_name: string;
  phone: string;
  payment_status: EventPaymentStatus;
  amount_paid: number;
  attendance_status: EventAttendanceStatus;
  notes: string | null;
  email: string | null;
  payment_reference: string | null;
  registration_source: "Staff" | "Public Link";
  coupon_code: string | null;
  original_amount: number | null;
  discount_amount: number;
  amount_due: number | null;
  group_size: number;
  additional_participant_names: string[];
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationInput {
  participant_name: string;
  phone: string;
  payment_status: EventPaymentStatus;
  amount_paid: number;
  attendance_status: EventAttendanceStatus;
  notes?: string | null;
  email?: string | null;
  payment_reference?: string | null;
}

export interface EventRegistrationSummary {
  event_id: number;
  registrations: number;
  attended: number;
  pending_payments: number;
  collected: number;
}

const fields = "id,event_id,participant_name,phone,email,payment_status,amount_paid,payment_reference,attendance_status,registration_source,coupon_code,original_amount,discount_amount,amount_due,group_size,additional_participant_names,notes,created_at,updated_at";

function normalize(input: EventRegistrationInput) {
  const participant_name = input.participant_name.trim();
  const phone = input.phone.replace(/\D/g, "");
  const notes = input.notes?.trim() || null;
  const email = input.email?.trim().toLowerCase() || null;
  const payment_reference = input.payment_reference?.trim() || null;
  if (participant_name.length < 2 || participant_name.length > 120) throw new Error("Participant name must contain 2 to 120 characters.");
  if (phone.length < 7 || phone.length > 15) throw new Error("Phone number must contain 7 to 15 digits.");
  if (!EVENT_PAYMENT_STATUSES.includes(input.payment_status)) throw new Error("Select a valid payment status.");
  if (!EVENT_ATTENDANCE_STATUSES.includes(input.attendance_status)) throw new Error("Select a valid attendance status.");
  if (!Number.isFinite(input.amount_paid) || input.amount_paid < 0) throw new Error("Amount paid must be zero or greater.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  return { ...input, participant_name, phone, email, payment_reference, notes, amount_paid: Number(input.amount_paid.toFixed(2)) };
}

function message(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "code" in error && error.code === "23505") {
    return "This phone number is already registered for the event.";
  }
  return error && typeof error === "object" && "message" in error
    ? `${fallback} ${String(error.message)}`
    : fallback;
}

function isMissingTable(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "42P01");
}

async function getByEvent(eventId: number): Promise<EventRegistration[]> {
  const { data, error } = await supabase.from("Event_Registrations").select(fields).eq("event_id", eventId).order("created_at");
  if (error) throw new Error(message(error, "Unable to load event registrations."));
  return (data ?? []) as EventRegistration[];
}

async function getSummaries(): Promise<EventRegistrationSummary[]> {
  const { data, error } = await supabase.from("Event_Registrations").select("event_id,payment_status,amount_paid,attendance_status,group_size");
  if (error) {
    if (isMissingTable(error)) return [];
    throw new Error(message(error, "Unable to load event registration totals."));
  }
  const summaries = new Map<number, EventRegistrationSummary>();
  for (const row of data ?? []) {
    const current = summaries.get(row.event_id) ?? { event_id: row.event_id, registrations: 0, attended: 0, pending_payments: 0, collected: 0 };
    current.registrations += row.attendance_status === "Cancelled" ? 0 : Number(row.group_size ?? 1);
    current.attended += row.attendance_status === "Attended" ? 1 : 0;
    current.pending_payments += row.payment_status === "Pending" && row.attendance_status !== "Cancelled" ? 1 : 0;
    current.collected += row.payment_status === "Paid" ? Number(row.amount_paid) : 0;
    summaries.set(row.event_id, current);
  }
  return [...summaries.values()];
}

async function create(eventId: number, input: EventRegistrationInput): Promise<EventRegistration> {
  const { data, error } = await supabase.from("Event_Registrations").insert({ event_id: eventId, ...normalize(input) }).select(fields).single();
  if (error) throw new Error(message(error, "Unable to add participant."));
  return data as EventRegistration;
}

async function update(id: number, input: EventRegistrationInput): Promise<EventRegistration> {
  const { data, error } = await supabase.from("Event_Registrations").update({ ...normalize(input), updated_at: new Date().toISOString() }).eq("id", id).select(fields).single();
  if (error) throw new Error(message(error, "Unable to update participant."));
  return data as EventRegistration;
}

async function remove(id: number): Promise<void> {
  const { error } = await supabase.from("Event_Registrations").delete().eq("id", id);
  if (error) throw new Error(message(error, "Unable to delete participant. Administrator access may be required."));
}

export const eventRegistrationsService = { getByEvent, getSummaries, create, update, remove };
