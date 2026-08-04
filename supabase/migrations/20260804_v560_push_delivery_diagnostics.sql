-- Footloose Alley Studio Manager v5.6.0 push delivery diagnostics.
begin;
alter table public.push_subscriptions
  add column if not exists last_seen_at timestamptz,
  add column if not exists last_tested_at timestamptz,
  add column if not exists last_delivery_status text,
  add column if not exists last_delivery_error text;
commit;
