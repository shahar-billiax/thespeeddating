-- Success stories / testimonials table
create table success_stories (
  id serial primary key,
  couple_names text not null,
  quote text not null,
  year text,
  location text,
  story_type text not null default 'testimonial'
    check (story_type in ('wedding', 'testimonial', 'dating')),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  country_id integer not null references countries(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table success_stories enable row level security;

create policy "success_stories_select" on success_stories
  for select using (is_active = true);

create policy "admin_success_stories" on success_stories
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Indexes
create index idx_success_stories_country on success_stories(country_id);
create index idx_success_stories_active on success_stories(is_active);
create index idx_success_stories_sort on success_stories(sort_order, id);
