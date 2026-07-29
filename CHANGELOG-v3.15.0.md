# Footloose Alley Studio Manager v3.15.0

## Public forms built into the app

- Added a public Footloose Alley Enquiry Form at `/forms/enquiry` with branded styling, mobile-friendly fields, server validation, phone normalization, and duplicate protection.
- Added a public Student Registration Form at `/forms/student` with required JPG/PNG/WebP photo upload up to 5 MB.
- Student registrations continue entering the existing staff-only approval queue; approval still creates an inactive student and attaches the private photo path.
- Updated Settings sharing controls so Open, Copy Link, and WhatsApp use the new app forms while retaining the Google Forms as backup links.
- Added a separate public Supabase Edge Function with origin checks, a hidden bot trap, hourly rate limiting, and no exposed service-role or Google webhook secret.
- Preserved the existing Google Forms automation, authentication, RLS, payments, receipts, memberships, and private student-photo behavior.

A SQL migration and deployment of the new `public-intake-webhook` Edge Function are required for this release.
