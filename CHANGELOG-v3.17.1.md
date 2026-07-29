# Footloose Alley Studio Manager v3.17.1

## Batch-only daily attendance

- Simplified Daily Attendance to a batch-only workflow.
- Batch mode loads every active student assigned to the selected batch.
- Staff now select only the date, batch, and optional instructor before marking students.
- Separated courses from batch timings: Fitness is the course, while each weekday and weekend time from the official schedule is a separate batch.
- Kept Kids' Weekday Dance, Kids' Weekend Dance, Adults' Weekend Dance, and Adults' Weekend Salsa as separate courses with their own scheduled batches.
- Added multi-batch selection so one student can belong to several Fitness or dance sessions.
- Updated the public enquiry form, public student registration form, internal student form, student profile, student list, and staff enquiry form for the new course/batch structure.
- New and edited students store all selected batches once; Daily Attendance then loads them automatically for each selected timing.
- The selected batch is saved with each new attendance record and used as its reporting session name.
- Existing attendance history, charts, exports, and intelligence follow-ups remain unchanged.
- Existing historical class-based attendance remains unchanged and readable.
- Improved empty-state guidance when a batch has no assigned students. Existing students only need their correct batch timings assigned once.

## Security maintenance

- Added an explicit database permission patch that removes anonymous execution access from the complete and postpone follow-up functions.
- Added the Attendance batch column and a safe unique index for one record per student, date, and batch.
- Authenticated active administrators and receptionists retain access through the existing role checks.
- No attendance, student, follow-up, payment, membership, receipt, intake, or photo records are rewritten by the migration.
