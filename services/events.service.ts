import { supabase } from "@/lib/supabase";

export const EVENT_TYPES = ["Workshop", "Party", "Outdoor", "Special Class", "Performance", "Other"] as const;
export const EVENT_STATUSES = ["Draft", "Upcoming", "Completed", "Cancelled"] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];
export interface StudioEvent { id:number; created_at:string; updated_at:string; title:string; event_type:EventType; event_date:string; start_time:string; end_time:string; location:string; max_capacity:number; fee:number; status:EventStatus; description:string|null; contact_phone:string|null; notes:string|null }
export interface EventInput { title:string; event_type:EventType; event_date:string; start_time:string; end_time:string; location:string; max_capacity:number; fee:number; status:EventStatus; description?:string|null; contact_phone?:string|null; notes?:string|null }

const fields = "id,created_at,updated_at,title,event_type,event_date,start_time,end_time,location,max_capacity,fee,status,description,contact_phone,notes";
function errorMessage(error:unknown, operation:string) { return error && typeof error === "object" && "message" in error ? `${operation} ${String(error.message)}` : operation; }
export function normalizeEventInput(input:EventInput):EventInput {
  const title=input.title.trim(), location=input.location.trim(), description=input.description?.trim()||null, notes=input.notes?.trim()||null, rawContact=input.contact_phone?.trim()||"", contact_phone=rawContact.replace(/\D/g, "")||null;
  if (title.length < 2) throw new Error("Title must be at least 2 characters.");
  if (!EVENT_TYPES.includes(input.event_type)) throw new Error("Select a valid event type.");
  if (!EVENT_STATUSES.includes(input.status)) throw new Error("Select a valid status.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.event_date)) throw new Error("Select a valid event date.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.start_time)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.end_time)) throw new Error("Enter valid start and end times.");
  if (input.end_time <= input.start_time) throw new Error("End time must be later than start time.");
  if (!location) throw new Error("Location is required.");
  if (!Number.isInteger(input.max_capacity)||input.max_capacity<1||input.max_capacity>10000) throw new Error("Capacity must be between 1 and 10,000.");
  if (!Number.isFinite(input.fee)||input.fee<0) throw new Error("Fee must be zero or greater.");
  if (rawContact && (!contact_phone || contact_phone.length < 7 || contact_phone.length > 15)) throw new Error("Contact phone must contain between 7 and 15 digits.");
  return {...input,title,location,description,notes,contact_phone,fee:Number(input.fee.toFixed(2))};
}
function sorted(rows:StudioEvent[]) { return rows.sort((a,b)=>a.event_date.localeCompare(b.event_date)||a.start_time.localeCompare(b.start_time)||a.title.localeCompare(b.title)); }
async function getAll(){const {data,error}=await supabase.from("Events").select(fields);if(error)throw new Error(errorMessage(error,"Unable to load events."));return sorted((data??[]) as StudioEvent[])}
async function create(input:EventInput){const {data,error}=await supabase.from("Events").insert(normalizeEventInput(input)).select(fields).single();if(error)throw new Error(errorMessage(error,"Unable to create event."));return data as StudioEvent}
async function update(id:number,input:EventInput){const {data,error}=await supabase.from("Events").update({...normalizeEventInput(input),updated_at:new Date().toISOString()}).eq("id",id).select(fields).single();if(error)throw new Error(errorMessage(error,"Unable to update event."));return data as StudioEvent}
async function setStatus(id:number,status:EventStatus){if(!EVENT_STATUSES.includes(status))throw new Error("Select a valid status.");const {data,error}=await supabase.from("Events").update({status,updated_at:new Date().toISOString()}).eq("id",id).select(fields).single();if(error)throw new Error(errorMessage(error,"Unable to change event status."));return data as StudioEvent}
export const eventsService={getAll,create,update,setStatus};
