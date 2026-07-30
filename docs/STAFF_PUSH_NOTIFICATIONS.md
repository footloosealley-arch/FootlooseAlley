# Staff Push Notifications

The Settings page lets an active staff member opt a browser into minimal push notifications. Notifications cover:

- new enquiries;
- new or rescheduled trial requests;
- overdue enquiry follow-ups.

Each notification contains a generic staff action only and opens the relevant in-app route. It never includes a student's or enquirer's name, contact information, payment information, or other sensitive details.

## What is deployed

- `public/push-sw.js` receives and displays browser notifications.
- `push-subscription` is an authenticated Supabase Edge Function that verifies the active staff profile before storing or removing a browser subscription.
- `push-dispatch` is a server-only Supabase Edge Function that delivers queued events using Web Push VAPID credentials.
- `20260730_v3180_staff_push_notifications.sql` creates the private subscription/event tables and queues new enquiries and trial changes. The dispatcher adds overdue follow-up events.

No provider account is required; browser push services are used directly through VAPID. The VAPID private key and dispatcher secret are never sent to the browser.

## Configure

1. Apply `supabase/migrations/20260730_v3180_staff_push_notifications.sql`.
2. Generate a VAPID key pair. For example:

   ```bash
   npx web-push generate-vapid-keys
   ```

3. Configure the Edge Function secrets:

   ```bash
   supabase secrets set VAPID_PUBLIC_KEY=your-public-key
   supabase secrets set VAPID_PRIVATE_KEY=your-private-key
   supabase secrets set VAPID_SUBJECT=mailto:staff@example.com
   supabase secrets set PUSH_DISPATCH_SECRET=generate-a-long-random-secret
   ```

4. Set the same public key in Vercel as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. This is intentionally public and is needed by the browser; never add the VAPID private key or dispatch secret to Vercel or a `NEXT_PUBLIC_*` variable.
5. Deploy both functions:

   ```bash
   supabase functions deploy push-subscription
   supabase functions deploy push-dispatch
   ```

6. Schedule a secure `POST` to `https://<project-ref>.supabase.co/functions/v1/push-dispatch` at least every 15 minutes. Send:

   ```text
   x-push-dispatch-secret: <PUSH_DISPATCH_SECRET>
   ```

   The dispatcher rejects requests without this server-side secret. Use a trusted scheduler (for example, Supabase Cron with the secret held in Supabase Vault). Do not call this endpoint from the browser or expose its secret in a Vercel environment variable.

After deployment, open **Settings → Staff push notifications** in a supported HTTPS browser and select **Enable notifications**. Browser permission remains opt-in per device and can be disabled from the same screen at any time.

## Deployment constraints

Vercel already supplies HTTPS for the PWA and serves `push-sw.js` from the app root. iPhone and iPad users must install the app to the Home Screen before iOS exposes push permission. Until the VAPID settings and dispatcher schedule are configured, the app shows the integration as unavailable and does not claim delivery.
