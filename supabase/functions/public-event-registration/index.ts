import { createClient } from "npm:@supabase/supabase-js@2.110.8";

const allowedOrigins = ["footloose-alley.vercel.app", "localhost", "127.0.0.1"];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const hostname = new URL(origin).hostname;
    return allowedOrigins.includes(hostname) || (hostname.startsWith("footloose-alley-") && hostname.endsWith(".vercel.app"));
  } catch {
    return false;
  }
}

function response(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin ?? "https://footloose-alley.vercel.app",
      "Access-Control-Allow-Headers": "content-type, apikey, x-client-info",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}

function positiveId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function upiUrl(upiId: string, payeeName: string, amount: number, title: string, registrationId: number): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `${title} registration ${registrationId}`.slice(0, 80),
  });
  return `upi://pay?${params.toString()}`;
}

async function resolveCoupon(supabase: ReturnType<typeof createClient>, eventId: number, rawCode: unknown, fee: number) {
  const code = cleanText(rawCode, 24).toUpperCase();
  if (!code) return { code: null, percent: 0, discount: 0, amount: fee };
  const { data: coupon, error } = await supabase.from("Event_Coupons").select("code,discount_percent,expires_at,usage_limit,is_active").eq("event_id", eventId).eq("code", code).maybeSingle();
  if (error) throw error;
  if (!coupon || !coupon.is_active) throw new Error("INVALID_COUPON");
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= Date.now()) throw new Error("EXPIRED_COUPON");
  if (coupon.usage_limit) {
    const { count, error: usageError } = await supabase.from("Event_Registrations").select("id", { count: "exact", head: true }).eq("event_id", eventId).eq("coupon_code", code).neq("attendance_status", "Cancelled");
    if (usageError) throw usageError;
    if ((count ?? 0) >= coupon.usage_limit) throw new Error("USED_COUPON");
  }
  const percent = Number(coupon.discount_percent);
  const discount = Number(Math.min(fee, fee * percent / 100).toFixed(2));
  return { code, percent, discount, amount: Number((fee - discount).toFixed(2)) };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) return response(403, { error: "Origin is not allowed." }, origin);
    return response(200, { ok: true }, origin);
  }
  if (request.method !== "POST") return response(405, { error: "Method not allowed." }, origin);
  if (!isAllowedOrigin(origin)) return response(403, { error: "Origin is not allowed." }, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return response(503, { error: "Registration service is unavailable." }, origin);

  try {
    const body = await request.json() as Record<string, unknown>;
    const eventId = positiveId(body.eventId);
    if (!eventId) return response(400, { error: "Invalid event." }, origin);
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: event, error: eventError } = await supabase
      .from("Events")
      .select("id,title,event_type,event_date,start_time,end_time,location,max_capacity,fee,status,description,image_url,contact_phone,public_registration_enabled,payment_upi_id,payment_payee_name")
      .eq("id", eventId)
      .eq("status", "Upcoming")
      .eq("public_registration_enabled", true)
      .maybeSingle();
    if (eventError) throw eventError;
    if (!event) return response(404, { error: "This event is not accepting public registrations." }, origin);

    const { count, error: countError } = await supabase
      .from("Event_Registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .neq("attendance_status", "Cancelled");
    if (countError) throw countError;
    const registered = count ?? 0;

    if (body.action === "event") {
      return response(200, {
        ok: true,
        event: {
          id: event.id, title: event.title, eventType: event.event_type, eventDate: event.event_date,
          startTime: event.start_time, endTime: event.end_time, location: event.location,
          capacity: event.max_capacity, registered, spotsLeft: Math.max(0, event.max_capacity - registered),
          fee: Number(event.fee), description: event.description, imageUrl: event.image_url,
          contactPhone: event.contact_phone,
        },
      }, origin);
    }

    if (body.action === "coupon") {
      try {
        const coupon = await resolveCoupon(supabase, eventId, body.couponCode, Number(event.fee));
        if (!coupon.code) return response(400, { error: "Enter a coupon code." }, origin);
        return response(200, { ok: true, couponCode: coupon.code, discountPercent: coupon.percent, discountAmount: coupon.discount, amount: coupon.amount }, origin);
      } catch (couponError) {
        const code = couponError instanceof Error ? couponError.message : "";
        const message = code === "EXPIRED_COUPON" ? "This coupon has expired." : code === "USED_COUPON" ? "This coupon has reached its usage limit." : "This coupon code is invalid.";
        return response(400, { error: message }, origin);
      }
    }

    if (body.action === "reference") {
      const registrationId = positiveId(body.registrationId);
      const phone = cleanText(body.phone, 30).replace(/\D/g, "");
      const paymentReference = cleanText(body.paymentReference, 100);
      if (!registrationId || phone.length < 7 || !paymentReference) return response(400, { error: "Enter the UPI transaction reference." }, origin);
      const { data, error } = await supabase
        .from("Event_Registrations")
        .update({ payment_reference: paymentReference, updated_at: new Date().toISOString() })
        .eq("id", registrationId).eq("event_id", eventId).eq("phone", phone)
        .select("id").maybeSingle();
      if (error) throw error;
      if (!data) return response(404, { error: "Registration could not be verified." }, origin);
      return response(200, { ok: true }, origin);
    }

    if (body.action !== "register") return response(400, { error: "Unsupported action." }, origin);
    if (cleanText(body.website, 200)) return response(400, { error: "Unable to submit registration." }, origin);
    if (registered >= event.max_capacity) return response(409, { error: "This event is fully booked." }, origin);

    const name = cleanText(body.name, 120);
    const phone = cleanText(body.phone, 30).replace(/\D/g, "");
    const email = cleanText(body.email, 200).toLowerCase() || null;
    if (name.length < 2) return response(400, { error: "Enter your full name." }, origin);
    if (phone.length < 7 || phone.length > 15) return response(400, { error: "Enter a valid phone number." }, origin);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response(400, { error: "Enter a valid email address." }, origin);

    let coupon;
    try { coupon = await resolveCoupon(supabase, eventId, body.couponCode, Number(event.fee)); }
    catch (couponError) {
      const code = couponError instanceof Error ? couponError.message : "";
      const message = code === "EXPIRED_COUPON" ? "This coupon has expired." : code === "USED_COUPON" ? "This coupon has reached its usage limit." : "This coupon code is invalid.";
      return response(400, { error: message }, origin);
    }

    const { data: registration, error: registrationError } = await supabase
      .from("Event_Registrations")
      .insert({
        event_id: eventId, participant_name: name, phone, email,
        payment_status: coupon.amount === 0 ? "Waived" : "Pending",
        amount_paid: 0, attendance_status: "Registered", registration_source: "Public Link",
        coupon_code: coupon.code, original_amount: Number(event.fee), discount_amount: coupon.discount, amount_due: coupon.amount,
      })
      .select("id").single();
    if (registrationError) {
      if (registrationError.code === "23505") return response(409, { error: "This phone number is already registered for the event." }, origin);
      throw registrationError;
    }

    const paymentUrl = coupon.amount > 0 && event.payment_upi_id && event.payment_payee_name
      ? upiUrl(event.payment_upi_id, event.payment_payee_name, coupon.amount, event.title, registration.id)
      : null;
    return response(201, { ok: true, registrationId: registration.id, phone, paymentUrl, amount: coupon.amount, originalAmount: Number(event.fee), discountAmount: coupon.discount, couponCode: coupon.code }, origin);
  } catch (error) {
    console.error("public-event-registration failed", error);
    return response(500, { error: "Unable to process the registration. Please try again." }, origin);
  }
});
