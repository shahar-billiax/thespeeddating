# Phase 1: Foundation

## Goal
Project scaffold, database schema, authentication, layouts, and core infrastructure.

## Tech Setup
- Next.js 15 with App Router, TypeScript, Tailwind CSS
- shadcn/ui component library
- Supabase project (PostgreSQL + Auth + Storage)
- Environment configuration for local dev + Vercel deployment

## Database Schema

### countries
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| code | char(2) UNIQUE | gb, il |
| name | text | United Kingdom, Israel |
| currency | char(3) | GBP, ILS |
| domain | text | thespeeddating.co.uk, thespeeddating.co.il |
| default_locale | char(2) | en, he |
| is_active | boolean | default true |

### cities
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| country_id | FK countries | |
| name | text | |
| timezone | text | Europe/London, Asia/Jerusalem |
| is_active | boolean | default true |

### profiles
Extends Supabase auth.users via user_id FK.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK, FK auth.users | |
| first_name | text NOT NULL | |
| last_name | text NOT NULL | |
| email | text NOT NULL | synced from auth |
| phone | text | |
| date_of_birth | date NOT NULL | |
| gender | text NOT NULL | male/female |
| sexual_preference | text | men/women/both |
| relationship_status | text | single/separated/divorced/widowed |
| has_children | boolean | |
| education | text | |
| occupation | text | |
| country_id | FK countries | |
| city_id | FK cities | |
| bio | text | |
| interests | text | |
| avatar_url | text | |
| whatsapp | text | |
| instagram | text | |
| facebook | text | |
| subscribed_email | boolean | default true |
| subscribed_phone | boolean | default false |
| subscribed_sms | boolean | default false |
| privacy_preferences | jsonb | what to share by default |
| role | text | member/host/host_plus/admin |
| admin_comments | text | only visible in admin |
| is_active | boolean | default true |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### venues
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| country_id | FK countries | |
| city_id | FK cities | |
| name | text NOT NULL | |
| address | text | |
| latitude | double precision | |
| longitude | double precision | |
| map_url | text | Google Maps link |
| website | text | |
| phone | text | |
| transport_info | text | public transport directions |
| dress_code | text | |
| description | text | |
| venue_type | text | bar/restaurant/hotel/private_space/other |
| contact_person_name | text | admin-only |
| contact_person_email | text | admin-only |
| contact_person_phone | text | admin-only |
| internal_notes | text | admin-only |
| is_active | boolean | default true |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### venue_images
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| venue_id | FK venues | |
| storage_path | text | Supabase Storage path |
| sort_order | integer | |

### events
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| country_id | FK countries | |
| city_id | FK cities | |
| venue_id | FK venues | |
| event_date | date NOT NULL | |
| start_time | time | |
| end_time | time | |
| enable_gendered_age | boolean | false = same age range for all |
| age_min | integer | |
| age_max | integer | |
| age_min_male | integer | when gendered_age enabled |
| age_max_male | integer | |
| age_min_female | integer | |
| age_max_female | integer | |
| enable_gendered_price | boolean | false = same price for all |
| price | numeric(10,2) | |
| vip_price | numeric(10,2) | discounted price for VIP members |
| price_male | numeric(10,2) | when gendered_price enabled |
| price_female | numeric(10,2) | |
| currency | char(3) | |
| special_offer | text | none/three_for_two/buy_one_get_one_free/bring_a_friend/discount_percentage/discount_nominal/early_bird/last_minute/bundle |
| special_offer_value | numeric(10,2) | percentage or fixed amount |
| event_type | text | jewish_general/jewish_traditional/jewish_divorcees/jewish_single_parents/jewish_conservative/jewish_modern_orthodox/israeli/party/singles/virtual |
| description | text | |
| dress_code | text | |
| limit_male | integer | max male participants |
| limit_female | integer | max female participants |
| match_submission_open | boolean | default true |
| match_results_released | boolean | default false |
| is_cancelled | boolean | default false |
| is_published | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### event_registrations
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| event_id | FK events | |
| user_id | FK profiles | |
| status | text | confirmed/cancelled/waitlisted |
| payment_status | text | pending/paid/failed/refunded |
| amount | numeric(10,2) | price before discount |
| paid_amount | numeric(10,2) | actual amount paid |
| currency | char(3) | |
| stripe_payment_intent_id | text | |
| stripe_checkout_session_id | text | |
| promotion_code_id | FK promotion_codes | nullable |
| ticket_quantity | integer | default 1 |
| guest_details | jsonb | names/emails of additional guests |
| registered_at | timestamptz | |
| UNIQUE | (event_id, user_id) | |

### match_scores
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| event_id | FK events | |
| scorer_id | FK profiles | |
| scored_id | FK profiles | |
| choice | text NOT NULL | date/friend/no |
| share_email | boolean | default false |
| share_phone | boolean | default false |
| share_whatsapp | boolean | default false |
| share_instagram | boolean | default false |
| share_facebook | boolean | default false |
| submitted_at | timestamptz | |
| UNIQUE | (event_id, scorer_id, scored_id) | |

