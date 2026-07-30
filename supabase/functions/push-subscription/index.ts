import { createClient } from "npm:@supabase/supabase-js@2.110.8";

type SubscriptionInput = {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
};

type RequestBody = {
  action?: unknown;
  subscription?: SubscriptionInput;
  endpoint?: unknown;
  userAgent?: unknown;
};

const allowedOrigins = [
  "footloose-alley.vercel.app",
  "localhost",
  "127.0.0.1",
];

function jsonResponse(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin ?? "https://footloose-alley.vercel.app",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  try {
    const hostname = new URL(origin).hostname;
    return (
      allowedOrigins.includes(hostname) ||
      (hostname.startsWith("footloose-alley-") && hostname.endsWith(".vercel.app"))
    );
  } catch {
    return false;
  }
}

function normalizeSubscription(value: SubscriptionInput | undefined): {
  endpoint: string;
  p256dh: string;
  auth: string;
} | null {
  const endpoint = typeof value?.endpoint === "string" ? value.endpoint.trim() : "";
  const p256dh = typeof value?.keys?.p256dh === "string" ? value.keys.p256dh.trim() : "";
  const auth = typeof value?.keys?.auth === "string" ? value.keys.auth.trim() : "";

  if (!endpoint.startsWith("https://") || !p256dh || !auth) return null;
  return { endpoint, p256dh, auth };
}

function cleanUserAgent(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const userAgent = value.trim();
  return userAgent ? userAgent.slice(0, 500) : null;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) return jsonResponse(403, { error: "Origin is not allowed." }, origin);
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin ?? "https://footloose-alley.vercel.app",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        Vary: "Origin",
      },
    });
  }

  if (request.method !== "POST") return jsonResponse(405, { error: "Method not allowed." }, origin);
  if (!isAllowedOrigin(origin)) return jsonResponse(403, { error: "Origin is not allowed." }, origin);

  const authorization = request.headers.get("authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!authorization) return jsonResponse(401, { error: "Sign in to manage push notifications." }, origin);
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: "The push notification service is not configured." }, origin);
  }

  try {
    const body = (await request.json()) as RequestBody;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return jsonResponse(401, { error: "Your session is no longer valid. Sign in again and retry." }, origin);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,is_active")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile?.is_active || !["admin", "receptionist"].includes(profile.role)) {
      return jsonResponse(403, { error: "Only active staff can manage push notifications." }, origin);
    }

    const configured = Boolean(
      Deno.env.get("VAPID_PUBLIC_KEY") &&
        Deno.env.get("VAPID_PRIVATE_KEY") &&
        Deno.env.get("VAPID_SUBJECT")
    );

    if (body.action === "status") {
      const { data: subscription, error } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("user_id", userData.user.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return jsonResponse(200, { ok: true, configured, subscribed: Boolean(subscription) }, origin);
    }

    if (body.action === "subscribe") {
      if (!configured) {
        return jsonResponse(503, {
          error: "Push delivery needs VAPID configuration before this browser can subscribe.",
        }, origin);
      }

      const subscription = normalizeSubscription(body.subscription);
      if (!subscription) return jsonResponse(400, { error: "The browser push subscription is invalid." }, origin);

      const { error } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: userData.user.id,
            endpoint: subscription.endpoint,
            p256dh: subscription.p256dh,
            auth: subscription.auth,
            user_agent: cleanUserAgent(body.userAgent),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "endpoint" }
        );

      if (error) throw error;
      return jsonResponse(200, { ok: true, configured: true, subscribed: true }, origin);
    }

    if (body.action === "unsubscribe") {
      const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
      if (!endpoint.startsWith("https://")) return jsonResponse(400, { error: "The browser push subscription is invalid." }, origin);

      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", userData.user.id)
        .eq("endpoint", endpoint);

      if (error) throw error;
      return jsonResponse(200, { ok: true, configured, subscribed: false }, origin);
    }

    return jsonResponse(400, { error: "Unsupported push notification action." }, origin);
  } catch (error) {
    console.error("push-subscription failed", error);
    return jsonResponse(500, { error: "Unable to update push notification settings. Please try again." }, origin);
  }
});
