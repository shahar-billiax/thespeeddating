# Phase 8: Polish & Launch

## Goal
Final quality pass, SEO, GDPR compliance, performance, security, data migration, and testing.

## Mobile Responsiveness
- Test all public pages at 320px, 375px, 414px, 768px, 1024px, 1440px
- Match scoring page: large touch targets, swipeable cards on mobile
- Event listing: single column cards on mobile
- Forms: full-width inputs, large submit buttons
- Navigation: hamburger menu with slide-out drawer

## SEO
- Next.js Metadata API for per-page meta tags
- Open Graph tags for social sharing (event pages especially)
- Structured data: Event schema (schema.org) for Google rich results
- Dynamic sitemap.xml generation (all published events, blog posts, static pages)
- robots.txt
- Canonical URLs per domain

## Performance
- Next.js Image component for all images (auto optimization)
- Server Components by default (minimize client-side JS)
- Lazy load below-the-fold content
- Database indexes:
  - events: (country_id, is_published, event_date), (city_id), (venue_id)
  - event_registrations: (event_id, user_id), (user_id, status)
  - match_scores: (event_id, scorer_id), (event_id, scored_id)
  - profiles: (email), (country_id, city_id), (role)
  - sent_emails: (user_id), (status, date_scheduled)
- Supabase connection pooling via Supavisor
- Edge caching for public pages

## GDPR Compliance
- Cookie consent banner (essential cookies only by default)
- Registration: explicit consent checkboxes
  - "I accept the Terms & Conditions" (required)
  - "I accept the Privacy Policy" (required)
  - "I consent to receive marketing emails" (optional)
- Data portability: admin can export all user data as JSON/CSV
- Right to deletion: admin can fully delete a user and all associated data
  - Cascade: profile, registrations, scores, results, sent_emails, VIP subscriptions
  - Anonymize match_results rather than delete (preserve aggregate data)
- Privacy policy page clearly explaining:
  - What data is collected
  - How it's used
  - Third-party services (Stripe, SendGrid, Google Maps, Google Analytics)
  - Data retention periods
  - How to request data export/deletion

## Security
- Rate limiting on:
  - Login attempts (5 per minute per IP)
  - Registration (3 per hour per IP)
  - Contact form (2 per minute per IP)
  - API endpoints (general rate limit)
- CSRF: built into Next.js server actions
- XSS: React's default escaping + sanitize admin HTML inputs
- SQL injection: Supabase parameterized queries
- Content Security Policy headers
- Secure headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Stripe webhook signature verification
- SendGrid webhook signature verification
- Environment variables never exposed to client

## Production Data Migration
- Script to transform legacy data (from thespeeddating_legacy PostgreSQL) to new Supabase schema
- Members → profiles (map old fields to new, generate Supabase auth users)
- Events → events (map old schema to new)
- Venues → venues (map + geocode addresses)
- EventMatches → match_scores + match_results (transform old format)
- Skip: old ASP.NET tables, email logs (too large, not needed), system tables
- All users get "reset your password" email on first login to new system
- Data cleanup: remove duplicates, normalize phone numbers, validate emails

## Testing Checklist
- [ ] Register new account (UK + Israel)
- [ ] Login / logout / password reset
- [ ] Browse events (filtered by city, age, type)
- [ ] Book event ticket (with Stripe test mode)
- [ ] Book with promo code
- [ ] Join waitlist (when event full)
- [ ] Submit match scores (after event)
- [ ] View match results
- [ ] VIP subscription purchase + benefits
- [ ] Admin: create event, manage participants
- [ ] Admin: create/edit venue
- [ ] Admin: member management with filters
- [ ] Admin: send email, view sent emails
- [ ] Admin: manage promo codes
- [ ] Admin: match controls (open/close/release)
- [ ] Email triggers: booking confirmation, reminders, results
- [ ] Hebrew RTL layout on Israel domain
- [ ] Mobile responsiveness on all public pages
- [ ] GDPR: cookie consent, data export, account deletion

## Launch Checklist
- [ ] Supabase production project created
- [ ] Environment variables set in Vercel
- [ ] Domains configured (DNS + Vercel)
- [ ] SSL certificates active
- [ ] Stripe production mode + webhook endpoints
- [ ] SendGrid production sender verification
- [ ] Google Maps API key restricted to production domains
- [ ] Database migrations applied to production
- [ ] Seed data: countries, cities, email templates
- [ ] Admin user created
- [ ] Legacy data migrated
- [ ] Monitoring: Vercel analytics, error tracking (Sentry recommended)
- [ ] Backup strategy: Supabase automatic backups enabled
