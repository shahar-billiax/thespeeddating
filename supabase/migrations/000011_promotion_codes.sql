create table promotion_codes (
  id serial primary key,
  code text unique not null,
  is_percentage boolean not null default false,
  value numeric(10,2) not null,
  valid_from date,
  valid_until date,
  event_id integer references events(id),
  country_id integer not null references countries(id),
  max_uses integer,
  times_used integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- add FK from event_registrations now that promotion_codes exists
alter table event_registrations
  add constraint event_registrations_promotion_code_id_fkey
  foreign key (promotion_code_id) references promotion_codes(id);
