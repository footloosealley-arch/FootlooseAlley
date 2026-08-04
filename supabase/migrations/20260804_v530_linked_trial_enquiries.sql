-- Footloose Alley Studio Manager v5.3.0 linked trial enquiries and cancellations.

begin;

alter table public."Class_Bookings"
  add column if not exists enquiry_id bigint references public."Enquiries" (id) on delete set null,
  add column if not exists cancellation_reason text;

create unique index if not exists class_bookings_enquiry_unique_idx
  on public."Class_Bookings" (enquiry_id) where enquiry_id is not null;

create or replace function public.cancel_enquiry_trial_booking(p_enquiry_id bigint, p_reason text)
returns public."Class_Bookings"
language plpgsql security invoker set search_path=public
as $$
declare booking public."Class_Bookings"; prior_status text; promoted public."Class_Bookings";
begin
  if public.current_app_role() not in ('admin','receptionist') then raise exception 'Staff access is required.' using errcode='42501'; end if;
  if length(trim(coalesce(p_reason,''))) < 3 then raise exception 'Enter a cancellation reason.'; end if;
  select * into booking from public."Class_Bookings" where enquiry_id=p_enquiry_id and status in ('Booked','Waitlisted') for update;
  if booking.id is null then raise exception 'An active trial booking was not found.' using errcode='P0002'; end if;
  prior_status := booking.status;
  update public."Class_Bookings" set status='Cancelled',cancelled_at=now(),cancellation_reason=trim(p_reason),updated_at=now() where id=booking.id returning * into booking;
  update public."Enquiries" set trial_status='Cancelled',trial_notes=concat_ws(E'\n',nullif(trial_notes,''),'Cancellation: '||trim(p_reason)),updated_at=now() where id=p_enquiry_id;
  if prior_status='Booked' then
    select * into promoted from public."Class_Bookings" where class_id=booking.class_id and class_date=booking.class_date and status='Waitlisted' order by created_at,id limit 1 for update skip locked;
    if promoted.id is not null then
      update public."Class_Bookings" set status='Booked',updated_at=now() where id=promoted.id;
      if promoted.enquiry_id is not null then update public."Enquiries" set "Status"='Trial Booked',trial_status='Scheduled',updated_at=now() where id=promoted.enquiry_id; end if;
    end if;
  end if;
  return booking;
end;
$$;

revoke all on function public.cancel_enquiry_trial_booking(bigint,text) from public,anon;
grant execute on function public.cancel_enquiry_trial_booking(bigint,text) to authenticated;

commit;
