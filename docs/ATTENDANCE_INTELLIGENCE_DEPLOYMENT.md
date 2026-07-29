# Attendance Intelligence v3.17.0 deployment

This release adds one database migration. It does not require an Edge Function or a new secret.

## After merge

1. Pull `main`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. In the Supabase SQL Editor, run:

   `supabase/migrations/20260729_v3170_attendance_follow_up_actions.sql`

5. Open **Attendance** and verify the new Attendance Follow-ups section.
6. Open **Follow-ups** and verify Attendance is available as a reminder type.

## Safe production checks

- Review counts for Open, Urgent, Away 7+ Days, and Below 50%.
- Open one WhatsApp message using a known valid student phone, but do not send it during testing.
- Postpone one test alert until Tomorrow and confirm it appears under Postponed.
- Complete one test alert and confirm it appears under Completed.
- Confirm the existing daily register, attendance history, charts, calendar, heatmap, and export remain available.

The migration does not delete or rewrite attendance records.
