create table event_hosts (
  id serial primary key,
  event_id integer not null references events(id),
  user_id uuid not null references profiles(id),
  unique (event_id, user_id)
);
