create table galleries (
  id serial primary key,
  name text not null,
  category text not null check (category in ('events', 'venues', 'homepage', 'success_stories')),
  country_id integer not null references countries(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
