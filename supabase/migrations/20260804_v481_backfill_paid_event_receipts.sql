-- Footloose Alley Studio Manager v4.8.1 receipt recovery for manually paid registrations.

begin;

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
      amount_paid = case
        when coalesce(amount_paid, 0) > 0 then amount_paid
        else coalesce(amount_due, original_amount, 0)
      end,
      payment_verified_at = coalesce(payment_verified_at, now()),
      payment_verified_by = coalesce(payment_verified_by, auth.uid()),
      receipt_number = coalesce(receipt_number, 'FA-EVT-' || lpad(nextval('public.event_receipt_number_seq')::text, 6, '0')),
      updated_at = now()
  where id = p_registration_id
    and payment_reference is not null
    and length(trim(payment_reference)) >= 4
    and (payment_status = 'Pending' or (payment_status = 'Paid' and receipt_number is null))
  returning * into updated_registration;

  if updated_registration.id is null then
    raise exception 'A pending payment or paid registration without a receipt is required.' using errcode = 'P0002';
  end if;
  return updated_registration;
end;
$$;

revoke all on function public.confirm_event_registration_payment(bigint) from public, anon;
grant execute on function public.confirm_event_registration_payment(bigint) to authenticated;

commit;
