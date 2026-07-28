-- Footloose Alley Studio Manager
-- v3.2.0 Part 1: Trial Operations
-- Run this once in the Supabase SQL Editor before opening /trials.

alter table public."Enquiries"
  add column if not exists trial_status text,
  add column if not exists trial_outcome text,
  add column if not exists trial_notes text;

update public."Enquiries"
set trial_status = 'Scheduled'
where trial_date is not null
  and trial_status is null;

update public."Enquiries"
set trial_outcome = 'Pending'
where trial_date is not null
  and trial_outcome is null;

alter table public."Enquiries"
  drop constraint if exists enquiries_trial_status_check;

alter table public."Enquiries"
  add constraint enquiries_trial_status_check
  check (
    trial_status is null
    or trial_status in (
      'Scheduled',
      'Attended',
      'Missed',
      'Rescheduled',
      'Cancelled'
    )
  );

alter table public."Enquiries"
  drop constraint if exists enquiries_trial_outcome_check;

alter table public."Enquiries"
  add constraint enquiries_trial_outcome_check
  check (
    trial_outcome is null
    or trial_outcome in (
      'Pending',
      'Interested',
      'Joined',
      'Follow-up Required',
      'Not Interested'
    )
  );

create index if not exists enquiries_trial_date_idx
  on public."Enquiries" (trial_date);

create index if not exists enquiries_trial_status_idx
  on public."Enquiries" (trial_status);
