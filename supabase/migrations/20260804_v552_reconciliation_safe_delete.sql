-- Footloose Alley Studio Manager v5.5.2 safe cash-reconciliation deletion.
begin;
alter table public."Cash_Reconciliations" enable row level security;
drop policy if exists finance_delete on public."Cash_Reconciliations";
create policy finance_delete on public."Cash_Reconciliations"
  for delete to authenticated
  using (public.current_app_role() = 'admin');
grant delete on public."Cash_Reconciliations" to authenticated;
commit;
