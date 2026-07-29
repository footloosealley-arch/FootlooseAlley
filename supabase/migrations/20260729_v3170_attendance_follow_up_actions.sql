begin;

alter table public."Daily_Follow_Up_Actions"
  drop constraint if exists daily_follow_up_type_check;

alter table public."Daily_Follow_Up_Actions"
  add constraint daily_follow_up_type_check
  check (
    reminder_type in (
      'Membership',
      'Fee Due',
      'Enquiry',
      'Trial',
      'Birthday',
      'Attendance'
    )
  );

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
    'Birthday',
    'Attendance'
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
    'Birthday',
    'Attendance'
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
