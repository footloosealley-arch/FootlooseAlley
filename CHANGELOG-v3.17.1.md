# Footloose Alley Studio Manager v3.17.1

## Batch-only daily attendance

- Simplified Daily Attendance to a batch-only workflow.
- Batch mode loads every active student assigned to the selected batch.
- Staff now select only the date, batch, and optional instructor before marking students.
- The selected batch is saved with each new attendance record and used as its reporting session name.
- Existing attendance history, charts, exports, and intelligence follow-ups remain unchanged.
- Existing historical class-based attendance remains unchanged and readable.
- Improved empty-state guidance when a batch has no assigned students.

## Security maintenance

- Added an explicit database permission patch that removes anonymous execution access from the complete and postpone follow-up functions.
- Added the Attendance batch column and a safe unique index for one record per student, date, and batch.
- Authenticated active administrators and receptionists retain access through the existing role checks.
- No attendance, student, follow-up, payment, membership, receipt, intake, or photo records are rewritten by the migration.
