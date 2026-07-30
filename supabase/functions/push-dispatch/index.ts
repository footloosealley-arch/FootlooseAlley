import { createClient } from "npm:@supabase/supabase-js@2.110.8";
import webpush from "npm:web-push@3.6.7";

type PushEvent = {
  id: number;
  title: string;
  body: string;
  href: string;
  dedupe_key: string;
};

type PushSubscription = {
  id: number;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

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

    const [{ data: events, error: eventsError }, { data: activeProfiles, error: profilesError }] =
      await Promise.all([
        supabase
          .from("staff_push_events")
          .select("id,title,body,href,dedupe_key")
          .is("delivered_at", null)
          .order("created_at", { ascending: true })
          .limit(25),
        supabase
          .from("profiles")
          .select("id")
          .eq("is_active", true)
          .in("role", ["admin", "receptionist"]),
      ]);

    if (eventsError) throw eventsError;
    if (profilesError) throw profilesError;

    const activeUserIds = new Set((activeProfiles ?? []).map((profile) => profile.id));
    const { data: allSubscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("id,user_id,endpoint,p256dh,auth");

    if (subscriptionsError) throw subscriptionsError;

    const subscriptions = ((allSubscriptions ?? []) as PushSubscription[]).filter((subscription) =>
      activeUserIds.has(subscription.user_id)
    );
    const pendingEvents = (events ?? []) as PushEvent[];

    if (pendingEvents.length === 0 || subscriptions.length === 0) {
      return jsonResponse(200, {
        ok: true,
        queued: pendingEvents.length,
        delivered: 0,
        subscriptions: subscriptions.length,
      });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    let delivered = 0;
    const expiredSubscriptionIds = new Set<number>();

    for (const event of pendingEvents) {
      const results = await Promise.all(
        subscriptions.map(async (subscription) => {
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
                title: event.title,
                body: event.body,
                href: event.href,
                tag: event.dedupe_key,
              }),
              { TTL: 60 * 60 }
            );
            return true;
          } catch (error) {
            if (isSubscriptionExpired(error)) expiredSubscriptionIds.add(subscription.id);
            console.error("push delivery failed", { eventId: event.id, subscriptionId: subscription.id, error });
            return false;
          }
        })
      );

      if (results.some(Boolean)) {
        const { error } = await supabase
          .from("staff_push_events")
          .update({ delivered_at: new Date().toISOString() })
          .eq("id", event.id);

        if (error) throw error;
        delivered += 1;
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
      subscriptions: subscriptions.length,
      removedExpiredSubscriptions: expiredSubscriptionIds.size,
    });
  } catch (error) {
    console.error("push-dispatch failed", error);
    return jsonResponse(500, { error: "Unable to dispatch push notifications." });
  }
});
