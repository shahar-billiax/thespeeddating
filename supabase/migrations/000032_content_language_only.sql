-- Switch content tables (pages, blog_posts) from country-based to language-based filtering.
-- Content is determined by language, not region. Pricing/events remain country-based.

-- ── pages ──
-- Make country_id optional
alter table pages alter column country_id drop not null;

-- Replace unique constraint: (page_key, country_id, language_code) → (page_key, language_code)
alter table pages drop constraint pages_page_key_country_id_language_code_key;
alter table pages add constraint pages_page_key_language_code_key unique (page_key, language_code);

-- Drop old composite index and add language-based one
drop index idx_pages_key;
create index idx_pages_key on pages(page_key, language_code);

-- ── blog_posts ──
-- Make country_id optional
alter table blog_posts alter column country_id drop not null;
