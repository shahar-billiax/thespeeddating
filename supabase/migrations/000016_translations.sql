create table translations (
  id serial primary key,
  string_key text not null,
  language_code char(2) not null,
  value text not null,
  updated_at timestamptz not null default now(),
  unique (string_key, language_code)
);
