# Batch Attendance v3.17.1 deployment

This release adds batch-first attendance and one database permission patch. It does not require an Edge Function or a new secret.

## After merge

1. Pull `main`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. In the Supabase SQL Editor, run:

   `supabase/migrations/20260729_v3171_secure_follow_up_permissions.sql`

5. Open **Attendance**.
6. Confirm **Batch** is selected by default.
7. Select a batch and confirm its active students load.
8. Confirm **Class** mode remains available.

The migration only updates function permissions. It does not change attendance or follow-up data.
