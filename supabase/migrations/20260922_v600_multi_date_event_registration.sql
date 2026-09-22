-- Footloose Alley Studio Manager: multi-date events and multi-date registrations.
-- Adds a reusable schedule to each event and lets one registration select one or more dates.
begin;

alter table public."Events" add column if not exists event_dates date[];
update public."Events" set event_dates = array[event_date] where event_dates is null or cardinality(event_dates) = 0;
alter table public."Events" alter column event_dates set default '{}';
alter table public."Events" alter column event_dates set not null;

alter table public."Event_Registrations" add column if not exists selected_dates date[];
update public."Event_Registrations" set selected_dates = array[(select event_date from public."Events" where "Events".id = "Event_Registrations".event_id)] where selected_dates is null or cardinality(selected_dates) = 0;
alter table public."Event_Registrations" alter column selected_dates set default '{}';
alter table public."Event_Registrations" alter column selected_dates set not null;

create index if not exists events_event_dates_gin_idx on public."Events" using gin (event_dates);
create index if not exists event_registrations_selected_dates_gin_idx on public."Event_Registrations" using gin (selected_dates);

commit;
