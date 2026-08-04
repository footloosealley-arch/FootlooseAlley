import { supabase } from "@/lib/supabase";

export interface EventCoupon {
  id: number;
  event_id: number;
  code: string;
  discount_percent: number;
  expires_at: string | null;
  usage_limit: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventCouponInput {
  code: string;
  discount_percent: number;
  expires_at?: string | null;
  usage_limit?: number | null;
  is_active: boolean;
}

function normalize(input: EventCouponInput) {
  const code = input.code.trim().toUpperCase();
  const discount_percent = Number(input.discount_percent);
  const usage_limit = input.usage_limit ? Number(input.usage_limit) : null;
  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) throw new Error("Coupon code must contain 3–24 letters, numbers, hyphens or underscores.");
  if (!Number.isFinite(discount_percent) || discount_percent <= 0 || discount_percent > 100) throw new Error("Discount must be between 1% and 100%.");
  if (usage_limit !== null && (!Number.isInteger(usage_limit) || usage_limit < 1)) throw new Error("Usage limit must be a whole number greater than zero.");
  return { ...input, code, discount_percent: Number(discount_percent.toFixed(2)), usage_limit, expires_at: input.expires_at || null };
}

function message(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "code" in error && error.code === "23505") return "That coupon code already exists for this event.";
  return error && typeof error === "object" && "message" in error ? `${fallback} ${String(error.message)}` : fallback;
}

async function getByEvent(eventId: number) {
  const { data, error } = await supabase.from("Event_Coupons").select("*").eq("event_id", eventId).order("created_at");
  if (error) throw new Error(message(error, "Unable to load coupons."));
  return (data ?? []) as EventCoupon[];
}

async function create(eventId: number, input: EventCouponInput) {
  const { data, error } = await supabase.from("Event_Coupons").insert({ event_id: eventId, ...normalize(input) }).select("*").single();
  if (error) throw new Error(message(error, "Unable to add coupon."));
  return data as EventCoupon;
}

async function update(id: number, input: EventCouponInput) {
  const { data, error } = await supabase.from("Event_Coupons").update({ ...normalize(input), updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error) throw new Error(message(error, "Unable to update coupon."));
  return data as EventCoupon;
}

async function remove(id: number) {
  const { error } = await supabase.from("Event_Coupons").delete().eq("id", id);
  if (error) throw new Error(message(error, "Unable to delete coupon."));
}

export const eventCouponsService = { getByEvent, create, update, remove };
