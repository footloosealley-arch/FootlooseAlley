begin;

alter table public."Attendance"
  add column if not exists batch text;

create unique index if not exists attendance_student_date_batch_unique
  on public."Attendance" (student_id, date, batch);

revoke all on function public.complete_daily_follow_up(text, text)
  from anon;

revoke all on function public.postpone_daily_follow_up(text, text, date)
  from anon;

grant execute on function public.complete_daily_follow_up(text, text)
  to authenticated;

grant execute on function public.postpone_daily_follow_up(text, text, date)
  to authenticated;

commit;
