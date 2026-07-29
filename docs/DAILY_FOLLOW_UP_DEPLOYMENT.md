# Daily Follow-up Center deployment

Version 3.16.0 adds one database migration and does not require an Edge Function or new secret.

## After the pull request is merged

1. Pull `main` and run:

   ```powershell
   npm run lint
   npm run build
   ```

2. Open the Supabase SQL Editor and run:

   `supabase/migrations/20260729_v3160_daily_follow_up_actions.sql`

3. Confirm the SQL Editor reports success.

4. Open **Follow-ups** from the Studio Manager sidebar.

5. Check:

   - renewal, fee, enquiry, trial, and birthday reminders appear when their live dates are due;
   - **Review in WhatsApp** opens a prepared message without sending it automatically;
   - **Tomorrow** and **1 Week** move a reminder to the Postponed filter;
   - **Complete** moves a reminder to the Completed filter;
   - administrators and receptionists can use the workspace.

No existing record is deleted or rewritten by the migration.
