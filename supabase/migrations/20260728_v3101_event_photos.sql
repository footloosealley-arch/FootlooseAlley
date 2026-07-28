begin;

alter table public."Events"
  add column if not exists image_url text,
  add column if not exists image_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-images',
  'event-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists event_images_public_read on storage.objects;
create policy event_images_public_read
  on storage.objects for select
  to public
  using (bucket_id = 'event-images');

drop policy if exists event_images_staff_insert on storage.objects;
create policy event_images_staff_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and public.current_app_role() in ('admin', 'receptionist')
  );

drop policy if exists event_images_staff_update on storage.objects;
create policy event_images_staff_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'event-images'
    and public.current_app_role() in ('admin', 'receptionist')
  )
  with check (
    bucket_id = 'event-images'
    and public.current_app_role() in ('admin', 'receptionist')
  );

drop policy if exists event_images_staff_delete on storage.objects;
create policy event_images_staff_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'event-images'
    and public.current_app_role() in ('admin', 'receptionist')
  );

commit;
