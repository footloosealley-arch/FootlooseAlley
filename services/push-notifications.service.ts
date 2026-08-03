import { supabase } from "@/lib/supabase";

interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushStatusResponse {
  ok?: boolean;
  configured?: boolean;
  subscribed?: boolean;
  preferences?: PushNotificationPreferences;
  error?: string;
}

export interface PushNotificationPreferences {
  newEnquiriesEnabled: boolean;
  trialChangesEnabled: boolean;
  overdueFollowUpsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}

export interface PushNotificationStatus {
  supported: boolean;
  configured: boolean;
  subscribed: boolean;
  permission: NotificationPermission | "unsupported";
  preferences: PushNotificationPreferences;
}

export const defaultPushNotificationPreferences: PushNotificationPreferences = {
  newEnquiriesEnabled: true,
  trialChangesEnabled: true,
  overdueFollowUpsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: "21:00",
  quietHoursEnd: "08:00",
  timezone: "Asia/Kolkata",
};

function getPublicVapidKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
}

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function toUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const normalized = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const decoded = window.atob(normalized);
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length));

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return bytes;
}

function toPayload(subscription: PushSubscription): PushSubscriptionPayload {
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("The browser returned an incomplete notification subscription.");
  }

  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
}

function isPushWorker(registration: ServiceWorkerRegistration | undefined): boolean {
  const worker = registration?.active ?? registration?.waiting ?? registration?.installing;
  return worker?.scriptURL.endsWith("/push-sw.js") === true;
}

async function waitForActiveWorker(
  registration: ServiceWorkerRegistration
): Promise<ServiceWorkerRegistration> {
  if (registration.active) return registration;

  const worker = registration.installing ?? registration.waiting;
  if (!worker) throw new Error("The notification service worker did not start.");

  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(
      () => reject(new Error("The notification service worker took too long to start.")),
      10_000
    );

    const handleStateChange = () => {
      if (worker.state === "activated") {
        window.clearTimeout(timeoutId);
        worker.removeEventListener("statechange", handleStateChange);
        resolve();
      } else if (worker.state === "redundant") {
        window.clearTimeout(timeoutId);
        worker.removeEventListener("statechange", handleStateChange);
        reject(new Error("The notification service worker could not be activated."));
      }
    };

    worker.addEventListener("statechange", handleStateChange);
    handleStateChange();
  });

  return registration;
}

async function readFunctionError(error: unknown, fallback: string): Promise<never> {
  const context = (error as { context?: Response }).context;

  if (context instanceof Response) {
    try {
      const body = (await context.json()) as PushStatusResponse;
      throw new Error(body.error || fallback);
    } catch (responseError) {
      if (responseError instanceof Error) throw responseError;
      throw new Error(fallback);
    }
  }

  if (error instanceof Error) throw new Error(error.message || fallback);
  throw new Error(fallback);
}

async function callSubscriptionFunction(
  body: Record<string, unknown>
): Promise<PushStatusResponse> {
  const { data, error } = await supabase.functions.invoke<PushStatusResponse>(
    "push-subscription",
    { body }
  );

  if (error) await readFunctionError(error, "Unable to update push notification settings.");
  return data ?? {};
}

function toPreferences(
  value: PushNotificationPreferences | undefined
): PushNotificationPreferences {
  return value ?? defaultPushNotificationPreferences;
}

export const pushNotificationsService = {
  async getStatus(): Promise<PushNotificationStatus> {
    if (!isSupported()) {
      return {
        supported: false,
        configured: false,
        subscribed: false,
        permission: "unsupported",
        preferences: defaultPushNotificationPreferences,
      };
    }

    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = isPushWorker(registration)
      ? await registration?.pushManager.getSubscription()
      : null;
    const response = await callSubscriptionFunction({ action: "status" });

    return {
      supported: true,
      configured: response.configured === true && Boolean(getPublicVapidKey()),
      subscribed: Boolean(subscription) && response.subscribed === true,
      permission: Notification.permission,
      preferences: toPreferences(response.preferences),
    };
  },

  async enable(): Promise<void> {
    if (!isSupported()) {
      throw new Error("This browser does not support secure push notifications.");
    }

    const publicVapidKey = getPublicVapidKey();
    if (!publicVapidKey) {
      throw new Error("Push notifications need configuration before they can be enabled.");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission was not granted. Enable it in your browser settings to continue.");
    }

    let registration = await navigator.serviceWorker.register("/push-sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    await registration.update();
    registration = await waitForActiveWorker(registration);
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toUint8Array(publicVapidKey),
      }));

    const response = await callSubscriptionFunction({
      action: "subscribe",
      subscription: toPayload(subscription),
      userAgent: navigator.userAgent,
    });

    if (response.configured !== true) {
      await subscription.unsubscribe();
      throw new Error("Push notifications need server configuration before they can be enabled.");
    }

    void registration.update();
  },

  async disable(): Promise<void> {
    if (!isSupported()) return;

    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = await registration?.pushManager.getSubscription();

    if (!subscription) return;

    await callSubscriptionFunction({
      action: "unsubscribe",
      endpoint: subscription.endpoint,
    });
    await subscription.unsubscribe();
  },

  async updatePreferences(preferences: PushNotificationPreferences): Promise<PushNotificationPreferences> {
    const response = await callSubscriptionFunction({
      action: "update_preferences",
      preferences,
    });

    return toPreferences(response.preferences);
  },
};
