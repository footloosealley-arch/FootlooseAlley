-- Footloose Alley Studio Manager Supabase security hardening.
-- Removes the completed admin-bootstrap path, denies anonymous database access,
-- and makes function execution opt-in instead of relying on PostgreSQL defaults.

begin;

-- The first administrator has already been established. Keeping this bootstrap
-- RPC callable would leave an unnecessary privilege-escalation path if the last
-- administrator profile were ever removed or deactivated.
revoke all on function public.claim_first_admin() from public, anon, authenticated;

create or replace function public.claim_first_admin()
returns text
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select public.current_app_role();
$$;

revoke all on function public.claim_first_admin() from public, anon, authenticated;

-- Anonymous visitors use narrowly scoped Edge Functions. They do not need
-- direct PostgREST access to studio records, sequences, or uploaded objects.
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;
revoke all privileges on all functions in schema public from public, anon;

-- Keep all current and future application tables behind RLS. The service_role
-- used by trusted Edge Functions continues to bypass RLS as designed.
do $$
declare
  table_record record;
begin
  for table_record in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'alter table %I.%I enable row level security',
      table_record.schemaname,
      table_record.tablename
    );
  end loop;
end;
$$;

-- Explicitly preserve only the RPC entry points required by the application.
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.set_staff_role(uuid, text) to authenticated;
grant execute on function public.set_staff_access(uuid, boolean) to authenticated;
grant execute on function public.normalize_intake_phone(text) to authenticated, service_role;
grant execute on function public.approve_student_intake(bigint) to authenticated;
grant execute on function public.reject_student_intake(bigint, text) to authenticated;
grant execute on function public.allow_public_intake(text, integer) to service_role;
grant execute on function public.complete_daily_follow_up(text, text) to authenticated;
grant execute on function public.postpone_daily_follow_up(text, text, date) to authenticated;
grant execute on function public.confirm_event_registration_payment(bigint) to authenticated;
grant execute on function public.cancel_event_registration(bigint, text) to authenticated;
grant execute on function public.refund_event_registration(bigint, numeric, text, text, boolean) to authenticated;
grant execute on function public.create_public_class_booking(bigint, date, text, text, text) to service_role;
grant execute on function public.cancel_public_class_booking(uuid) to service_role;
grant execute on function public.cancel_enquiry_trial_booking(bigint, text) to authenticated;
grant execute on function public.save_instructor_session(bigint, bigint, date, bigint, bigint, text, numeric, text) to authenticated;

-- These fee RPCs pre-date the checked-in migration history on some projects.
-- Preserve them when present without making a clean installation depend on them.
do $$
declare
  fee_function regprocedure;
begin
  for fee_function in
    select procedure_record.oid::regprocedure
    from pg_proc procedure_record
    join pg_namespace namespace_record
      on namespace_record.oid = procedure_record.pronamespace
    where namespace_record.nspname = 'public'
      and procedure_record.proname in (
        'refresh_fee_due_statuses',
        'mark_fee_due_paid',
        'record_fee_due_reminder'
      )
  loop
    execute format('grant execute on function %s to authenticated', fee_function);
  end loop;
end;
$$;

-- Student photos remain private and restricted to active studio staff.
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'student-photos';

drop policy if exists student_photos_read_staff on storage.objects;
create policy student_photos_read_staff
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'student-photos'
    and public.current_app_role() in ('admin', 'receptionist')
  );

-- Secure defaults prevent a future migration from accidentally exposing a new
-- table or function to anonymous/API users.
alter default privileges in schema public revoke execute on functions from public, anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

commit;
