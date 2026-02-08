create table cities (
  id serial primary key,
  country_id integer not null references countries(id),
  name text not null,
  timezone text not null,
  is_active boolean not null default true
);