### match_results
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| event_id | FK events | |
| user_a_id | FK profiles | |
| user_b_id | FK profiles | |
| result_type | text | mutual_date/mutual_friend/no_match |
| user_a_shares | jsonb | contact info A agreed to share |
| user_b_shares | jsonb | contact info B agreed to share |
| computed_at | timestamptz | |
| UNIQUE | (event_id, user_a_id, user_b_id) | |

### vip_subscriptions
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | FK profiles | |
| plan_type | text | 1_month/3_month/6_month/12_month |
| price_per_month | numeric(10,2) | |
| currency | char(3) | |
| stripe_subscription_id | text | |
| stripe_customer_id | text | |
| status | text | active/cancelled/expired/past_due |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| cancelled_at | timestamptz | |
| created_at | timestamptz | |

### promotion_codes
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| code | text UNIQUE | |
| is_percentage | boolean | |
| value | numeric(10,2) | |
| valid_from | date | |
| valid_until | date | |
| event_id | FK events | nullable = applies to all |
| country_id | FK countries | |
| max_uses | integer | |
| times_used | integer | default 0 |
| is_active | boolean | default true |
| created_at | timestamptz | |

### email_templates
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| template_key | text | e.g. booking_confirmation |
| language_code | char(2) | en/he |
| country_id | FK countries | |
| subject | text | |
| body_html | text | with {{variable}} placeholders |
| is_active | boolean | default true |
| updated_at | timestamptz | |
| UNIQUE | (template_key, language_code, country_id) | |

### sent_emails
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | FK profiles | |
| email_address | text | |
| recipient_name | text | |
| template_key | text | |
| event_id | FK events | nullable |
| country_id | FK countries | |
| subject | text | |
| status | text | queued/sent/failed |
| sendgrid_message_id | text | |
| date_added | timestamptz | |
| date_scheduled | timestamptz | |
| date_sent | timestamptz | |
| is_read | boolean | default false |
| read_at | timestamptz | |
| link_clicked | boolean | default false |
| clicked_at | timestamptz | |

### galleries
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | text | |
| category | text | events/venues/homepage/success_stories |
| country_id | FK countries | |
| is_active | boolean | default true |
| created_at | timestamptz | |

### gallery_images
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| gallery_id | FK galleries | |
| storage_path | text | |
| caption | text | |
| sort_order | integer | |
| created_at | timestamptz | |

### translations
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| string_key | text | |
| language_code | char(2) | |
| value | text | |
| updated_at | timestamptz | |
| UNIQUE | (string_key, language_code) | |

### event_hosts
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| event_id | FK events | |
| user_id | FK profiles | |
| UNIQUE | (event_id, user_id) | |

### blog_posts
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| title | text | |
| slug | text UNIQUE | |
| body_html | text | |
| featured_image | text | storage path |
| country_id | FK countries | |
| language_code | char(2) | |
| is_published | boolean | default false |
| published_at | timestamptz | |
| created_at | timestamptz | |

### matchmaking_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | FK profiles | |
| questionnaire_data | jsonb | |
| package_type | text | FK to matchmaking_packages conceptually |
| status | text | pending_review/approved/active/expired |
| admin_notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### matchmaking_packages
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | text | |
| duration_months | integer | |
| num_dates | integer | |
| price | numeric(10,2) | |
| currency | char(3) | |
| country_id | FK countries | |
| is_active | boolean | default true |

## RLS Policies
- **Public read**: countries, cities, events (published only), venues (active only), translations, galleries, blog_posts (published only)
- **Own data**: profiles (own), event_registrations (own), match_scores (own), match_results (own), vip_subscriptions (own)
- **Admin**: Full access to all tables
- **Hosts**: Read attendee lists for events they're assigned to (via event_hosts)

## DB Function: compute_matches(event_id)
```
For each pair (A, B) in the event where both have submitted scores:
  - A chose Date + B chose Date → mutual_date
  - A chose Friend + B chose Friend → mutual_friend
  - A chose Date + B chose Friend → mutual_friend
  - A chose Friend + B chose Date → mutual_friend
  - Either chose No → no_match
Insert/update match_results row with shared contact info from both sides.
```

## Authentication
- Email/password only via Supabase Auth
- Email verification required
- Password reset via Supabase magic link
- Session management via Supabase middleware (refresh on each request)

## Layouts
1. **(public)** - Header (logo, nav, auth buttons, country switcher) + Footer
2. **(auth)** - Centered card layout for login/register/reset
3. **admin/** - Sidebar navigation + top bar

## Multi-domain / i18n
- Middleware detects domain → sets country context
- thespeeddating.co.uk → country=gb, locale=en
- thespeeddating.co.il → country=il, locale=he (with English fallback)
- RTL support for Hebrew via `dir="rtl"` on html element
- Translation lookup: `t('key')` → checks translations table → falls back to English

## Seed Data
- 2 countries (UK, Israel)
- Cities: London, Manchester, Leeds, Birmingham, Tel Aviv, Jerusalem, Haifa, Netanya
- 1 admin user
- Sample email templates
