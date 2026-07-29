# Google Forms Intake Setup

Footloose Alley v3.12.0 supports two secure Google Form automations:

1. **Enquiry Form** responses create a `New` record in the Enquiries page.
2. **Student Registration Form** responses create a `Pending` registration for staff approval on the Students page.

Google Sheets remains a response log. Supabase is the official application database.

## Security model

- The Google Form and Sheet never contain a Supabase service-role key.
- Google Apps Script stores one shared webhook secret in Script Properties.
- The Supabase Edge Function validates that secret before accepting a request.
- The Supabase service-role key stays inside the managed Edge Function environment.
- Student records are not created until an authenticated admin or receptionist approves the pending registration.
- Repeated Google deliveries use the same response ID and do not create duplicate rows.

## 1. Apply the database migration

Run this file in the Supabase SQL Editor:

`supabase/migrations/20260729_v3120_google_forms_intake.sql`

Do not paste PowerShell commands into the SQL Editor.

## 2. Deploy and configure the Edge Function

Run these commands in PowerShell from the repository folder:

```powershell
npx supabase@latest login
npx supabase@latest link --project-ref lumyahppbjaxiltizoqe
npx supabase@latest functions deploy google-intake-webhook --no-verify-jwt
```

Generate a long random secret in PowerShell:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$webhookSecret = [Convert]::ToBase64String($bytes)
$webhookSecret
```

Copy the generated value somewhere private, and then store it in Supabase:

```powershell
npx supabase@latest secrets set GOOGLE_INTAKE_WEBHOOK_SECRET="$webhookSecret"
```

The webhook URL is:

```text
https://lumyahppbjaxiltizoqe.supabase.co/functions/v1/google-intake-webhook
```

Never paste the webhook secret into a form question, response cell, GitHub file, or chat.

## 3. Create the Enquiry Form

Use these exact question titles:

| Question | Type | Required |
| --- | --- | --- |
| Full Name | Short answer | Yes |
| Phone Number | Short answer | Yes |
| Email | Short answer | No |
| Gender | Multiple choice | No |
| Age | Short answer | No |
| Program Interested In | Dropdown | Yes |
| Message | Paragraph | No |

Gender choices:

- Male
- Female
- Other
- Prefer not to say

Link the form to a Google Sheet using **Responses → Link to Sheets**.

## 4. Connect the Enquiry Form

From the Enquiry Form:

1. Open **More (⋮) → Script editor**.
2. Replace `Code.gs` with `integrations/google-forms/Code.gs`.
3. Open **Project Settings → Script Properties**.
4. Add:

| Property | Value |
| --- | --- |
| `INTAKE_KIND` | `enquiry` |
| `WEBHOOK_URL` | The Edge Function URL above |
| `WEBHOOK_SECRET` | The private generated secret |

5. Select `installFootlooseIntakeTrigger` and click **Run** once.
6. Approve Google's requested permissions.

Submit one real test response. It should appear on the Enquiries page with status `New` after Refresh.

## 5. Create the Student Registration Form

Use these exact question titles:

| Question | Type | Required |
| --- | --- | --- |
| Full Name | Short answer | Yes |
| Phone Number | Short answer | Yes |
| Email | Short answer | No |
| Date of Birth | Date | No |
| Gender | Multiple choice | No |
| Program Interested In | Dropdown | Yes |
| Address | Paragraph | No |
| Emergency Contact | Short answer | No |
| Student Photo | File upload | Yes |
| Medical Notes | Paragraph | No |
| Preferred Batch | Short answer | No |
| WhatsApp Consent | Multiple choice | Yes |
| Additional Notes | Paragraph | No |

WhatsApp Consent choices:

- Yes
- No

Configure **Student Photo** to accept:

- Images only
- Maximum 1 file
- Maximum file size 5 MB

Google requires respondents to sign in to a Google account when a Form contains a file-upload question. The uploaded image is first stored in the Form owner's Google Drive. Apps Script then securely copies it into Footloose Alley's private `student-photos` Supabase bucket. The Google Drive copy remains available with the Form responses.

Link this form to its own Google Sheet.

## 6. Connect the Student Registration Form

Repeat the Apps Script steps from the second Google Form, but use:

| Property | Value |
| --- | --- |
| `INTAKE_KIND` | `student` |
| `WEBHOOK_URL` | The same Edge Function URL |
| `WEBHOOK_SECRET` | The same private generated secret |

Submit one test registration. It should appear in **Students → Pending Google registrations**.

Approve the registration to create an inactive student record. Then use Edit Student to assign membership, fees, class, batch, and instructor before activating the student.

## Troubleshooting

- Apps Script failures appear under **Apps Script → Executions**.
- Installable trigger failures are also emailed to the Google account that created the trigger.
- A `401 Unauthorized` response means the Script Property secret does not match the Supabase secret.
- A validation error usually means a required question title was changed or a phone/date value is invalid.
- If Google retries the same response, the webhook returns success without creating another record.
- If a phone number already belongs to an active enquiry, pending registration, or student, the webhook reports it as a duplicate.
