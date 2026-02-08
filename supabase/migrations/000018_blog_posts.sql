create table blog_posts (
  id serial primary key,
  title text not null,
  slug text unique not null,
  body_html text not null,
  featured_image text,
  country_id integer not null references countries(id),
  language_code char(2) not null default 'en',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
