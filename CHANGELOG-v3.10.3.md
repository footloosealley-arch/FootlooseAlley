# Footloose Alley Studio Manager v3.10.3

## Payment table consolidation

- Consolidated application payment reads, summaries, creation, history, and deletion
  on the canonical `public."Payments"` table.
- Added an idempotent migration that safely copies historical rows from
  `public.payments` without removing either table.
- Updated the canonical payment table's student foreign key to cascade student ID
  updates while restricting deletion of students with payments.
- Added a positive payment amount database constraint when it is not already present.
- Allowed historical payment records without a linked student in the application
  payment type while continuing to require a student when recording a payment.

## Version

- Updated the application and package metadata to v3.10.3.
