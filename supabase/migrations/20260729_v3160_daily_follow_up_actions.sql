begin;

create table if not exists public."Daily_Follow_Up_Actions" (
  reminder_key text primary key,
  reminder_type text not null,
  action_status text not null,
  postponed_until date,
  completed_at timestamptz,
  action_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_follow_up_key_not_empty
    check (length(trim(reminder_key)) between 1 and 200),
  constraint daily_follow_up_type_check
    check (
      reminder_type in (
        'Membership',
        'Fee Due',
        'Enquiry',
        'Trial',
        'Birthday'
      )
    ),
  constraint daily_follow_up_status_check
    check (action_status in ('Completed', 'Postponed')),
  constraint daily_follow_up_postpone_date_check
    check (
      (action_status = 'Postponed' and postponed_until is not null)
      or (action_status = 'Completed' and postponed_until is null)
    )
);

create index if not exists daily_follow_up_status_date_idx
  on public."Daily_Follow_Up_Actions" (action_status, postponed_until);

alter table public."Daily_Follow_Up_Actions" enable row level security;

drop policy if exists daily_follow_up_select_staff
  on public."Daily_Follow_Up_Actions";
create policy daily_follow_up_select_staff
  on public."Daily_Follow_Up_Actions"
  for select
  to authenticated
  using (public.current_app_role() in ('admin', 'receptionist'));

revoke all on table public."Daily_Follow_Up_Actions" from anon;
revoke all on table public."Daily_Follow_Up_Actions" from authenticated;
grant select on table public."Daily_Follow_Up_Actions" to authenticated;

create or replace function public.complete_daily_follow_up(
  target_reminder_key text,
  target_reminder_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_app_role() not in ('admin', 'receptionist') then
    raise exception 'Only active studio staff can complete follow-ups.';
  end if;

  if length(trim(coalesce(target_reminder_key, ''))) not between 1 and 200 then
    raise exception 'Invalid reminder key.';
  end if;

  if target_reminder_type not in (
    'Membership',
    'Fee Due',
    'Enquiry',
    'Trial',
    'Birthday'
  ) then
    raise exception 'Invalid reminder type.';
  end if;

  insert into public."Daily_Follow_Up_Actions" (
    reminder_key,
    reminder_type,
    action_status,
    postponed_until,
    completed_at,
    action_by,
    updated_at
  )
  values (
    trim(target_reminder_key),
    target_reminder_type,
    'Completed',
    null,
    now(),
    auth.uid(),
    now()
  )
  on conflict (reminder_key) do update
  set
    reminder_type = excluded.reminder_type,
    action_status = 'Completed',
    postponed_until = null,
    completed_at = now(),
    action_by = auth.uid(),
    updated_at = now();
end;
$$;

create or replace function public.postpone_daily_follow_up(
  target_reminder_key text,
  target_reminder_type text,
  target_postponed_until date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_app_role() not in ('admin', 'receptionist') then
    raise exception 'Only active studio staff can postpone follow-ups.';
  end if;

  if length(trim(coalesce(target_reminder_key, ''))) not between 1 and 200 then
    raise exception 'Invalid reminder key.';
  end if;

  if target_reminder_type not in (
    'Membership',
    'Fee Due',
    'Enquiry',
    'Trial',
    'Birthday'
  ) then
    raise exception 'Invalid reminder type.';
  end if;

  if target_postponed_until is null or target_postponed_until <= current_date then
    raise exception 'Postponed date must be after today.';
  end if;

  insert into public."Daily_Follow_Up_Actions" (
    reminder_key,
    reminder_type,
    action_status,
    postponed_until,
    completed_at,
    action_by,
    updated_at
  )
  values (
    trim(target_reminder_key),
    target_reminder_type,
    'Postponed',
    target_postponed_until,
    null,
    auth.uid(),
    now()
  )
  on conflict (reminder_key) do update
  set
    reminder_type = excluded.reminder_type,
    action_status = 'Postponed',
    postponed_until = excluded.postponed_until,
    completed_at = null,
    action_by = auth.uid(),
    updated_at = now();
end;
$$;

revoke all on function public.complete_daily_follow_up(text, text) from public;
grant execute on function public.complete_daily_follow_up(text, text)
  to authenticated;

revoke all on function public.postpone_daily_follow_up(text, text, date) from public;
grant execute on function public.postpone_daily_follow_up(text, text, date)
  to authenticated;

commit;
