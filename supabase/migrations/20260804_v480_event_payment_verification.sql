-- Footloose Alley Studio Manager v4.8.0 event payment verification and receipts.

begin;

alter table public."Event_Registrations"
  add column if not exists receipt_number text,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_verified_by uuid references auth.users (id) on delete set null;

create sequence if not exists public.event_receipt_number_seq start with 1 increment by 1;
revoke all on sequence public.event_receipt_number_seq from anon;
grant usage, select on sequence public.event_receipt_number_seq to authenticated, service_role;

create unique index if not exists event_registrations_receipt_number_unique_idx
  on public."Event_Registrations" (receipt_number)
  where receipt_number is not null;

create or replace function public.confirm_event_registration_payment(p_registration_id bigint)
returns public."Event_Registrations"
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_registration public."Event_Registrations";
begin
  if public.current_app_role() not in ('admin', 'receptionist') then
    raise exception 'Staff access is required.' using errcode = '42501';
  end if;

  update public."Event_Registrations"
  set payment_status = 'Paid',
      amount_paid = coalesce(amount_due, original_amount, amount_paid, 0),
      payment_verified_at = coalesce(payment_verified_at, now()),
      payment_verified_by = coalesce(payment_verified_by, auth.uid()),
      receipt_number = coalesce(
        receipt_number,
        'FA-EVT-' || lpad(nextval('public.event_receipt_number_seq')::text, 6, '0')
      ),
      updated_at = now()
  where id = p_registration_id
    and payment_status = 'Pending'
    and payment_reference is not null
    and length(trim(payment_reference)) >= 4
  returning * into updated_registration;

  if updated_registration.id is null then
    raise exception 'A pending registration with a UPI reference is required.' using errcode = 'P0002';
  end if;

  return updated_registration;
end;
$$;

revoke all on function public.confirm_event_registration_payment(bigint) from public, anon;
grant execute on function public.confirm_event_registration_payment(bigint) to authenticated;

commit;
