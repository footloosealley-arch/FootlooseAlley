import { createClient } from "npm:@supabase/supabase-js@2.110.8";
import webpush from "npm:web-push@3.6.7";

type PushEvent = {
  id: number;
  event_type: "enquiry" | "trial" | "overdue_follow_up";
  dedupe_key: string;
};

type PushSubscription = {
  id: number;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type PushPreferences = {
  user_id: string;
  new_enquiries_enabled: boolean;
  trial_changes_enabled: boolean;
  overdue_follow_ups_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
};

const defaultPreferences: Omit<PushPreferences, "user_id"> = {
  new_enquiries_enabled: true,
  trial_changes_enabled: true,
  overdue_follow_ups_enabled: true,
  quiet_hours_enabled: false,
  quiet_hours_start: "21:00",
  quiet_hours_end: "08:00",
  timezone: "Asia/Kolkata",
};

const safePayloads = {
  enquiry: {
    title: "New enquiry",
    body: "A new enquiry needs your attention.",
    href: "/enquiries",
  },
  trial: {
    title: "Trial request",
    body: "A trial request needs your attention.",
    href: "/trials",
  },
  overdue_follow_up: {
    title: "Overdue follow-up",
    body: "A staff follow-up needs your attention.",
    href: "/follow-ups",
  },
} as const;

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function getStudioDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function matchesSecret(actual: string | null, expected: string | undefined): boolean {
  if (!actual || !expected || actual.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function isSubscriptionExpired(error: unknown): boolean {
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return statusCode === 404 || statusCode === 410;
}

function isEventEnabled(event: PushEvent, preferences: Omit<PushPreferences, "user_id">): boolean {
  if (event.event_type === "enquiry") return preferences.new_enquiries_enabled;
  if (event.event_type === "trial") return preferences.trial_changes_enabled;
  return preferences.overdue_follow_ups_enabled;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function getCurrentMinutes(timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return Number(values.hour) * 60 + Number(values.minute);
}

function isQuietNow(preferences: Omit<PushPreferences, "user_id">): boolean {
  if (!preferences.quiet_hours_enabled) return false;

  try {
    const current = getCurrentMinutes(preferences.timezone);
    const start = toMinutes(preferences.quiet_hours_start);
    const end = toMinutes(preferences.quiet_hours_end);

    return start < end
      ? current >= start && current < end
      : current >= start || current < end;
  } catch {
    return false;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return jsonResponse(405, { error: "Method not allowed." });

  const dispatchSecret = Deno.env.get("PUSH_DISPATCH_SECRET");
  if (!matchesSecret(request.headers.get("x-push-dispatch-secret"), dispatchSecret)) {
    return jsonResponse(401, { error: "Unauthorized dispatcher." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return jsonResponse(503, { error: "Push delivery is not configured." });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const today = getStudioDateString();
    const { data: overdueEnquiries, error: overdueError } = await supabase
      .from("Enquiries")
      .select("id,Follow_up_date")
      .lt("Follow_up_date", today)
      .not("Status", "in", '("Joined","Closed")');

    if (overdueError) throw overdueError;

    if ((overdueEnquiries ?? []).length > 0) {
      const { error: queueError } = await supabase
        .from("staff_push_events")
        .upsert(
          overdueEnquiries.map((enquiry) => ({
            event_type: "overdue_follow_up",
            entity_id: enquiry.id,
            title: "Overdue follow-up",
            body: "A staff follow-up needs your attention.",
            href: "/follow-ups",
            dedupe_key: `overdue-follow-up:${enquiry.id}:${today}`,
          })),
          { onConflict: "dedupe_key", ignoreDuplicates: true }
        );

      if (queueError) throw queueError;
    }

    const [
      { data: events, error: eventsError },
      { data: activeProfiles, error: profilesError },
      { data: preferenceRows, error: preferencesError },
    ] = await Promise.all([
      supabase
        .from("staff_push_events")
        .select("id,event_type,dedupe_key")
        .is("delivered_at", null)
        .order("created_at", { ascending: true })
        .limit(25),
      supabase
        .from("profiles")
        .select("id")
        .eq("is_active", true)
        .in("role", ["admin", "receptionist"]),
      supabase
        .from("staff_push_preferences")
        .select(
          "user_id,new_enquiries_enabled,trial_changes_enabled,overdue_follow_ups_enabled,quiet_hours_enabled,quiet_hours_start,quiet_hours_end,timezone"
        ),
    ]);

    if (eventsError) throw eventsError;
    if (profilesError) throw profilesError;
    if (preferencesError) throw preferencesError;

    const activeUserIds = new Set((activeProfiles ?? []).map((profile) => profile.id));
    const { data: allSubscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("id,user_id,endpoint,p256dh,auth");

    if (subscriptionsError) throw subscriptionsError;

    const subscriptions = ((allSubscriptions ?? []) as PushSubscription[]).filter((subscription) =>
      activeUserIds.has(subscription.user_id)
    );
    const pendingEvents = (events ?? []) as PushEvent[];
    const preferencesByUser = new Map(
      ((preferenceRows ?? []) as PushPreferences[]).map((preferences) => [
        preferences.user_id,
        preferences,
      ])
    );
    const subscriptionsByUser = new Map<string, PushSubscription[]>();

    for (const subscription of subscriptions) {
      const userSubscriptions = subscriptionsByUser.get(subscription.user_id) ?? [];
      userSubscriptions.push(subscription);
      subscriptionsByUser.set(subscription.user_id, userSubscriptions);
    }

    if (pendingEvents.length === 0 || subscriptionsByUser.size === 0) {
      return jsonResponse(200, {
        ok: true,
        queued: pendingEvents.length,
        delivered: 0,
        suppressed: 0,
        subscriptions: subscriptions.length,
      });
    }

    const { data: receiptRows, error: receiptsError } = await supabase
      .from("staff_push_delivery_receipts")
      .select("event_id,user_id,outcome")
      .in("event_id", pendingEvents.map((event) => event.id));

    if (receiptsError) throw receiptsError;

    const processedRecipients = new Set(
      (receiptRows ?? []).map((receipt) => `${receipt.event_id}:${receipt.user_id}`)
    );

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    let delivered = 0;
    let suppressed = 0;
    const expiredSubscriptionIds = new Set<number>();

    for (const event of pendingEvents) {
      for (const [userId, userSubscriptions] of subscriptionsByUser) {
        const receiptKey = `${event.id}:${userId}`;
        if (processedRecipients.has(receiptKey)) continue;

        const preferences = preferencesByUser.get(userId) ?? defaultPreferences;
        if (!isEventEnabled(event, preferences)) {
          const { error } = await supabase
            .from("staff_push_delivery_receipts")
            .upsert(
              { event_id: event.id, user_id: userId, outcome: "suppressed" },
              { onConflict: "event_id,user_id", ignoreDuplicates: true }
            );

          if (error) throw error;
          processedRecipients.add(receiptKey);
          suppressed += 1;
          continue;
        }

        if (isQuietNow(preferences)) continue;

        const payload = safePayloads[event.event_type];
        const results = await Promise.all(
          userSubscriptions.map(async (subscription) => {
            try {
              await webpush.sendNotification(
                {
                  endpoint: subscription.endpoint,
                  keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                  },
                },
                JSON.stringify({
                  ...payload,
                  tag: event.dedupe_key,
                }),
                {
                  TTL: 60 * 60 * 24,
                  urgency: "high",
                  topic: `footloose-${event.id}`.slice(0, 32),
                }
              );
              return true;
            } catch (error) {
              if (isSubscriptionExpired(error)) expiredSubscriptionIds.add(subscription.id);
              console.error("push delivery failed", {
                eventId: event.id,
                subscriptionId: subscription.id,
                error,
              });
              return false;
            }
          })
        );

        if (results.some(Boolean)) {
          const { error } = await supabase
            .from("staff_push_delivery_receipts")
            .upsert(
              { event_id: event.id, user_id: userId, outcome: "delivered" },
              { onConflict: "event_id,user_id", ignoreDuplicates: true }
            );

          if (error) throw error;
          processedRecipients.add(receiptKey);
          delivered += 1;
        }
      }

      const fullyProcessed = [...subscriptionsByUser.keys()].every((userId) =>
        processedRecipients.has(`${event.id}:${userId}`)
      );

      if (fullyProcessed) {
        const { error } = await supabase
          .from("staff_push_events")
          .update({ delivered_at: new Date().toISOString() })
          .eq("id", event.id);

        if (error) throw error;
      }
    }

    if (expiredSubscriptionIds.size > 0) {
      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", [...expiredSubscriptionIds]);

      if (error) throw error;
    }

    return jsonResponse(200, {
      ok: true,
      queued: pendingEvents.length,
      delivered,
      suppressed,
      subscriptions: subscriptions.length,
      removedExpiredSubscriptions: expiredSubscriptionIds.size,
    });
  } catch (error) {
    console.error("push-dispatch failed", error);
    return jsonResponse(500, { error: "Unable to dispatch push notifications." });
  }
});
