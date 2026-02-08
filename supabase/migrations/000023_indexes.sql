-- Profiles
create index idx_profiles_country on profiles(country_id);
create index idx_profiles_city on profiles(city_id);
create index idx_profiles_role on profiles(role);
create index idx_profiles_email on profiles(email);

-- Cities
create index idx_cities_country on cities(country_id);

-- Venues
create index idx_venues_country on venues(country_id);
create index idx_venues_city on venues(city_id);

-- Events
create index idx_events_country on events(country_id);
create index idx_events_city on events(city_id);
create index idx_events_venue on events(venue_id);
create index idx_events_date on events(event_date);
create index idx_events_published on events(is_published) where is_published = true;

-- Event registrations
create index idx_event_registrations_event on event_registrations(event_id);
create index idx_event_registrations_user on event_registrations(user_id);
create index idx_event_registrations_status on event_registrations(status);

-- Match scores
create index idx_match_scores_event on match_scores(event_id);
create index idx_match_scores_scorer on match_scores(scorer_id);

-- Match results
create index idx_match_results_event on match_results(event_id);

-- VIP subscriptions
create index idx_vip_subscriptions_user on vip_subscriptions(user_id);
create index idx_vip_subscriptions_status on vip_subscriptions(status);

-- Promotion codes
create index idx_promotion_codes_code on promotion_codes(code);
create index idx_promotion_codes_event on promotion_codes(event_id);

-- Email templates
create index idx_email_templates_key on email_templates(template_key);

-- Sent emails
create index idx_sent_emails_user on sent_emails(user_id);
create index idx_sent_emails_event on sent_emails(event_id);
create index idx_sent_emails_status on sent_emails(status);

-- Translations
create index idx_translations_key on translations(string_key);
create index idx_translations_lang on translations(language_code);

-- Event hosts
create index idx_event_hosts_event on event_hosts(event_id);
create index idx_event_hosts_user on event_hosts(user_id);

-- Blog posts
create index idx_blog_posts_country on blog_posts(country_id);
create index idx_blog_posts_slug on blog_posts(slug);
create index idx_blog_posts_published on blog_posts(is_published) where is_published = true;

-- Galleries
create index idx_galleries_country on galleries(country_id);
create index idx_galleries_category on galleries(category);

-- Matchmaking
create index idx_matchmaking_profiles_user on matchmaking_profiles(user_id);
create index idx_matchmaking_packages_country on matchmaking_packages(country_id);
