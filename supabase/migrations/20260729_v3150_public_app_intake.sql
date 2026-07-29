begin;

create table if not exists public."Public_Intake_Rate_Limits" (
  client_key text primary key,
  window_started_at timestamp with time zone not null default now(),
  submission_count integer not null default 0,
  updated_at timestamp with time zone not null default now(),
  constraint public_intake_submission_count_nonnegative
    check (submission_count >= 0)
);

alter table public."Public_Intake_Rate_Limits"
  enable row level security;

revoke all on table public."Public_Intake_Rate_Limits"
  from public, anon, authenticated;

grant all on table public."Public_Intake_Rate_Limits"
  to service_role;

create or replace function public.allow_public_intake(
  request_key text,
  max_submissions integer default 8
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  if request_key is null or length(trim(request_key)) < 16 then
    return false;
  end if;

  delete from public."Public_Intake_Rate_Limits"
  where window_started_at < now() - interval '24 hours';

  insert into public."Public_Intake_Rate_Limits" as rate_limit (
    client_key,
    window_started_at,
    submission_count,
    updated_at
  )
  values (
    trim(request_key),
    now(),
    1,
    now()
  )
  on conflict (client_key)
  do update set
    window_started_at = case
      when rate_limit.window_started_at <= now() - interval '1 hour'
        then now()
      else rate_limit.window_started_at
    end,
    submission_count = case
      when rate_limit.window_started_at <= now() - interval '1 hour'
        then 1
      else rate_limit.submission_count + 1
    end,
    updated_at = now()
  returning submission_count <= greatest(max_submissions, 1)
  into allowed;

  return coalesce(allowed, false);
end;
$$;

revoke all on function public.allow_public_intake(text, integer)
  from public, anon, authenticated;

grant execute on function public.allow_public_intake(text, integer)
  to service_role;

commit;
