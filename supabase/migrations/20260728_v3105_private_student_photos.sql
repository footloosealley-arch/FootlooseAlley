-- Footloose Alley Studio Manager v3.10.5: private student photos
begin;

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

commit;
