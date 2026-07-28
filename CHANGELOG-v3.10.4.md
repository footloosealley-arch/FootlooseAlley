# Footloose Alley Studio Manager v3.10.4

## Enquiry table consolidation

- Consolidated application enquiry access on the canonical `public."Enquiries"` table.
- Added an application service adapter so existing consumers continue to use the lowercase `Enquiry` interface and current status labels.
- Added safe bidirectional mappings for `Follow-up`/`Follow Up`, `Trial Scheduled`/`Trial Booked`, and `Not Interested`/`Closed`.
- Added an idempotent migration that extends the canonical table, copies previously unmigrated legacy records without copying IDs, backfills dates, and protects age, gender, and converted-student integrity.
- Added automatic `updated_at` maintenance whenever a canonical enquiry is updated.
- Retained the legacy `public.enquiries` table without deleting, renaming, truncating, or archiving it.
