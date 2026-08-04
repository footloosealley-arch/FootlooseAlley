-- Footloose Alley Studio Manager v4.7.1 public event registration and UPI intent.

begin;

alter table public."Events"
  add column if not exists public_registration_enabled boolean not null default false,
  add column if not exists payment_upi_id text,
  add column if not exists payment_payee_name text;

alter table public."Event_Registrations"
  add column if not exists email text,
  add column if not exists payment_reference text,
  add column if not exists registration_source text not null default 'Staff';

alter table public."Event_Registrations"
  drop constraint if exists event_registrations_source_check;

alter table public."Event_Registrations"
  add constraint event_registrations_source_check
  check (registration_source in ('Staff', 'Public Link'));

alter table public."Events"
  drop constraint if exists events_payment_upi_id_check;

alter table public."Events"
  add constraint events_payment_upi_id_check
  check (
    payment_upi_id is null
    or payment_upi_id ~ '^[A-Za-z0-9._-]{2,}@[A-Za-z0-9.-]{2,}$'
  );

commit;
