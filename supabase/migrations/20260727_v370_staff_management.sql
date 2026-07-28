-- Footloose Alley Studio Manager
-- v3.7.0: Staff Management and Account Access
-- Run once in Supabase SQL Editor before using v3.7.0.

begin;

alter table public.profiles
  add column if not exists is_active boolean not null default true;

create index if not exists profiles_role_active_idx
  on public.profiles (role, is_active);

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true;
$$;

create or replace function public.set_staff_access(target_user uuid, active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_app_role() <> 'admin' then
    raise exception 'Only administrators can change staff access.';
  end if;

  if target_user = auth.uid() and active = false then
    raise exception 'Administrators cannot deactivate their own account.';
  end if;

  update public.profiles
  set is_active = active, updated_at = now()
  where id = target_user;
end;
$$;

revoke all on function public.set_staff_access(uuid, boolean) from public;
grant execute on function public.set_staff_access(uuid, boolean) to authenticated;

commit;
