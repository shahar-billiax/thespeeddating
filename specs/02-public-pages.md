# Phase 2: Public Pages

## Goal
All user-facing pages, fully responsive (mobile-first), data-driven from Supabase.

## Pages

### Homepage (`/`)
- Hero section with background image/carousel and CTA "Find Your Next Event"
- Upcoming events widget (next 6 events, filterable by city)
- "How It Works" summary (3-step visual: Register → Attend → Match)
- Testimonials / success stories carousel
- Quick links to VIP, About, Contact

### Events Listing (`/events`)
- Server-rendered with filters:
  - City (dropdown from active cities for current country)
  - Age range (slider or min/max inputs)
  - Date range (from/to date pickers)
  - Event type (dropdown: all event types)
- Event cards showing: date, city, venue name, age range, price, spots remaining
- Sort by date (default: soonest first)
- Pagination
- "No events found" state with CTA to check other cities or subscribe to notifications

### Event Detail (`/events/[id]`)
- Event header: date, time, city, event type
- Venue section: name, address, embedded Google Map, transport info, dress code
- Pricing section: regular price, VIP price (if applicable), special offers
- Age range display (gendered if applicable)
- Spots remaining (male/female bars or counts)
- "Book Now" CTA → requires login
  - If logged in + spots available → goes to checkout
  - If logged in + full → "Join Waitlist"
  - If not logged in → redirect to login with return URL
- Description / what to expect

### Register (`/register`)
- Multi-step form (better UX than one long form):
  - Step 1: Email, password (check email not already registered)
  - Step 2: First name, last name, date of birth, gender, sexual preference
  - Step 3: Relationship status, has children, education, occupation
  - Step 4: Country, city, phone
  - Step 5: Optional - bio, interests, photo upload
- Email verification required before full access
- Terms & conditions + privacy policy consent checkboxes (GDPR)
- Marketing consent checkbox (separate from account consent)

### Login (`/login`)
- Email + password
- "Forgot password?" link
- "Don't have an account? Register" link
- Redirect to original destination after login

### Forgot Password (`/forgot-password`)
- Email input → Supabase sends reset link
- Success message: "Check your email"

### Reset Password (`/reset-password`)
- New password + confirm
- Accessed via Supabase magic link token

### Profile (`/profile`)
- Edit all profile fields (same as registration but editable)
- Change password section
- Photo upload / change
- Privacy preferences: default sharing options for matches
- Email/SMS notification preferences
- "Delete my account" option (GDPR)

### My Events (`/my-events`)
- Tabs: Upcoming | Past
- Upcoming: event card with date, venue, status (confirmed/waitlisted)
- Past: event card with match status link ("Submit your choices" / "View results")
- Empty state for new users

### About Us (`/about`)
- Static content page
- Company story, mission
- Admin-editable content (stored in DB or as HTML page)

### How It Works (`/how-it-works`)
- Visual step-by-step guide
- 1. Register → 2. Browse events → 3. Book a ticket → 4. Attend → 5. Submit choices → 6. Get matched

### Success Stories (`/success-stories`)
- Gallery of couple photos with quotes
- Admin-managed via galleries system

### Contact (`/contact`)
- Form: name, email, subject, message
- Sends via SendGrid to admin email
- Shows office address, phone, social media links

### FAQs (`/faqs`)
- Accordion-style Q&A
- Admin-managed content

### Safety Guidelines (`/safety`)
- Static content about safe dating practices
- Admin-editable

### Terms & Conditions (`/terms`)
- Legal text, admin-editable

### Privacy Policy (`/privacy`)
- GDPR-compliant privacy policy
- Cookie policy section
- Data rights explanation

### VIP Membership (`/vip`)
- Benefits explanation
- Pricing table (4 tiers: 1/3/6/12 months)
- Price varies by country (GBP for UK, ILS for Israel)
- "Subscribe" CTA per tier → Stripe Checkout
- Current VIP status display if logged in

### Matchmaking (`/matchmaking`)
- Service description
- Packages and pricing
- Registration form / inquiry form
- Admin reviews and contacts applicant

### Blog (`/blog`)
- Listing page: cards with title, excerpt, featured image, date
- Detail page (`/blog/[slug]`): full article
- Country-specific (UK blog / Israel blog based on domain)

## Multi-domain Behavior
- Domain detection in middleware sets country context
- Events listing shows only events for current country
- Prices shown in local currency
- Content pages can have country-specific versions
- Language toggle on Israel site (Hebrew ↔ English)

## Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hamburger menu on mobile
- Touch-friendly buttons and forms
- Event cards: single column on mobile, grid on desktop
- Match scoring: optimized for thumb interaction on mobile
