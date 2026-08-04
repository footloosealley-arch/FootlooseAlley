import { supabase } from "@/lib/supabase";

export const EVENT_TYPES = ["Workshop", "Party", "Outdoor", "Special Class", "Performance", "Other"] as const;
export const EVENT_STATUSES = ["Draft", "Upcoming", "Completed", "Cancelled"] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface StudioEvent {
  id: number; created_at: string; updated_at: string; title: string;
  event_type: EventType; event_date: string; start_time: string; end_time: string;
  location: string; max_capacity: number; fee: number; status: EventStatus;
  description: string | null; contact_phone: string | null; notes: string | null;
  image_url: string | null; image_path: string | null;
}
export interface EventInput {
  title: string; event_type: EventType; event_date: string; start_time: string;
  end_time: string; location: string; max_capacity: number; fee: number;
  status: EventStatus; description?: string | null; contact_phone?: string | null;
  notes?: string | null;
}

const BUCKET = "event-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
};
const fields = "id,created_at,updated_at,title,event_type,event_date,start_time,end_time,location,max_capacity,fee,status,description,contact_phone,notes,image_url,image_path";

function errorMessage(error: unknown, operation: string) {
  return error && typeof error === "object" && "message" in error
    ? `${operation} ${String(error.message)}` : operation;
}

export function validateEventImage(file: File) {
  if (!IMAGE_EXTENSIONS[file.type]) throw new Error("Event photo must be a JPEG, PNG, or WebP image.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Event photo must be 5 MB or smaller.");
}

export function normalizeEventInput(input: EventInput): EventInput {
  const title = input.title.trim(), location = input.location.trim();
  const description = input.description?.trim() || null, notes = input.notes?.trim() || null;
  const rawContact = input.contact_phone?.trim() || "", contact_phone = rawContact.replace(/\D/g, "") || null;
  if (title.length < 2) throw new Error("Title must be at least 2 characters.");
  if (!EVENT_TYPES.includes(input.event_type)) throw new Error("Select a valid event type.");
  if (!EVENT_STATUSES.includes(input.status)) throw new Error("Select a valid status.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.event_date)) throw new Error("Select a valid event date.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.start_time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.end_time)) throw new Error("Enter valid start and end times.");
  if (input.end_time <= input.start_time) throw new Error("End time must be later than start time.");
  if (!location) throw new Error("Location is required.");
  if (!Number.isInteger(input.max_capacity) || input.max_capacity < 1 || input.max_capacity > 10000) throw new Error("Capacity must be between 1 and 10,000.");
  if (!Number.isFinite(input.fee) || input.fee < 0) throw new Error("Fee must be zero or greater.");
  if (rawContact && (!contact_phone || contact_phone.length < 7 || contact_phone.length > 15)) throw new Error("Contact phone must contain between 7 and 15 digits.");
  return { ...input, title, location, description, notes, contact_phone, fee: Number(input.fee.toFixed(2)) };
}

async function ensureEventIsUnique(input: EventInput, currentId?: number) {
  let query = supabase
    .from("Events")
    .select("id")
    .eq("title", input.title.trim())
    .eq("event_date", input.event_date)
    .eq("start_time", input.start_time)
    .eq("location", input.location.trim())
    .limit(1);
  if (currentId) query = query.neq("id", currentId);
  const { data, error } = await query;
  if (error) throw new Error(errorMessage(error, "Unable to validate the event schedule."));
  if ((data ?? []).length > 0) throw new Error("This event already exists at the selected date, time, and location.");
}

async function uploadImage(file: File) {
  validateEventImage(file);
  const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(errorMessage(error, "Unable to upload event photo."));
  return { image_path: path, image_url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

async function removeImage(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn(errorMessage(error, "Unable to remove the previous event photo."));
}

function sorted(rows: StudioEvent[]) {
  return rows.sort((a, b) => a.event_date.localeCompare(b.event_date) || a.start_time.localeCompare(b.start_time) || a.title.localeCompare(b.title));
}
async function getAll() {
  const { data, error } = await supabase.from("Events").select(fields);
  if (error) throw new Error(errorMessage(error, "Unable to load events."));
  return sorted((data ?? []) as StudioEvent[]);
}
async function create(input: EventInput, image?: File | null) {
  const normalized = normalizeEventInput(input);
  await ensureEventIsUnique(normalized);
  const uploaded = image ? await uploadImage(image) : null;
  const { data, error } = await supabase.from("Events").insert({ ...normalized, ...uploaded }).select(fields).single();
  if (error) {
    if (uploaded) await removeImage(uploaded.image_path);
    throw new Error(errorMessage(error, "Unable to create event."));
  }
  return data as StudioEvent;
}
async function update(id: number, input: EventInput, image?: File | null, removePhoto = false) {
  const normalized = normalizeEventInput(input);
  await ensureEventIsUnique(normalized, id);
  const { data: existing, error: readError } = await supabase.from("Events").select("image_path,image_url").eq("id", id).single();
  if (readError) throw new Error(errorMessage(readError, "Unable to load the existing event photo."));
  const uploaded = image ? await uploadImage(image) : null;
  const imageChanges = uploaded ?? (removePhoto ? { image_path: null, image_url: null } : {});
  const { data, error } = await supabase.from("Events").update({ ...normalized, ...imageChanges, updated_at: new Date().toISOString() }).eq("id", id).select(fields).single();
  if (error) {
    if (uploaded) await removeImage(uploaded.image_path);
    throw new Error(errorMessage(error, "Unable to update event."));
  }
  if ((uploaded || removePhoto) && existing?.image_path && existing.image_path !== uploaded?.image_path) await removeImage(existing.image_path);
  return data as StudioEvent;
}
async function setStatus(id: number, status: EventStatus) {
  if (!EVENT_STATUSES.includes(status)) throw new Error("Select a valid status.");
  const { data, error } = await supabase.from("Events").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select(fields).single();
  if (error) throw new Error(errorMessage(error, "Unable to change event status."));
  return data as StudioEvent;
}

async function duplicate(event: StudioEvent) {
  const copy: EventInput = {
    title: `${event.title} (Copy)`,
    event_type: event.event_type,
    event_date: event.event_date,
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location,
    max_capacity: event.max_capacity,
    fee: Number(event.fee),
    status: "Draft",
    description: event.description,
    contact_phone: event.contact_phone,
    notes: event.notes,
  };
  const { data, error } = await supabase.from("Events").insert(normalizeEventInput(copy)).select(fields).single();
  if (error) throw new Error(errorMessage(error, "Unable to duplicate event."));
  return data as StudioEvent;
}

async function remove(event: StudioEvent) {
  if (!["Draft", "Cancelled"].includes(event.status)) {
    throw new Error("Only draft or cancelled events can be permanently deleted.");
  }
  const { error } = await supabase.from("Events").delete().eq("id", event.id);
  if (error) throw new Error(errorMessage(error, "Unable to delete event. Administrator access may be required."));
  if (event.image_path) await removeImage(event.image_path);
}

export const eventsService = { getAll, create, update, setStatus, duplicate, remove };
