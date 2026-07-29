# Footloose Alley Studio Manager v3.17.1

## Batch-only daily attendance

- Simplified Daily Attendance to a batch-only workflow.
- Batch mode loads every active student assigned to the selected batch.
- Staff now select only the date, batch, and optional instructor before marking students.
- Standardized batch choices from the official studio schedule: Fitness, Kids' Weekday Dance Class, Kids' Weekend Dance Class, Adults' Weekend Dance Class, and Adults' Weekend Salsa Class.
- Aerobics, Zumba, Dance Fitness, Steppers, Strengthening & Toning, and other existing fitness-program labels are automatically grouped under Fitness for attendance, so those students do not need to be edited individually.
- Updated the public enquiry form, public student registration form, internal student form, and staff enquiry form to use the same batch/class choices.
- New and edited students, plus converted enquiries, now store the selected batch directly for attendance.
- The selected batch is saved with each new attendance record and used as its reporting session name.
- Existing attendance history, charts, exports, and intelligence follow-ups remain unchanged.
- Existing historical class-based attendance remains unchanged and readable.
- Improved empty-state guidance when a batch has no assigned students.

## Security maintenance

- Added an explicit database permission patch that removes anonymous execution access from the complete and postpone follow-up functions.
- Added the Attendance batch column and a safe unique index for one record per student, date, and batch.
- Authenticated active administrators and receptionists retain access through the existing role checks.
- No attendance, student, follow-up, payment, membership, receipt, intake, or photo records are rewritten by the migration.
