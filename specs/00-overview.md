# TheSpeedDating - Project Overview

## What is this?
A feature-driven rebuild of TheSpeedDating, a Jewish speed dating platform operating in the UK and Israel since 2003. Currently a legacy ASP.NET WebForms app being rebuilt as a modern Next.js + Supabase platform.

## Approach
**Feature-first, not code migration.** Each feature is designed for how it should work today, not how the old code implemented it. The legacy database (in local PostgreSQL as `thespeeddating_legacy`) is reference data only.

## Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe |
| Email | SendGrid |
| SMS | Twilio (Phase 2) |
| UI | Tailwind CSS + shadcn/ui |
| Maps | Google Maps API |
| Hosting | Vercel |

## Spec Files
| File | Phase | Description |
|------|-------|-------------|
| `01-foundation.md` | Phase 1 | DB schema, auth, layouts, i18n infra |
| `02-public-pages.md` | Phase 2 | All user-facing pages |
| `03-payments.md` | Phase 3 | Stripe tickets, VIP, refunds, promo codes |
| `04-match-system.md` | Phase 4 | Post-event scoring + mutual matching |
| `05-admin-panel.md` | Phase 5 | Full admin interface |
| `06-email-system.md` | Phase 6 | SendGrid templates + automated triggers |
| `07-content-i18n.md` | Phase 7 | Translations, galleries, blog, content |
| `08-polish-launch.md` | Phase 8 | SEO, GDPR, performance, testing, launch |

## Reference Documents
| File | Description |
|------|-------------|
| `WEBSITE_ANALYSIS.md` | Analysis of current live user-facing site |
| `admin-screenshots/ADMIN_INTERFACE_DOCUMENTATION.md` | Current admin interface documentation |
| `OLD_DATABASE_SCHEMA.md` | Legacy SQL Server schema (55 tables) |

## Key Decisions
- **2 countries** (UK + Israel), config-driven for future expansion
- **Email/password auth only** (no social login)
- **Same app for admin** (Next.js /admin routes, not separate app)
- **No old code reuse** - clean implementation from feature specs
- **Hebrew + English** with RTL support for Israel
- **Domain-based routing** (co.uk → UK, co.il → Israel)
