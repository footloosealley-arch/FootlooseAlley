-- Footloose Alley Studio Manager: Security Advisor cleanup.
-- Removes obsolete permissive policies left by early development migrations.

begin;

-- The trigger function never needs to resolve objects through a caller-controlled
-- search path.
alter function public.set_enquiries_updated_at()
  set search_path = public, pg_temp;

-- Current application tables already have studio_select/insert/update/delete
-- policies based on current_app_role(). These older policies combine with them
-- using OR and therefore must be removed.
drop policy if exists "Allow attendance insert" on public."Attendance";

drop policy if exists "Allow delete instructors" on public."Instructors";
drop policy if exists "Allow insert instructors" on public."Instructors";
drop policy if exists "Allow update instructors" on public."Instructors";

drop policy if exists "Authenticated users can manage membership events" on public."Membership_Events";

drop policy if exists "Allow insert memberships" on public."Memberships";
drop policy if exists "Allow membership insert" on public."Memberships";
drop policy if exists "Authenticated users can manage memberships" on public."Memberships";

drop policy if exists "Allow everything" on public."Payments";
drop policy if exists "Allow payment insert" on public."Payments";

drop policy if exists "Allow student update" on public."Students";

-- Obsolete lowercase tables are not used by the application. Remove their old
-- anonymous and unrestricted mutation policies while leaving their data intact.
drop policy if exists "Allow anon users to add enquiries" on public.enquiries;
drop policy if exists "Allow anon users to delete enquiries" on public.enquiries;
drop policy if exists "Allow anon users to update enquiries" on public.enquiries;
drop policy if exists "Allow authenticated users to add enquiries" on public.enquiries;
drop policy if exists "Allow authenticated users to delete enquiries" on public.enquiries;
drop policy if exists "Allow authenticated users to update enquiries" on public.enquiries;

drop policy if exists "Allow anonymous users to create fee dues" on public.fee_dues;
drop policy if exists "Allow anonymous users to delete fee dues" on public.fee_dues;
drop policy if exists "Allow anonymous users to update fee dues" on public.fee_dues;
drop policy if exists "Allow authenticated users to create fee dues" on public.fee_dues;
drop policy if exists "Allow authenticated users to delete fee dues" on public.fee_dues;
drop policy if exists "Allow authenticated users to update fee dues" on public.fee_dues;
drop policy if exists "Authenticated users can create fee dues" on public.fee_dues;
drop policy if exists "Authenticated users can delete fee dues" on public.fee_dues;
drop policy if exists "Authenticated users can update fee dues" on public.fee_dues;

drop policy if exists "Allow payment deletes" on public.payments;
drop policy if exists "Allow payment inserts" on public.payments;
drop policy if exists "Allow payment updates" on public.payments;

-- Public buckets serve object URLs without a SELECT policy. Removing this broad
-- policy prevents API clients from listing every event image.
drop policy if exists event_images_public_read on storage.objects;

-- Trigger-only functions must not be callable through PostgREST.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.sync_event_registration_attendees() from public, anon, authenticated;
revoke all on function public.set_enquiries_updated_at() from public, anon, authenticated;

commit;
