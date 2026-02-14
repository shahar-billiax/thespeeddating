# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TheSpeedDating is a Jewish speed dating platform (UK + Israel, operating since 2003) being rebuilt from legacy ASP.NET WebForms to Next.js + Supabase. This is a **feature-first rebuild**, not a code migration—the legacy database exists only as reference data.

**Tech Stack:**
- Next.js 15 (App Router, TypeScript)
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS + shadcn/ui
- Stripe (payments), SendGrid (email)
- Vitest (unit/integration), Playwright (e2e)

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server with Turbopack

# Build & Deploy
pnpm build                  # Production build
pnpm start                  # Start production server

# Testing
pnpm test                   # Run all unit + integration tests
pnpm test:unit              # Run unit tests only
pnpm test:integration       # Run integration tests only
pnpm test:e2e               # Run Playwright e2e tests
pnpm test:watch             # Watch mode for tests

# Linting
pnpm lint                   # Run ESLint

# Database
pnpm db:reset               # Reset Supabase local DB (runs migrations + seed)
pnpm db:gen-types           # Generate TypeScript types from Supabase schema
pnpm seed:admin             # Seed admin user (scripts/seed-admin.ts)
```

**Running a single test:**
```bash
# Vitest (unit/integration)
pnpm test tests/unit/specific-file.test.ts
pnpm test -t "specific test name"

# Playwright (e2e)
pnpm test:e2e tests/e2e/specific-file.spec.ts
```

## Architecture Overview

### Multi-Country Routing

The app serves **2 countries** (UK + Israel) from a single codebase:

1. **Domain-based detection** (`src/middleware.ts`):
   - `thespeeddating.co.uk` → country=`gb`, locale=`en`
   - `thespeeddating.co.il` → country=`il`, locale=`he`
   - Cookie override available for local dev: `document.cookie = "country=il"`

2. **Middleware responsibilities**:
   - Detect country/locale, set headers (`x-country`, `x-locale`)
   - Refresh Supabase session
   - Protect `/admin` routes (requires `role=admin` in profiles table)

3. **i18n implementation** (`next-intl` + Supabase):
   - `next-intl` configured via `src/i18n/request.ts`
   - Base translations in `src/lib/i18n/messages/{en,he}.json`
   - Supabase `translations` table provides admin-editable DB overrides
   - Merge order: JSON-en → JSON-locale → DB-en → DB-locale (last wins)
   - Hebrew (RTL) support for Israel

### App Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register, reset-password, etc.)
│   ├── (public)/        # Public pages (home, events, profile, matches, etc.)
│   ├── admin/           # Admin panel (protected by middleware)
│   ├── api/             # API routes
│   └── auth/            # Supabase auth callbacks
├── components/
│   ├── auth/            # Auth-related components
│   ├── admin/           # Admin-specific components
│   ├── events/          # Event listing/details
│   ├── matches/         # Match scoring/results
│   ├── layouts/         # Shared layouts (header, footer)
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase/        # Supabase clients (server, client, admin)
│   ├── i18n/            # Base translation JSON files + page fallbacks
│   ├── auth/            # Auth helpers
│   ├── matches/         # Match calculation logic
│   ├── matchmaking/     # Matchmaking system
│   ├── profile/         # Profile utilities
│   └── admin/           # Admin-specific utilities
├── hooks/               # Custom React hooks
└── types/
    └── database.ts      # Auto-generated Supabase types
```

### Supabase Clients

Three client types (`src/lib/supabase/`):

1. **Server** (`server.ts`): For Server Components, Route Handlers
   - Uses cookies for auth
   - Most common client

2. **Client** (`client.ts`): For Client Components
   - Browser-based, uses localStorage

3. **Admin** (`admin.ts`): For admin operations
   - Uses service role key (bypasses RLS)
   - Only use in server contexts with proper auth checks

**Always regenerate types after schema changes:**
```bash
pnpm db:gen-types
```

### Database Schema

24 migrations in `supabase/migrations/`:
- Core tables: `countries`, `cities`, `profiles`, `venues`, `events`, `event_registrations`
- Features: `match_scores`, `match_results`, `vip_subscriptions`, `promotion_codes`
- Content: `blog_posts`, `galleries`, `translations`, `email_templates`
- Security: RLS policies on all tables (migration 21)
- Utilities: Functions + indexes (migrations 22-23)

Key design patterns:
- User profiles extend `auth.users` via FK (`profiles.id` → `auth.users.id`)
- Multi-country: Everything filtered by `country_id` FK
- Roles in `profiles.role`: `member`, `host`, `host_plus`, `admin`
- Admin fields (e.g., `admin_comments`, `internal_notes`) only visible to admins via RLS

### Route Groups

- `(auth)`: Auth-only layout (no header/footer)
- `(public)`: Main site layout (header + footer)
- `admin`: Admin layout (sidebar navigation)

## Key Patterns

### Country Context

Retrieve country from middleware headers in Server Components:
```typescript
import { headers } from "next/headers";

const headerStore = await headers();
const country = headerStore.get("x-country") || "gb";
```

### Translations (`next-intl`)

Uses `next-intl` with Supabase DB overrides. Base translations live in JSON files (`src/lib/i18n/messages/`), admins can override any key via the `/admin/translations` page (stored in Supabase `translations` table).

Server-side:
```typescript
import { getTranslations, getLocale } from "next-intl/server";

const t = await getTranslations();
const locale = await getLocale();
const title = t("events.title");
```

Client-side:
```typescript
"use client";
import { useTranslations, useLocale } from "next-intl";

export function Component() {
  const t = useTranslations();
  const locale = useLocale();
  return <h1>{t("events.title")}</h1>;
}
```

### Database Queries

Filter by country when relevant:
```typescript
const { data } = await supabase
  .from("events")
  .select("*")
  .eq("country_id", countryId)
  .eq("is_active", true);
```

### Admin Authorization

Admin routes are protected by middleware, but always verify in Server Components:
```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  redirect("/login");
}

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (profile?.role !== "admin") {
  redirect("/");
}
```

## Testing Strategy

- **Unit tests** (`tests/unit/`): Pure functions, utilities, lib code
- **Integration tests** (`tests/integration/`): Database interactions, API routes
- **E2E tests** (`tests/e2e/`): Full user flows via Playwright

Test environment configured in `tests/env.ts` (loads `.env.test`).

## Reference Documentation

- `specs/00-overview.md`: Project overview + tech decisions
- `specs/01-foundation.md`: Database schema + auth details
- `specs/02-08-*.md`: Feature specifications for each phase
- `OLD_DATABASE_SCHEMA.md`: Legacy schema (reference only, don't migrate from it)
- `WEBSITE_ANALYSIS.md`: Current live site analysis
- `admin-screenshots/ADMIN_INTERFACE_DOCUMENTATION.md`: Legacy admin interface

## Important Notes

- **No social login**: Email/password auth only (Supabase Auth)
- **Domain routing**: Production uses domain-based country detection; local dev uses cookie override
- **RTL support**: Hebrew text must be properly handled (use `dir="rtl"` when `locale=he`)
- **RLS enabled**: All tables have Row Level Security; use admin client only when necessary
- **Seeded data**: Local DB includes UK/Israel countries, London/Manchester/Tel Aviv/Jerusalem cities, and test users (see `supabase/seed.sql`)
- **Playwright testing**: Do NOT test implementations with Playwright unless explicitly requested by the user. Only use Playwright for testing when asked.
