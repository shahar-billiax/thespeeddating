# Phase 7: Content, i18n & Media

## Goal
Multi-language support, gallery management, blog, and content management.

## Translation System

### Architecture
- DB-backed: `translations` table with string_key + language_code + value
- All user-facing text uses `t('key')` helper function
- Server component: async function fetches from DB (cached)
- Client component: translations passed as props or via context

### Fallback Chain
- For Israel site: Try Hebrew → Fall back to English
- For UK site: English only
- Missing key: return the key itself (makes missing translations obvious in dev)

### Admin Management
- Inline editing in admin panel
- Bulk import/export via CSV
- Search by key or value text
- Missing translations report: keys that exist in EN but not in HE

### RTL Support
- HTML dir="rtl" attribute set based on locale
- Tailwind CSS RTL plugin for directional utilities
- Component layouts adapt (sidebar on right, text alignment, etc.)
- Date/number formatting respects locale

## Gallery Management

### Admin Features
- Create galleries with name, category, country
- Categories: events, venues, homepage, success_stories
- Upload multiple images at once (drag & drop)
- Images stored in Supabase Storage
- Auto-generate thumbnails (via Supabase image transformation or Sharp)
- Reorder images via drag & drop
- Delete images (removes from storage)
- Edit captions

### Public Display
- Homepage: featured gallery/carousel
- Success stories: couple photos with testimonials
- Event galleries: post-event photos (linked to event)
- Venue pages: venue photos

## Blog

### Admin
- Create/edit posts: title, auto-slug, rich text body, featured image
- Per-country and per-language
- Draft/publish toggle with publish date
- SEO fields: meta title, meta description

### Public
- `/blog` listing: paginated cards (title, excerpt, featured image, date)
- `/blog/[slug]` detail: full article with featured image
- Country-specific: UK visitors see UK blog, Israel visitors see Israel blog

## Content Pages
Static-ish pages that admin can edit:
- About Us
- How It Works
- FAQs (Q&A pairs)
- Safety Guidelines
- Terms & Conditions
- Privacy Policy

### Implementation Options
1. **Simple**: Store in `html_pages` table (key, country_id, language_code, content_html)
2. **Rich**: Use blog_posts table with a "page" category

Recommendation: Simple approach - admin edits HTML content per page, no need for full CMS.

## Multi-domain Finalization

### Middleware Logic
```
1. Read request hostname
2. Map domain to country:
   - thespeeddating.co.uk → gb
   - thespeeddating.co.il → il
   - localhost → gb (default for dev)
3. Set country in cookie/header for server components
4. Detect Accept-Language for Israel (he/en)
5. Set locale in cookie
```

### Currency Display
- UK: £XX.XX (GBP)
- Israel: ₪XX (ILS)
- Use Intl.NumberFormat for locale-aware formatting

### Date/Time Display
- UK: DD/MM/YYYY, 12-hour time
- Israel: DD/MM/YYYY, 24-hour time
- Use date-fns or Intl.DateTimeFormat with locale
