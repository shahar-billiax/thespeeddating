-- Switch success_stories from country-based to language-based filtering
alter table success_stories add column language_code text not null default 'en';

-- Backfill existing rows: map country_id → country.default_locale
update success_stories s
set language_code = coalesce(c.default_locale, 'en')
from countries c
where c.id = s.country_id;

-- Make country_id optional (no longer the primary filter)
alter table success_stories alter column country_id drop not null;

-- Index for the new primary filter
create index idx_success_stories_language on success_stories(language_code);
