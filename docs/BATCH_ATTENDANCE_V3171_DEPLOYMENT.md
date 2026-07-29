# Batch Attendance v3.17.1 deployment

This release adds batch-only attendance, schedule-aligned form choices, and one database migration. It does not require an Edge Function or a new secret.

## After merge

1. Pull `main`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. In the Supabase SQL Editor, run:

   `supabase/migrations/20260729_v3171_batch_attendance.sql`

5. Open **Attendance**.
6. Confirm these batches are available:
   - Fitness
   - Kids' Weekday Dance Class
   - Kids' Weekend Dance Class
   - Adults' Weekend Dance Class
   - Adults' Weekend Salsa Class
7. Select **Fitness** and confirm existing active Aerobics, Zumba, Dance Fitness, Steppers, and Strengthening & Toning students load without editing their profiles.
8. Open the public enquiry and student registration forms and confirm they show the same five choices.
9. Select another batch and confirm its active students load.
10. Mark a controlled attendance record and save it.
11. Refresh and confirm the saved status reloads for the same date and batch.

The migration adds the Attendance batch column, adds a unique index for safe batch attendance upserts, and records the follow-up permission correction. It does not rewrite existing attendance or follow-up data.
