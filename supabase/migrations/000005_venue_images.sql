create table venue_images (
  id serial primary key,
  venue_id integer not null references venues(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0
);
