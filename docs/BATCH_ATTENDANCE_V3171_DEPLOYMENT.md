# Batch Attendance v3.17.1 deployment

This release adds batch-only attendance and one database migration. It does not require an Edge Function or a new secret.

## After merge

1. Pull `main`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. In the Supabase SQL Editor, run:

   `supabase/migrations/20260729_v3171_batch_attendance.sql`

5. Open **Attendance**.
6. Select a batch and confirm its active students load.
7. Mark a controlled attendance record and save it.
8. Refresh and confirm the saved status reloads for the same date and batch.

The migration adds the Attendance batch column, adds a unique index for safe batch attendance upserts, and records the follow-up permission correction. It does not rewrite existing attendance or follow-up data.
