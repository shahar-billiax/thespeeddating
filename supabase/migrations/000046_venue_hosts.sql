-- supabase/migrations/000046_venue_hosts.sql

-- Junction table linking hostesses to venues they manage
create table venue_hosts (
  id serial primary key,
  venue_id integer not null references venues(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (venue_id, user_id)
);

create index idx_venue_hosts_venue on venue_hosts(venue_id);
create index idx_venue_hosts_user on venue_hosts(user_id);

alter table venue_hosts enable row level security;

-- Track attendee check-ins at events
alter table event_registrations
  add column checked_in_at timestamptz;
