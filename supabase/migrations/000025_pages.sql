-- Pages table for static content management (About, FAQ, Terms, etc.)
create table pages (
  id serial primary key,
  page_key text not null,
  country_id integer not null references countries(id),
  language_code char(2) not null,
  title text not null,
  content_html text not null,
  meta_title text,
  meta_description text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_key, country_id, language_code)
);

-- RLS policies
alter table pages enable row level security;

-- Public can view published pages
create policy "pages_select" on pages
  for select using (is_published = true);

-- Admins can do everything
create policy "admin_pages" on pages
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Indexes
create index idx_pages_key on pages(page_key, country_id, language_code);
create index idx_pages_country on pages(country_id);
create index idx_pages_published on pages(is_published);
