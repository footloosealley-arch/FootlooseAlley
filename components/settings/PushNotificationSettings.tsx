"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  pushNotificationsService,
  type PushNotificationStatus,
} from "@/services/push-notifications.service";

export default function PushNotificationSettings() {
  const [status, setStatus] = useState<PushNotificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setStatus(await pushNotificationsService.getStatus());
    } catch (loadError) {
      setStatus(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load push notification settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadStatus(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadStatus]);

  async function enable() {
    setSaving(true);
    setError(null);

    try {
      await pushNotificationsService.enable();
      toast.success("Push notifications enabled for this browser.");
      await loadStatus();
    } catch (enableError) {
      setError(
        enableError instanceof Error
          ? enableError.message
          : "Unable to enable push notifications."
      );
    } finally {
      setSaving(false);
    }
  }

  async function disable() {
    setSaving(true);
    setError(null);

    try {
      await pushNotificationsService.disable();
      toast.success("Push notifications disabled for this browser.");
      await loadStatus();
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : "Unable to disable push notifications."
      );
    } finally {
      setSaving(false);
    }
  }

  const unsupported = status?.supported === false;
  const needsConfiguration = status?.supported && status.configured === false;
  const permissionDenied = status?.permission === "denied";

  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Staff push notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get minimal, time-sensitive staff alerts for enquiries, trials, and overdue follow-ups.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => void loadStatus()} disabled={loading || saving}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Alert className="mt-5">
        <ShieldCheck />
        <AlertTitle>Opt-in and private by design</AlertTitle>
        <AlertDescription>
          Notifications contain only a generic staff action and link back into the app. You can disable them for this browser at any time.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Push notifications unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && unsupported && (
        <Alert className="mt-4">
          <AlertTitle>Browser support is required</AlertTitle>
          <AlertDescription>
            Use a supported browser over HTTPS. On iPhone and iPad, install the app to the Home Screen before enabling push notifications.
          </AlertDescription>
        </Alert>
      )}

      {!loading && needsConfiguration && (
        <Alert className="mt-4">
          <AlertTitle>Push delivery needs configuration</AlertTitle>
          <AlertDescription>
            Add the VAPID and dispatch secrets described in the push notification setup guide. No notifications will be delivered until then.
          </AlertDescription>
        </Alert>
      )}

      {!loading && permissionDenied && (
        <Alert className="mt-4">
          <AlertTitle>Permission is blocked</AlertTitle>
          <AlertDescription>
            Allow notifications for this site in your browser settings, then refresh this page.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Checking this browser...
          </span>
        ) : status?.subscribed ? (
          <>
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              Enabled on this browser
            </span>
            <Button variant="outline" onClick={() => void disable()} disabled={saving}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
              Disable notifications
            </Button>
          </>
        ) : (
          <>
            <span className="rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground">
              Not enabled
            </span>
            <Button
              onClick={() => void enable()}
              disabled={saving || !status || unsupported || needsConfiguration || permissionDenied}
            >
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              Enable notifications
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
