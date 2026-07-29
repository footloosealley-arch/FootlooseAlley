begin;

revoke all on function public.complete_daily_follow_up(text, text)
  from anon;

revoke all on function public.postpone_daily_follow_up(text, text, date)
  from anon;

grant execute on function public.complete_daily_follow_up(text, text)
  to authenticated;

grant execute on function public.postpone_daily_follow_up(text, text, date)
  to authenticated;

commit;
