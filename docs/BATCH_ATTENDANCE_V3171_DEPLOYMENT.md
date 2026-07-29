# Batch Attendance v3.17.1 deployment

This release adds batch-only attendance, schedule-aligned form choices, and one database migration. It does not require an Edge Function or a new secret.

## After merge

1. Pull `main`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. In the Supabase SQL Editor, run:

   `supabase/migrations/20260729_v3171_batch_attendance.sql`

5. Open **Attendance**.
6. Confirm Fitness is shown as a course with separate weekday, Saturday, and Sunday timing batches.
7. Confirm each dance course shows its separate schedule choices.
8. Open a controlled student and assign two batch timings, then save.
9. Return to Attendance and confirm the student loads under both selected timings.
10. Open the public enquiry form and confirm multiple courses can be selected.
11. Open the public student registration form and confirm multiple batch timings can be selected.
12. Mark a controlled attendance record and save it.
13. Refresh and confirm the saved status reloads for the same date and batch.

The migration adds the Attendance batch column, adds a unique index for safe batch attendance upserts, and records the follow-up permission correction. It does not rewrite existing attendance or follow-up data. Existing students must have their schedule timings selected once before they appear in a timing-based Attendance register.
