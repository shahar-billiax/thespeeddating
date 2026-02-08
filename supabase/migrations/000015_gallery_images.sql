create table gallery_images (
  id serial primary key,
  gallery_id integer not null references galleries(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
