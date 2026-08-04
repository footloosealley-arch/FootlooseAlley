-- Footloose Alley Studio Manager v5.5.1 safe studio-expense deletion.
begin;
alter table public."Studio_Expenses" enable row level security;
drop policy if exists finance_delete on public."Studio_Expenses";
create policy finance_delete on public."Studio_Expenses"
  for delete to authenticated
  using (public.current_app_role() = 'admin');
grant delete on public."Studio_Expenses" to authenticated;
commit;
