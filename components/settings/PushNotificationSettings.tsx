"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  defaultPushNotificationPreferences,
  pushNotificationsService,
  type PushNotificationPreferences,
  type PushNotificationStatus,
} from "@/services/push-notifications.service";

const timezoneSuggestions = Array.from(
  new Set([
    "Asia/Kolkata",
    "UTC",
    typeof Intl === "undefined"
      ? "Asia/Kolkata"
      : Intl.DateTimeFormat().resolvedOptions().timeZone,
  ])
).filter(Boolean);

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

  function updatePreferences(updates: Partial<PushNotificationPreferences>) {
    setStatus((current) => {
      if (!current) return current;
      return {
        ...current,
        preferences: {
          ...current.preferences,
          ...updates,
        },
      };
    });
  }

  async function savePreferences() {
    if (!status) return;

    setSaving(true);
    setError(null);

    try {
      const preferences = await pushNotificationsService.updatePreferences(status.preferences);
      setStatus((current) => (current ? { ...current, preferences } : current));
      toast.success("Notification preferences saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save notification preferences."
      );
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setSaving(true);
    setError(null);
    try {
      await pushNotificationsService.sendTest();
      toast.success("Test notification sent to this device.");
      await loadStatus();
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Unable to send a test notification.");
    } finally {
      setSaving(false);
    }
  }

  const unsupported = status?.supported === false;
  const needsConfiguration = status?.supported && status.configured === false;
  const permissionDenied = status?.permission === "denied";
  const preferences = status?.preferences ?? defaultPushNotificationPreferences;

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
            <Button onClick={() => void sendTest()} disabled={saving}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send test notification
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

      {status?.subscribed && (
        <div className="mt-4 rounded-xl border bg-muted/30 p-3 text-sm">
          <p className="font-medium">This device subscription</p>
          <p className="mt-1 text-muted-foreground">
            Last checked: {status.diagnostics?.lastSeenAt ? new Date(status.diagnostics.lastSeenAt).toLocaleString() : "Not recorded"}
            {status.diagnostics?.lastTestedAt ? ` · Last tested: ${new Date(status.diagnostics.lastTestedAt).toLocaleString()}` : ""}
          </p>
          {status.diagnostics?.lastDeliveryStatus && <p className="mt-1 text-muted-foreground">Delivery service response: {status.diagnostics.lastDeliveryStatus}</p>}
          {status.diagnostics?.lastDeliveryError && <p className="mt-1 text-red-600">{status.diagnostics.lastDeliveryError}</p>}
          <p className="mt-2 text-xs text-muted-foreground">On Vivo, also allow Chrome notifications, enable background activity, and set battery usage to Unrestricted.</p>
        </div>
      )}

      <div className="mt-6 border-t pt-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Alert controls</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose which generic staff actions can reach this account. All alerts stay enabled by default.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {[
            {
              id: "new-enquiries",
              label: "New enquiries",
              description: "Notify when a new enquiry needs attention.",
              enabled: preferences.newEnquiriesEnabled,
              update: (checked: boolean) => updatePreferences({ newEnquiriesEnabled: checked }),
            },
            {
              id: "trial-changes",
              label: "Trial changes",
              description: "Notify when a trial is requested or rescheduled.",
              enabled: preferences.trialChangesEnabled,
              update: (checked: boolean) => updatePreferences({ trialChangesEnabled: checked }),
            },
            {
              id: "overdue-follow-ups",
              label: "Overdue follow-ups",
              description: "Notify when a follow-up is overdue.",
              enabled: preferences.overdueFollowUpsEnabled,
              update: (checked: boolean) => updatePreferences({ overdueFollowUpsEnabled: checked }),
            },
          ].map((control) => (
            <label
              key={control.id}
              htmlFor={control.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40"
            >
              <input
                id={control.id}
                type="checkbox"
                checked={control.enabled}
                onChange={(event) => control.update(event.target.checked)}
                disabled={loading || saving || !status}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              />
              <span>
                <span className="block text-sm font-medium">{control.label}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {control.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <Label htmlFor="quiet-hours-enabled">Quiet hours</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Hold selected alerts until your quiet period ends. Urgent-looking notification text is never used.
              </p>
            </div>
            <input
              id="quiet-hours-enabled"
              type="checkbox"
              checked={preferences.quietHoursEnabled}
              onChange={(event) => updatePreferences({ quietHoursEnabled: event.target.checked })}
              disabled={loading || saving || !status}
              className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
            />
          </div>

          {preferences.quietHoursEnabled && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="quiet-hours-start">Start</Label>
                <Input
                  id="quiet-hours-start"
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(event) => updatePreferences({ quietHoursStart: event.target.value })}
                  disabled={loading || saving || !status}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quiet-hours-end">End</Label>
                <Input
                  id="quiet-hours-end"
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(event) => updatePreferences({ quietHoursEnd: event.target.value })}
                  disabled={loading || saving || !status}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quiet-hours-timezone">Timezone</Label>
                <Input
                  id="quiet-hours-timezone"
                  list="staff-timezones"
                  value={preferences.timezone}
                  onChange={(event) => updatePreferences({ timezone: event.target.value })}
                  disabled={loading || saving || !status}
                  aria-describedby="quiet-hours-timezone-help"
                />
                <datalist id="staff-timezones">
                  {timezoneSuggestions.map((timezone) => (
                    <option key={timezone} value={timezone} />
                  ))}
                </datalist>
                <p id="quiet-hours-timezone-help" className="text-xs text-muted-foreground">
                  Use an IANA timezone, for example Asia/Kolkata.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => void savePreferences()}
            disabled={loading || saving || !status}
          >
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SlidersHorizontal className="h-4 w-4" />}
            Save alert controls
          </Button>
        </div>
      </div>
    </section>
  );
}
