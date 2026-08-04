import { supabase } from "@/lib/supabase";

export const EVENT_CHECKIN_STATUSES = ["Registered", "Attended", "No Show", "Cancelled"] as const;
export type EventCheckInStatus = (typeof EVENT_CHECKIN_STATUSES)[number];

export interface EventAttendee {
  id: number;
  registration_id: number;
  event_id: number;
  position: number;
  participant_name: string;
  is_primary: boolean;
  attendance_status: EventCheckInStatus;
  checked_in_at: string | null;
  registration: {
    participant_name: string;
    phone: string;
    payment_status: string;
    amount_due: number | null;
    amount_paid: number;
    receipt_number: string | null;
  };
}

function message(error: unknown, fallback: string) {
  return error && typeof error === "object" && "message" in error ? `${fallback} ${String(error.message)}` : fallback;
}

async function getByEvent(eventId: number): Promise<EventAttendee[]> {
  const { data, error } = await supabase.from("Event_Attendees").select("id,registration_id,event_id,position,participant_name,is_primary,attendance_status,checked_in_at,registration:Event_Registrations(participant_name,phone,payment_status,amount_due,amount_paid,receipt_number)").eq("event_id", eventId).order("participant_name");
  if (error) throw new Error(message(error, "Unable to load event check-in."));
  return (data ?? []) as unknown as EventAttendee[];
}

async function setStatus(id: number, status: EventCheckInStatus) {
  if (!EVENT_CHECKIN_STATUSES.includes(status)) throw new Error("Select a valid attendance status.");
  const { error } = await supabase.from("Event_Attendees").update({ attendance_status: status, checked_in_at: status === "Attended" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(message(error, "Unable to update check-in."));
}

async function setRegistrationStatus(registrationId: number, status: EventCheckInStatus) {
  if (!EVENT_CHECKIN_STATUSES.includes(status)) throw new Error("Select a valid attendance status.");
  const { error } = await supabase.from("Event_Attendees").update({ attendance_status: status, checked_in_at: status === "Attended" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("registration_id", registrationId);
  if (error) throw new Error(message(error, "Unable to update group check-in."));
}

export const eventAttendanceService = { getByEvent, setStatus, setRegistrationStatus };
