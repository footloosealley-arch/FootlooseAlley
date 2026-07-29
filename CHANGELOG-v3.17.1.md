# Footloose Alley Studio Manager v3.17.1

## Batch-first daily attendance

- Added a Batch / Class switch to Daily Attendance.
- Batch is now the default attendance grouping.
- Batch mode loads every active student assigned to the selected batch.
- Class mode remains available as a backup for the existing workflow.
- Session Class, instructor, and session name continue to be saved with attendance for reporting.
- Existing attendance history, charts, exports, and intelligence follow-ups remain unchanged.
- Improved empty-state guidance when a batch or class has no assigned students.

## Security maintenance

- Added an explicit database permission patch that removes anonymous execution access from the complete and postpone follow-up functions.
- Authenticated active administrators and receptionists retain access through the existing role checks.
- No attendance, student, follow-up, payment, membership, receipt, intake, or photo records are rewritten by the migration.
