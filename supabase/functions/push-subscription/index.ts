import { createClient } from "npm:@supabase/supabase-js@2.110.8";

type SubscriptionInput = {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
};

type PreferencesInput = {
  newEnquiriesEnabled?: unknown;
  trialChangesEnabled?: unknown;
  overdueFollowUpsEnabled?: unknown;
  quietHoursEnabled?: unknown;
  quietHoursStart?: unknown;
  quietHoursEnd?: unknown;
  timezone?: unknown;
};

type RequestBody = {
  action?: unknown;
  subscription?: SubscriptionInput;
  endpoint?: unknown;
  userAgent?: unknown;
  preferences?: PreferencesInput;
};

const allowedOrigins = [
  "footloose-alley.vercel.app",
  "localhost",
  "127.0.0.1",
];

const defaultPreferences = {
  newEnquiriesEnabled: true,
  trialChangesEnabled: true,
  overdueFollowUpsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: "21:00",
  quietHoursEnd: "08:00",
  timezone: "Asia/Kolkata",
};

const supportedTimeZones = new Set(
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : ["Asia/Kolkata", "UTC"]
);
supportedTimeZones.add("UTC");

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

function isTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizePreferences(value: PreferencesInput | undefined): typeof defaultPreferences | null {
  if (
    typeof value?.newEnquiriesEnabled !== "boolean" ||
    typeof value.trialChangesEnabled !== "boolean" ||
    typeof value.overdueFollowUpsEnabled !== "boolean" ||
    typeof value.quietHoursEnabled !== "boolean" ||
    !isTime(value.quietHoursStart) ||
    !isTime(value.quietHoursEnd) ||
    typeof value.timezone !== "string"
  ) {
    return null;
  }

  const timezone = value.timezone.trim();
  if (
    value.quietHoursStart === value.quietHoursEnd ||
    !supportedTimeZones.has(timezone)
  ) {
    return null;
  }

  return {
    newEnquiriesEnabled: value.newEnquiriesEnabled,
    trialChangesEnabled: value.trialChangesEnabled,
    overdueFollowUpsEnabled: value.overdueFollowUpsEnabled,
    quietHoursEnabled: value.quietHoursEnabled,
    quietHoursStart: value.quietHoursStart,
    quietHoursEnd: value.quietHoursEnd,
    timezone,
  };
}

function toPreferences(
  value: {
    new_enquiries_enabled: boolean;
    trial_changes_enabled: boolean;
    overdue_follow_ups_enabled: boolean;
    quiet_hours_enabled: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
    timezone: string;
  } | null
): typeof defaultPreferences {
  if (!value) return defaultPreferences;
  return {
    newEnquiriesEnabled: value.new_enquiries_enabled,
    trialChangesEnabled: value.trial_changes_enabled,
    overdueFollowUpsEnabled: value.overdue_follow_ups_enabled,
    quietHoursEnabled: value.quiet_hours_enabled,
    quietHoursStart: value.quiet_hours_start.slice(0, 5),
    quietHoursEnd: value.quiet_hours_end.slice(0, 5),
    timezone: value.timezone,
  };
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
      const [{ data: subscription, error: subscriptionError }, { data: preferences, error: preferencesError }] =
        await Promise.all([
          supabase
            .from("push_subscriptions")
            .select("id")
            .eq("user_id", userData.user.id)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("staff_push_preferences")
            .select(
              "new_enquiries_enabled,trial_changes_enabled,overdue_follow_ups_enabled,quiet_hours_enabled,quiet_hours_start,quiet_hours_end,timezone"
            )
            .eq("user_id", userData.user.id)
            .maybeSingle(),
        ]);

      if (subscriptionError) throw subscriptionError;
      if (preferencesError) throw preferencesError;
      return jsonResponse(200, {
        ok: true,
        configured,
        subscribed: Boolean(subscription),
        preferences: toPreferences(preferences),
      }, origin);
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

    if (body.action === "update_preferences") {
      const preferences = normalizePreferences(body.preferences);
      if (!preferences) {
        return jsonResponse(400, {
          error: "Choose a valid timezone and different start and end times for quiet hours.",
        }, origin);
      }

      const { error } = await supabase
        .from("staff_push_preferences")
        .upsert(
          {
            user_id: userData.user.id,
            new_enquiries_enabled: preferences.newEnquiriesEnabled,
            trial_changes_enabled: preferences.trialChangesEnabled,
            overdue_follow_ups_enabled: preferences.overdueFollowUpsEnabled,
            quiet_hours_enabled: preferences.quietHoursEnabled,
            quiet_hours_start: preferences.quietHoursStart,
            quiet_hours_end: preferences.quietHoursEnd,
            timezone: preferences.timezone,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;
      return jsonResponse(200, { ok: true, configured, preferences }, origin);
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
