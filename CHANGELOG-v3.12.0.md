# Footloose Alley Studio Manager v3.12.0

## Google Forms intake automation

- Added a secure Google Forms and Google Sheets bridge for enquiries and student registrations.
- New enquiry responses are validated, deduplicated, and added to the canonical `Enquiries` table with status `New`.
- Student registration responses enter a protected pending-registration queue instead of creating active students automatically.
- Student registration photos are securely copied from Google Drive into the existing private `student-photos` bucket and attached to the student after approval.
- Added staff-only Approve and Reject actions to the Students page.
- Approved registrations create an inactive student record so staff can assign membership, fees, class, batch, and instructor before activation.
- Added idempotent Google response IDs and normalized Indian-phone duplicate checks.
- Added a Supabase Edge Function webhook with shared-secret authentication; no privileged Supabase key is exposed to Google Forms, Sheets, or the browser.
- Added a reusable Google Apps Script bridge and complete setup instructions for both forms.

## Database

- Added `Student_Intake_Submissions` with staff-only RLS.
- Added transactional approval and rejection RPC functions.
- Added Google Form tracking fields to the canonical `Enquiries` table.
- Migration: `supabase/migrations/20260729_v3120_google_forms_intake.sql`.
