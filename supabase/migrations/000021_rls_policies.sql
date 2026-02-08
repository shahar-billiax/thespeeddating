-- Helper function: check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- Enable RLS on all tables
alter table countries enable row level security;
alter table cities enable row level security;
alter table profiles enable row level security;
alter table venues enable row level security;
alter table venue_images enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table match_scores enable row level security;
alter table match_results enable row level security;
alter table vip_subscriptions enable row level security;
alter table promotion_codes enable row level security;
alter table email_templates enable row level security;
alter table sent_emails enable row level security;
alter table galleries enable row level security;
alter table gallery_images enable row level security;
alter table translations enable row level security;
alter table event_hosts enable row level security;
alter table blog_posts enable row level security;
alter table matchmaking_profiles enable row level security;
alter table matchmaking_packages enable row level security;

-- PUBLIC READ: countries
create policy "countries_select" on countries for select using (true);

-- PUBLIC READ: cities
create policy "cities_select" on cities for select using (true);

-- PUBLIC READ: translations
create policy "translations_select" on translations for select using (true);

-- PUBLIC READ: published events
create policy "events_select_published" on events for select using (is_published = true and is_cancelled = false);

-- PUBLIC READ: active venues
create policy "venues_select_active" on venues for select using (is_active = true);

-- PUBLIC READ: venue_images (via active venue)
create policy "venue_images_select" on venue_images for select
  using (exists (select 1 from venues where venues.id = venue_images.venue_id and venues.is_active = true));

-- PUBLIC READ: active galleries
create policy "galleries_select" on galleries for select using (is_active = true);

-- PUBLIC READ: gallery_images (via active gallery)
create policy "gallery_images_select" on gallery_images for select
  using (exists (select 1 from galleries where galleries.id = gallery_images.gallery_id and galleries.is_active = true));

-- PUBLIC READ: published blog posts
create policy "blog_posts_select_published" on blog_posts for select using (is_published = true);

-- PUBLIC READ: active matchmaking packages
create policy "matchmaking_packages_select" on matchmaking_packages for select using (is_active = true);

-- OWN DATA: profiles
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- OWN DATA: event_registrations
create policy "event_registrations_select_own" on event_registrations for select using (auth.uid() = user_id);
create policy "event_registrations_insert_own" on event_registrations for insert with check (auth.uid() = user_id);

-- OWN DATA: match_scores
create policy "match_scores_select_own" on match_scores for select using (auth.uid() = scorer_id);
create policy "match_scores_insert_own" on match_scores for insert with check (auth.uid() = scorer_id);
create policy "match_scores_update_own" on match_scores for update using (auth.uid() = scorer_id);

-- OWN DATA: match_results (can see results where they are a participant)
create policy "match_results_select_own" on match_results for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- OWN DATA: vip_subscriptions
create policy "vip_subscriptions_select_own" on vip_subscriptions for select using (auth.uid() = user_id);

-- OWN DATA: matchmaking_profiles
create policy "matchmaking_profiles_select_own" on matchmaking_profiles for select using (auth.uid() = user_id);
create policy "matchmaking_profiles_insert_own" on matchmaking_profiles for insert with check (auth.uid() = user_id);
create policy "matchmaking_profiles_update_own" on matchmaking_profiles for update using (auth.uid() = user_id);

-- LOCKED (admin-only via service role): email_templates, sent_emails, promotion_codes, event_hosts
-- No public/user policies — only accessible via service role (admin client)

-- ADMIN: full access to all tables
create policy "admin_countries" on countries for all using (is_admin());
create policy "admin_cities" on cities for all using (is_admin());
create policy "admin_profiles" on profiles for all using (is_admin());
create policy "admin_venues" on venues for all using (is_admin());
create policy "admin_venue_images" on venue_images for all using (is_admin());
create policy "admin_events" on events for all using (is_admin());
create policy "admin_event_registrations" on event_registrations for all using (is_admin());
create policy "admin_match_scores" on match_scores for all using (is_admin());
create policy "admin_match_results" on match_results for all using (is_admin());
create policy "admin_vip_subscriptions" on vip_subscriptions for all using (is_admin());
create policy "admin_promotion_codes" on promotion_codes for all using (is_admin());
create policy "admin_email_templates" on email_templates for all using (is_admin());
create policy "admin_sent_emails" on sent_emails for all using (is_admin());
create policy "admin_galleries" on galleries for all using (is_admin());
create policy "admin_gallery_images" on gallery_images for all using (is_admin());
create policy "admin_translations" on translations for all using (is_admin());
create policy "admin_event_hosts" on event_hosts for all using (is_admin());
create policy "admin_blog_posts" on blog_posts for all using (is_admin());
create policy "admin_matchmaking_profiles" on matchmaking_profiles for all using (is_admin());
create policy "admin_matchmaking_packages" on matchmaking_packages for all using (is_admin());

-- HOSTS: read attendees for their events
create policy "event_hosts_read_registrations" on event_registrations for select
  using (exists (
    select 1 from event_hosts
    where event_hosts.event_id = event_registrations.event_id
    and event_hosts.user_id = auth.uid()
  ));
