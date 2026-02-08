# Phase 5: Admin Panel

## Goal
Full admin interface at `/admin/*` for managing all aspects of the platform. Desktop-optimized (no mobile requirement).

## Access Control
- Only users with role=admin can access /admin routes
- Middleware checks role on every request
- Sidebar navigation with all admin sections

## Dashboard (`/admin`)
- Total members count (with trend vs last month)
- Upcoming events count
- Recent registrations (last 7 days)
- Gender balance chart for each upcoming event (male/female bar)
- Revenue summary: this month vs last month
- Quick links to common actions (create event, view recent members)

## Events (`/admin/events`)

### List View
- Table with columns: Date, City, Venue, Type, Age Range, Male/Female counts, Status
- Filters: country, city, date range, event type, status (upcoming/past/cancelled)
- Search by venue name
- Pagination
- "Create Event" button

### Create/Edit Event (`/admin/events/new`, `/admin/events/[id]/edit`)
- Form with all event fields:
  - Country → City (cascading dropdown)
  - Venue (dropdown filtered by city)
  - Date, start time, end time
  - Event type
  - Age range (with gendered toggle)
  - Pricing (with gendered toggle, VIP price)
  - Special offer dropdown + value
  - Capacity: male limit, female limit
  - Description (rich text editor)
  - Dress code
  - Is published toggle
- Save as draft / Publish

### Event Detail (`/admin/events/[id]`)
- Event summary at top
- Tabs:
  - **Participants**: Male and female tables side by side
    - Columns: Name, Email, Phone, Age, Registration date, Payment status, Event status
    - Actions per participant: mark as attended/not attended, refund, remove
    - "Add existing member" search
    - "Print attendee list" button
    - "Export CSV" button
  - **Matches**: Full match matrix and results (see Phase 4 admin controls)
  - **Financials**: Revenue breakdown, payments list, promo code usage
- "Cancel Event" button (with confirmation, triggers cancellation emails)

## Venues (`/admin/venues`)

### List View
- Table: Name, City, Country, Type, Events count, Status
- Filters: country, city, active/archived
- "Create Venue" button

### Create/Edit Venue
- All venue fields including internal fields (contact person, notes)
- Image upload (multiple, reorderable)
- Google Maps integration for address → coordinates

### Venue Detail
- Venue info + images
- Upcoming events at this venue
- Past events at this venue
- Archive/reactivate toggle

## Members (`/admin/members`)

### List View
- Table: Name, Email, Gender, Age, City, Status, Joined date
- Advanced filters:
  - Gender
  - Country, city
  - Age range
  - Relationship status
  - Subscribed to email (yes/no)
  - Subscribed to phone (yes/no)
  - Registered in last X months
  - Attended event in last X months
  - Has admin comments
  - Never attended an event
  - VIP status (active/expired/never)
- Search by name or email
- Pagination
- "Export CSV" of filtered results
- "Add Member" button

### Member Detail (`/admin/members/[id]`)
- Profile info (editable)
- Admin comments section (add/view comments with timestamps)
- Event history: list of all events registered for, with status and payment
- Match history: summary per event
- VIP subscription history
- "Add to Event" button (search events, register manually)
- "Deactivate" button

## Hosts (`/admin/hosts`)
- List of users with role=host or host_plus
- Assign/remove host role
- Toggle host_plus (can see profile + matching data)
- Per-event assignment (via event detail page)
- Host view: limited dashboard showing only their assigned events with attendee lists

## Promotion Codes (`/admin/promotions`)
- List: Code, Type (% or fixed), Value, Valid dates, Event (if specific), Uses, Status
- Create form: code, type, value, date range, event (optional), country, max uses
- Edit / deactivate
- Usage tracking: who used it, when, for which event

## Matchmaking (`/admin/matchmaking`)
- List of matchmaking profile submissions
- Status: pending_review / approved / active / expired
- Review questionnaire answers
- Approve/reject with admin notes
- Track packages: which package, dates arranged, dates remaining

## Email Templates (`/admin/email-templates`)
- List of all template_keys with language versions
- Edit: HTML editor (code view + preview)
- Variables reference panel showing available {{placeholders}} per template
- Test send: preview with sample data, send test to admin email

## Sent Emails (`/admin/emails-sent`)
- Table: Recipient, Subject, Template, Event, Status, Sent date, Opened, Clicked
- Filters: template type, date range, status, city
- Bulk actions: resend failed emails

## Email Queue (`/admin/email-queue`)
- Pending scheduled emails
- Cancel scheduled email
- Manual trigger: "Process queue now"

## Galleries (`/admin/galleries`)
- Create gallery: name, category, country
- Upload images (drag & drop, multiple)
- Reorder via drag & drop
- Delete images
- Categories: events, venues, homepage, success_stories

## Translations (`/admin/translations`)
- Table: string_key, English value, Hebrew value
- Inline editing
- Search by key or value
- "Add new string" button
- Import/export (CSV)

## Blog (`/admin/blog`)
- List of posts: Title, Country, Language, Published status, Date
- Create/edit: title, slug (auto-generated from title), body (rich text), featured image, country, language, publish toggle
