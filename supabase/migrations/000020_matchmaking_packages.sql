create table matchmaking_packages (
  id serial primary key,
  name text not null,
  duration_months integer not null,
  num_dates integer not null,
  price numeric(10,2) not null,
  currency char(3) not null,
  country_id integer not null references countries(id),
  is_active boolean not null default true
);
