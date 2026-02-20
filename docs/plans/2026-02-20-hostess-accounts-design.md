# Hostess Accounts — Design

**Date:** 2026-02-20
**Status:** Approved

## Overview

Implement a dedicated host/hostess portal for users with `role = 'host'` or `role = 'host_plus'`. Hostesses are linked to one or more venues and can view events at those venues, manage attendee check-ins, and print/view full attendee lists.

## Data Model

### New table: `venue_hosts`

```sql
create table venue_hosts (
  id serial primary key,
  venue_id integer not null references venues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (venue_id, user_id)
);
```

A hostess can be linked to multiple venues (multiple rows).

### New field: `checked_in_at` on `event_registrations`

```sql
alter table event_registrations
  add column checked_in_at timestamptz;
```

Null = not checked in. Stamped when a hostess marks someone as arrived.

### RLS Policies

- Hostesses can `SELECT` events where `venue_id` is in their `venue_hosts` entries
- Hostesses can `SELECT` full registration rows (including email/phone) for events at their venues
- Hostesses can `UPDATE` only `checked_in_at` on registrations for their events
- Admins can `INSERT`/`DELETE` on `venue_hosts` to manage assignments
- Users can `SELECT` their own `venue_hosts` rows (to know which venues they manage)

## Route Structure

```
src/app/
├── (host)/
│   ├── layout.tsx              # Host layout with header + simple sidebar
│   └── host/
│       ├── page.tsx            # Dashboard: upcoming events summary
│       ├── events/
│       │   ├── page.tsx        # All events across their venues
│       │   └── [id]/
│       │       └── page.tsx    # Event detail + attendee list + check-in
│       └── venues/
│           └── page.tsx        # Their venue(s) info (read-only)
```

**Middleware:** `/host` routes require `role IN ('host', 'host_plus', 'admin')`.

## Key Screens

### Host Dashboard (`/host`)
- Cards per upcoming event: date, venue name, event name, registered count
- Quick links to each event's attendee page

### Events List (`/host/events`)
- Table of all events (past + upcoming) at their venues
- Columns: date, event name, venue, registered count, checked-in count, status

### Event Detail + Attendees (`/host/events/[id]`)
- Event summary: date, time, venue, dress code
- Attendee table: name, age, gender, email, phone, registration date, checked-in status
- Per-row "Check in" button → stamps `checked_in_at`, shows green tick
- "Print list" button → print-friendly view with full attendee details
- Search/filter by name or gender

### Venues (`/host/venues`)
- Read-only cards per venue: address, transport info, dress code, contact details

### Admin: Venue Hostesses Tab
- New "Hostesses" tab on `/admin/venues/[id]`
- Searchable user picker (filters by host/host_plus role)
- Lists current hostesses with remove button

## Out of Scope

- Hostesses cannot create or edit events
- Hostesses cannot edit venue details
- Hostesses cannot see match scores or results
- `host_plus` has identical access to `host` for now (can be differentiated later)
