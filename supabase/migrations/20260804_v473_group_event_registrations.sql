-- Footloose Alley Studio Manager v4.7.3 group event registrations.

begin;

alter table public."Event_Registrations"
  add column if not exists group_size integer not null default 1,
  add column if not exists additional_participant_names text[] not null default '{}';

alter table public."Event_Registrations" drop constraint if exists event_registrations_group_size_check;
alter table public."Event_Registrations" add constraint event_registrations_group_size_check check (group_size between 1 and 20);
alter table public."Event_Registrations" drop constraint if exists event_registrations_group_names_check;
alter table public."Event_Registrations" add constraint event_registrations_group_names_check
  check (cardinality(additional_participant_names) = group_size - 1);

commit;
