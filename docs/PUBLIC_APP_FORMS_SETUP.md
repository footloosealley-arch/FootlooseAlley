# Public App Forms deployment

Version 3.15.0 adds two public, mobile-friendly forms:

- `/forms/enquiry`
- `/forms/student`

They submit to the new `public-intake-webhook` Supabase Edge Function. Google Forms remain available as backups.

## Deployment after merge

1. Apply `supabase/migrations/20260729_v3150_public_app_intake.sql` in the Supabase SQL Editor.
2. From the repository directory, confirm the Supabase CLI is linked to project `lumyahppbjaxiltizoqe`.
3. Deploy the function:

   ```powershell
   npx supabase@latest functions deploy public-intake-webhook --no-verify-jwt
   ```

4. Wait for the Vercel production deployment to finish.

No additional secret is required. Supabase automatically provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the Edge Function.

## Validation

1. Submit one controlled enquiry and confirm it appears in Enquiries.
2. Submit one controlled student registration with a JPG, PNG, or WebP photo under 5 MB.
3. Confirm it appears in the Students page approval queue with a private signed photo preview.
4. Approve it and confirm the inactive student record and private photo path are created.
5. Delete the controlled test records and their test photo after validation.
6. In Settings, verify Open, Copy Link, and WhatsApp share the app form URLs.
