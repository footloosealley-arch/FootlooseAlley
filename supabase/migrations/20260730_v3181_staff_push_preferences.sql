begin;

create table if not exists public.staff_push_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  new_enquiries_enabled boolean not null default true,
  trial_changes_enabled boolean not null default true,
  overdue_follow_ups_enabled boolean not null default true,
  quiet_hours_enabled boolean not null default false,
  quiet_hours_start time not null default '21:00',
  quiet_hours_end time not null default '08:00',
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_push_preferences_quiet_hours_range_check
    check (quiet_hours_start <> quiet_hours_end),
  constraint staff_push_preferences_timezone_shape_check
    check (
      timezone = 'UTC'
      or timezone ~ '^[A-Za-z]+(?:[_+-][A-Za-z]+)*(?:/[A-Za-z0-9_+-]+)+$'
    ),
  constraint staff_push_preferences_timezone_length_check
    check (length(timezone) between 1 and 100)
);

alter table public.staff_push_preferences enable row level security;

revoke all on table public.staff_push_preferences from anon;
revoke all on table public.staff_push_preferences from authenticated;

commit;
