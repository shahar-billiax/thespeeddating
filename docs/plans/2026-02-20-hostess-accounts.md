# Hostess Accounts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dedicated `/host` portal for users with `role = 'host'` or `'host_plus'` that lets hostesses view events at their venues, check in attendees, and print attendee lists.

**Architecture:** A new `(host)` route group at `/host` protected by middleware. A `venue_hosts` junction table links hostesses to venues. A `checked_in_at` timestamp on `event_registrations` tracks check-ins. Server actions in `src/lib/host/actions.ts` scope all queries to the user's assigned venues via RLS.

**Tech Stack:** Next.js App Router (Server Components), Supabase (PostgreSQL + RLS), Tailwind CSS + shadcn/ui, Vitest (unit tests)

**Design doc:** `docs/plans/2026-02-20-hostess-accounts-design.md`

---

## Task 1: Database Migration — `venue_hosts` table and `checked_in_at` field

**Files:**
- Create: `supabase/migrations/000046_venue_hosts.sql`

**Step 1: Write the migration**

```sql
-- supabase/migrations/000046_venue_hosts.sql

-- Junction table linking hostesses to venues they manage
create table venue_hosts (
  id serial primary key,
  venue_id integer not null references venues(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (venue_id, user_id)
);

create index idx_venue_hosts_venue on venue_hosts(venue_id);
create index idx_venue_hosts_user on venue_hosts(user_id);

-- Track attendee check-ins at events
alter table event_registrations
  add column checked_in_at timestamptz;
```

**Step 2: Apply the migration**

```bash
# If using remote Supabase, push migration:
pnpm supabase db push

# Or apply directly if using local:
pnpm db:reset
```

Expected: No errors, `venue_hosts` table exists, `event_registrations` has `checked_in_at` column.

**Step 3: Commit**

```bash
git add supabase/migrations/000046_venue_hosts.sql
git commit -m "feat: add venue_hosts table and checked_in_at field"
```

---

## Task 2: RLS Policies for Host Access

**Files:**
- Create: `supabase/migrations/000047_host_rls.sql`

**Step 1: Write the RLS migration**

```sql
-- supabase/migrations/000047_host_rls.sql

-- Enable RLS on venue_hosts
alter table venue_hosts enable row level security;

-- Admins can manage all venue_hosts assignments
create policy "admin_venue_hosts" on venue_hosts for all
  using (is_admin());

-- Hosts can read their own venue assignments
create policy "host_read_own_venues" on venue_hosts for select
  using (user_id = auth.uid());

-- Helper function: returns true if the current user is a host for the given venue
create or replace function is_venue_host(p_venue_id integer)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from venue_hosts
    where venue_id = p_venue_id
    and user_id = auth.uid()
  );
$$;

-- Hosts can read events at their venues
create policy "host_read_venue_events" on events for select
  using (
    is_admin()
    or (venue_id is not null and is_venue_host(venue_id))
  );

-- Hosts can read full registrations for events at their venues
-- (this supersedes the existing event_hosts_read_registrations policy)
create policy "host_read_venue_registrations" on event_registrations for select
  using (
    is_admin()
    or exists (
      select 1
      from events e
      join venue_hosts vh on vh.venue_id = e.venue_id
      where e.id = event_registrations.event_id
      and vh.user_id = auth.uid()
    )
  );

-- Hosts can update checked_in_at on registrations for their venue events
create policy "host_checkin_registrations" on event_registrations for update
  using (
    exists (
      select 1
      from events e
      join venue_hosts vh on vh.venue_id = e.venue_id
      where e.id = event_registrations.event_id
      and vh.user_id = auth.uid()
    )
  )
  with check (true);
```

**Step 2: Apply the migration**

```bash
pnpm supabase db push
```

Expected: No errors, policies visible in Supabase dashboard.

**Step 3: Commit**

```bash
git add supabase/migrations/000047_host_rls.sql
git commit -m "feat: add RLS policies for host venue access"
```

---

## Task 3: Regenerate TypeScript Types

**Files:**
- Modify: `src/types/database.ts` (auto-generated)

**Step 1: Regenerate types**

```bash
pnpm db:gen-types
```

Expected: `src/types/database.ts` now includes `venue_hosts` table type and `checked_in_at` field on `event_registrations`.

**Step 2: Verify**

Open `src/types/database.ts` and confirm:
- `venue_hosts` appears under `Tables`
- `event_registrations` row type has `checked_in_at: string | null`

**Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "chore: regenerate types with venue_hosts and checked_in_at"
```

---

## Task 4: Host Server Actions

**Files:**
- Create: `src/lib/host/actions.ts`
- Create: `tests/unit/host-actions.test.ts`

**Step 1: Write failing tests**

```typescript
// tests/unit/host-actions.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`); }),
}));

import { createClient } from "@/lib/supabase/server";
import { getHostVenues, getHostEvents } from "@/lib/host/actions";

function makeMockSupabase(userData: any, profileData: any, queryData: any) {
  const from = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: profileData, error: null }),
    order: vi.fn().mockReturnThis(),
    then: vi.fn(),
  }));

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: userData } }),
    },
    from,
  };
}

describe("requireHost", () => {
  it("redirects to /login when no user", async () => {
    const mockSupabase = makeMockSupabase(null, null, null);
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    await expect(getHostVenues()).rejects.toThrow("REDIRECT:/login");
  });

  it("redirects to / when user has member role", async () => {
    const mockSupabase = makeMockSupabase(
      { id: "user-1" },
      { role: "member" },
      null
    );
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    await expect(getHostVenues()).rejects.toThrow("REDIRECT:/");
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test tests/unit/host-actions.test.ts
```

Expected: FAIL — `getHostVenues` not found.

**Step 3: Write the implementation**

```typescript
// src/lib/host/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function requireHost() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const allowedRoles = ["host", "host_plus", "admin"];
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect("/");
  }

  return { supabase, user };
}

export async function getHostVenues() {
  const { supabase, user } = await requireHost();

  const { data, error } = await supabase
    .from("venue_hosts")
    .select(
      `
      venue_id,
      venues (
        id,
        name,
        address,
        city_id,
        transport_info,
        dress_code,
        phone,
        website,
        cities ( name )
      )
    `
    )
    .eq("user_id", user.id)
    .order("venue_id");

  if (error) throw error;
  return data ?? [];
}

export async function getHostEvents(upcoming = false) {
  const { supabase, user } = await requireHost();

  // Get the host's venue IDs first
  const { data: venueHosts } = await supabase
    .from("venue_hosts")
    .select("venue_id")
    .eq("user_id", user.id);

  if (!venueHosts || venueHosts.length === 0) return [];

  const venueIds = venueHosts.map((vh) => vh.venue_id);
  const now = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("events")
    .select(
      `
      id,
      event_date,
      start_time,
      end_time,
      event_type,
      is_published,
      is_cancelled,
      venue_id,
      venues ( id, name, address ),
      cities ( name )
    `
    )
    .in("venue_id", venueIds)
    .order("event_date", { ascending: false });

  if (upcoming) {
    query = query.gte("event_date", now);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getHostEventWithAttendees(eventId: number) {
  const { supabase, user } = await requireHost();

  // Verify this event belongs to one of the host's venues
  const { data: venueHosts } = await supabase
    .from("venue_hosts")
    .select("venue_id")
    .eq("user_id", user.id);

  if (!venueHosts || venueHosts.length === 0) redirect("/host");

  const venueIds = venueHosts.map((vh) => vh.venue_id);

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      `
      id,
      event_date,
      start_time,
      end_time,
      event_type,
      dress_code,
      notes,
      venue_id,
      venues ( id, name, address, transport_info, dress_code ),
      cities ( name )
    `
    )
    .eq("id", eventId)
    .in("venue_id", venueIds)
    .single();

  if (eventError || !event) redirect("/host/events");

  const { data: registrations, error: regError } = await supabase
    .from("event_registrations")
    .select(
      `
      id,
      user_id,
      status,
      payment_status,
      checked_in_at,
      created_at,
      profiles (
        id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender
      )
    `
    )
    .eq("event_id", eventId)
    .order("created_at");

  if (regError) throw regError;

  return { event, registrations: registrations ?? [] };
}

export async function checkInAttendee(registrationId: number) {
  const { supabase, user } = await requireHost();

  // Verify the registration belongs to an event at the host's venue
  const { data: registration } = await supabase
    .from("event_registrations")
    .select("id, event_id, checked_in_at")
    .eq("id", registrationId)
    .single();

  if (!registration) throw new Error("Registration not found");

  const { data: venueHosts } = await supabase
    .from("venue_hosts")
    .select("venue_id")
    .eq("user_id", user.id);

  if (!venueHosts || venueHosts.length === 0) {
    throw new Error("Not authorized");
  }

  const venueIds = venueHosts.map((vh) => vh.venue_id);

  const { data: event } = await supabase
    .from("events")
    .select("venue_id")
    .eq("id", registration.event_id)
    .in("venue_id", venueIds)
    .single();

  if (!event) throw new Error("Not authorized");

  const { error } = await supabase
    .from("event_registrations")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", registrationId);

  if (error) throw error;
}

export async function uncheckInAttendee(registrationId: number) {
  const { supabase, user } = await requireHost();

  const { data: registration } = await supabase
    .from("event_registrations")
    .select("id, event_id")
    .eq("id", registrationId)
    .single();

  if (!registration) throw new Error("Registration not found");

  const { data: venueHosts } = await supabase
    .from("venue_hosts")
    .select("venue_id")
    .eq("user_id", user.id);

  if (!venueHosts || venueHosts.length === 0) throw new Error("Not authorized");

  const venueIds = venueHosts.map((vh) => vh.venue_id);

  const { data: event } = await supabase
    .from("events")
    .select("venue_id")
    .eq("id", registration.event_id)
    .in("venue_id", venueIds)
    .single();

  if (!event) throw new Error("Not authorized");

  const { error } = await supabase
    .from("event_registrations")
    .update({ checked_in_at: null })
    .eq("id", registrationId);

  if (error) throw error;
}
```

**Step 4: Run tests**

```bash
pnpm test tests/unit/host-actions.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/host/actions.ts tests/unit/host-actions.test.ts
git commit -m "feat: add host server actions with requireHost guard"
```

---

## Task 5: Middleware Protection for `/host` Routes

**Files:**
- Modify: `src/middleware.ts`

**Step 1: Read the current middleware**

Open `src/middleware.ts` and find the admin protection block (around line 100). It looks like:

```typescript
// 5. Admin protection
if (request.nextUrl.pathname.startsWith("/admin")) {
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
```

**Step 2: Add host protection after the admin block**

Add this block immediately after the admin protection block:

```typescript
// 6. Host portal protection
if (request.nextUrl.pathname.startsWith("/host")) {
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const hostRoles = ["host", "host_plus", "admin"];
  if (!profile || !hostRoles.includes(profile.role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
```

**Step 3: Verify the matcher includes `/host`**

At the bottom of `src/middleware.ts`, ensure the `config.matcher` includes `/host`:

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

The catch-all matcher already covers `/host` routes — no change needed if this pattern is present.

**Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: protect /host routes for host/host_plus/admin roles"
```

---

## Task 6: Host Layout

**Files:**
- Create: `src/app/(host)/layout.tsx`

**Step 1: Write the layout**

```typescript
// src/app/(host)/layout.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-lg text-gray-900">
            Host Portal
          </span>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/host"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/host/events"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Events
            </Link>
            <Link
              href="/host/venues"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Venues
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            {profile?.first_name} {profile?.last_name}
          </span>
          <Link href="/" className="hover:text-gray-900">
            Back to site
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(host)/layout.tsx
git commit -m "feat: add host portal layout"
```

---

## Task 7: Host Dashboard Page

**Files:**
- Create: `src/app/(host)/host/page.tsx`

**Step 1: Write the page**

```typescript
// src/app/(host)/host/page.tsx
import Link from "next/link";
import { getHostEvents, getHostVenues } from "@/lib/host/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HostDashboardPage() {
  const [upcomingEvents, venues] = await Promise.all([
    getHostEvents(true),
    getHostVenues(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Your upcoming events across {venues.length} venue
          {venues.length !== 1 ? "s" : ""}
        </p>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No upcoming events at your venues.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event: any) => (
            <Link key={event.id} href={`/host/events/${event.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    {event.event_type}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {event.venues?.name} · {(event.cities as any)?.name}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(event.event_date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {event.start_time && (
                    <p className="text-sm text-gray-500">{event.start_time}</p>
                  )}
                  <div className="mt-3">
                    {event.is_cancelled ? (
                      <Badge variant="destructive">Cancelled</Badge>
                    ) : event.is_published ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(host)/host/page.tsx
git commit -m "feat: add host dashboard page"
```

---

## Task 8: Host Events List Page

**Files:**
- Create: `src/app/(host)/host/events/page.tsx`

**Step 1: Write the page**

```typescript
// src/app/(host)/host/events/page.tsx
import Link from "next/link";
import { getHostEvents } from "@/lib/host/actions";
import { Badge } from "@/components/ui/badge";

export default async function HostEventsPage() {
  const events = await getHostEvents();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Events</h1>

      {events.length === 0 ? (
        <p className="text-gray-500">No events found at your venues.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Event
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Venue
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event: any) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(event.event_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">{event.event_type}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {event.venues?.name}
                  </td>
                  <td className="px-4 py-3">
                    {event.is_cancelled ? (
                      <Badge variant="destructive">Cancelled</Badge>
                    ) : event.is_published ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/host/events/${event.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View attendees
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(host)/host/events/page.tsx
git commit -m "feat: add host events list page"
```

---

## Task 9: Event Detail + Attendee List + Check-in

This is the core page. It needs a Server Component for data fetching and a Client Component for the interactive check-in button.

**Files:**
- Create: `src/app/(host)/host/events/[id]/page.tsx`
- Create: `src/app/(host)/host/events/[id]/attendee-row.tsx`

**Step 1: Write the check-in client component**

```typescript
// src/app/(host)/host/events/[id]/attendee-row.tsx
"use client";

import { useState, useTransition } from "react";
import { checkInAttendee, uncheckInAttendee } from "@/lib/host/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AttendeeRowProps {
  registration: {
    id: number;
    checked_in_at: string | null;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      phone: string | null;
      date_of_birth: string | null;
      gender: string | null;
    } | null;
    status: string | null;
    payment_status: string | null;
    created_at: string;
  };
}

function calculateAge(dob: string | null): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const today = new Date();
  const age =
    today.getFullYear() -
    birth.getFullYear() -
    (today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      ? 1
      : 0);
  return String(age);
}

export function AttendeeRow({ registration }: AttendeeRowProps) {
  const [checkedIn, setCheckedIn] = useState(!!registration.checked_in_at);
  const [isPending, startTransition] = useTransition();
  const p = registration.profiles;

  function handleToggle() {
    startTransition(async () => {
      if (checkedIn) {
        await uncheckInAttendee(registration.id);
        setCheckedIn(false);
      } else {
        await checkInAttendee(registration.id);
        setCheckedIn(true);
      }
    });
  }

  return (
    <tr className={checkedIn ? "bg-green-50" : "hover:bg-gray-50"}>
      <td className="px-4 py-3">
        <span className="font-medium">
          {p?.first_name} {p?.last_name}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">{calculateAge(p?.date_of_birth ?? null)}</td>
      <td className="px-4 py-3 text-gray-600 capitalize">{p?.gender ?? "—"}</td>
      <td className="px-4 py-3 text-gray-600">{p?.email ?? "—"}</td>
      <td className="px-4 py-3 text-gray-600">{p?.phone ?? "—"}</td>
      <td className="px-4 py-3">
        <Badge variant={registration.payment_status === "paid" ? "default" : "secondary"}>
          {registration.payment_status ?? "unknown"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Button
          size="sm"
          variant={checkedIn ? "outline" : "default"}
          onClick={handleToggle}
          disabled={isPending}
          className={checkedIn ? "text-green-700 border-green-300" : ""}
        >
          {isPending ? "..." : checkedIn ? "✓ Checked in" : "Check in"}
        </Button>
      </td>
    </tr>
  );
}
```

**Step 2: Write the event detail page**

```typescript
// src/app/(host)/host/events/[id]/page.tsx
import { notFound } from "next/navigation";
import { getHostEventWithAttendees } from "@/lib/host/actions";
import { AttendeeRow } from "./attendee-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HostEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) notFound();

  const { event, registrations } = await getHostEventWithAttendees(eventId);

  const checkedInCount = registrations.filter(
    (r: any) => r.checked_in_at
  ).length;
  const venue = event.venues as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/host/events"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Back to events
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {(event as any).event_type}
          </h1>
          <p className="text-gray-500 mt-1">
            {venue?.name} ·{" "}
            {new Date((event as any).event_date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {(event as any).start_time && ` · ${(event as any).start_time}`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="print:hidden"
        >
          Print list
        </Button>
      </div>

      {/* Venue info */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm print:hidden">
        {venue?.address && (
          <div>
            <span className="font-medium text-gray-700">Address:</span>{" "}
            <span className="text-gray-600">{venue.address}</span>
          </div>
        )}
        {venue?.transport_info && (
          <div>
            <span className="font-medium text-gray-700">Transport:</span>{" "}
            <span className="text-gray-600">{venue.transport_info}</span>
          </div>
        )}
        {(venue?.dress_code || (event as any).dress_code) && (
          <div>
            <span className="font-medium text-gray-700">Dress code:</span>{" "}
            <span className="text-gray-600">
              {(event as any).dress_code ?? venue?.dress_code}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="font-semibold text-gray-900">
            {registrations.length}
          </span>{" "}
          <span className="text-gray-500">registered</span>
        </div>
        <div>
          <span className="font-semibold text-green-700">{checkedInCount}</span>{" "}
          <span className="text-gray-500">checked in</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">
            {registrations.length - checkedInCount}
          </span>{" "}
          <span className="text-gray-500">not yet arrived</span>
        </div>
      </div>

      {/* Attendee table */}
      {registrations.length === 0 ? (
        <p className="text-gray-500">No registrations yet.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Age
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Gender
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Phone
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Payment
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 print:hidden">
                  Check-in
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.map((registration: any) => (
                <AttendeeRow
                  key={registration.id}
                  registration={registration}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/(host)/host/events/[id]/page.tsx src/app/(host)/host/events/[id]/attendee-row.tsx
git commit -m "feat: add event detail page with attendee list and check-in"
```

---

## Task 10: Host Venues Page

**Files:**
- Create: `src/app/(host)/host/venues/page.tsx`

**Step 1: Write the page**

```typescript
// src/app/(host)/host/venues/page.tsx
import { getHostVenues } from "@/lib/host/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HostVenuesPage() {
  const venueHosts = await getHostVenues();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Venues</h1>

      {venueHosts.length === 0 ? (
        <p className="text-gray-500">
          You are not assigned to any venues yet. Contact an administrator.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {venueHosts.map((vh: any) => {
            const v = vh.venues;
            return (
              <Card key={vh.venue_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{v?.name}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {(v?.cities as any)?.name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  {v?.address && (
                    <p>
                      <span className="font-medium text-gray-700">Address:</span>{" "}
                      {v.address}
                    </p>
                  )}
                  {v?.phone && (
                    <p>
                      <span className="font-medium text-gray-700">Phone:</span>{" "}
                      <a href={`tel:${v.phone}`} className="hover:underline">
                        {v.phone}
                      </a>
                    </p>
                  )}
                  {v?.website && (
                    <p>
                      <span className="font-medium text-gray-700">Website:</span>{" "}
                      <a
                        href={v.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {v.website}
                      </a>
                    </p>
                  )}
                  {v?.transport_info && (
                    <p>
                      <span className="font-medium text-gray-700">Getting here:</span>{" "}
                      {v.transport_info}
                    </p>
                  )}
                  {v?.dress_code && (
                    <p>
                      <span className="font-medium text-gray-700">Dress code:</span>{" "}
                      {v.dress_code}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(host)/host/venues/page.tsx
git commit -m "feat: add host venues page"
```

---

## Task 11: Admin — Assign Hostesses to Venues

This adds a "Hostesses" section to the existing venue detail page in the admin panel.

**Files:**
- Modify: `src/app/admin/venues/[id]/page.tsx`
- Create: `src/components/admin/venue-hostesses.tsx`
- Modify: `src/lib/admin/actions.ts`

**Step 1: Add admin actions for venue host management**

Open `src/lib/admin/actions.ts` and add these functions at the end of the file:

```typescript
export async function getVenueHostesses(venueId: number) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("venue_hosts")
    .select(
      `
      id,
      user_id,
      created_at,
      profiles (
        id,
        first_name,
        last_name,
        email,
        role
      )
    `
    )
    .eq("venue_id", venueId)
    .order("created_at");

  if (error) throw error;
  return data ?? [];
}

export async function searchHostUsers(query: string) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, role")
    .in("role", ["host", "host_plus"])
    .or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
    )
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

export async function addVenueHostess(venueId: number, userId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("venue_hosts")
    .insert({ venue_id: venueId, user_id: userId });

  if (error) throw error;
}

export async function removeVenueHostess(venueHostId: number) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("venue_hosts")
    .delete()
    .eq("id", venueHostId);

  if (error) throw error;
}
```

**Step 2: Write the venue hostesses client component**

```typescript
// src/components/admin/venue-hostesses.tsx
"use client";

import { useState, useTransition } from "react";
import {
  searchHostUsers,
  addVenueHostess,
  removeVenueHostess,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VenueHostessesProps {
  venueId: number;
  initialHostesses: Array<{
    id: number;
    user_id: string;
    created_at: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      role: string;
    } | null;
  }>;
}

export function VenueHostesses({
  venueId,
  initialHostesses,
}: VenueHostessesProps) {
  const [hostesses, setHostesses] = useState(initialHostesses);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    startTransition(async () => {
      const results = await searchHostUsers(searchQuery);
      setSearchResults(results);
    });
  }

  function handleAdd(userId: string) {
    startTransition(async () => {
      await addVenueHostess(venueId, userId);
      // Refresh by re-fetching — for simplicity, reload the page
      window.location.reload();
    });
  }

  function handleRemove(venueHostId: number) {
    startTransition(async () => {
      await removeVenueHostess(venueHostId);
      setHostesses((prev) => prev.filter((h) => h.id !== venueHostId));
    });
  }

  const assignedUserIds = new Set(hostesses.map((h) => h.user_id));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Assigned Hostesses</h3>
        {hostesses.length === 0 ? (
          <p className="text-sm text-gray-500">No hostesses assigned yet.</p>
        ) : (
          <ul className="space-y-2">
            {hostesses.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">
                    {h.profiles?.first_name} {h.profiles?.last_name}
                  </span>
                  <span className="text-gray-500 ml-2">{h.profiles?.email}</span>
                  <span className="text-xs text-gray-400 ml-2 capitalize">
                    ({h.profiles?.role})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleRemove(h.id)}
                  disabled={isPending}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Add Hostess</h3>
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" size="sm" disabled={isPending}>
            Search
          </Button>
        </form>

        {searchResults.length > 0 && (
          <ul className="space-y-1">
            {searchResults.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-gray-500 ml-2">{user.email}</span>
                  <span className="text-xs text-gray-400 ml-2 capitalize">
                    ({user.role})
                  </span>
                </div>
                {assignedUserIds.has(user.id) ? (
                  <span className="text-xs text-green-600 font-medium">
                    Already assigned
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(user.id)}
                    disabled={isPending}
                  >
                    Add
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

**Step 3: Add hostesses section to the admin venue detail page**

Open `src/app/admin/venues/[id]/page.tsx`. It currently fetches `venue` and `venueEvents` then renders `<VenueDetailClient>`. Add a hostesses fetch and render the `VenueHostesses` component below the existing content.

Find the existing fetch block and add:

```typescript
// Add this import at the top
import { getVenueHostesses } from "@/lib/admin/actions";
import { VenueHostesses } from "@/components/admin/venue-hostesses";

// In the page function, add to the fetch:
const venueHostesses = await getVenueHostesses(Number(id));

// In the JSX, after <VenueDetailClient .../>:
<div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Hostesses</h2>
  <VenueHostesses venueId={Number(id)} initialHostesses={venueHostesses as any} />
</div>
```

**Step 4: Commit**

```bash
git add src/lib/admin/actions.ts src/components/admin/venue-hostesses.tsx src/app/admin/venues/[id]/page.tsx
git commit -m "feat: add hostess assignment to admin venue detail page"
```

---

## Task 12: Print Styles

Add print-specific CSS so the attendee list prints cleanly.

**Files:**
- Modify: `src/app/globals.css` (or wherever global styles live)

**Step 1: Add print styles**

Open `src/app/globals.css` and add at the end:

```css
@media print {
  /* Hide navigation, buttons, and non-essential UI when printing */
  header,
  .print\:hidden {
    display: none !important;
  }

  body {
    font-size: 11pt;
    color: black;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    border: 1px solid #ccc;
    padding: 4px 8px;
    text-align: left;
  }

  thead {
    background-color: #f0f0f0 !important;
    -webkit-print-color-adjust: exact;
  }
}
```

**Step 2: Make the print button work**

The "Print list" button in the event detail page uses `onClick={() => window.print()}`. Since it's a Server Component, extract just that button into a small client component:

```typescript
// src/app/(host)/host/events/[id]/print-button.tsx
"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.print()}
      className="print:hidden"
    >
      Print list
    </Button>
  );
}
```

Then in the event detail page, replace the Button with `<PrintButton />` and add the import.

**Step 3: Commit**

```bash
git add src/app/globals.css src/app/(host)/host/events/[id]/print-button.tsx src/app/(host)/host/events/[id]/page.tsx
git commit -m "feat: add print styles and print button for attendee list"
```

---

## Task 13: Final Verification

**Step 1: Run lint**

```bash
pnpm lint
```

Expected: No errors.

**Step 2: Run tests**

```bash
pnpm test
```

Expected: All tests pass including the new host-actions tests.

**Step 3: Build check**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

**Step 4: Manual smoke test (dev server)**

```bash
pnpm dev
```

1. Log in as a member → visit `/host` → should redirect to `/`
2. Log in as a host user → visit `/host` → should see dashboard
3. If no venues assigned, dashboard shows empty state
4. Assign a venue to the host via `/admin/venues/[id]` hostesses section
5. Revisit `/host` → events at that venue should appear
6. Click an event → see attendee list → click "Check in" → row turns green
7. Click "Print list" → browser print dialog opens

**Step 5: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "fix: address any issues from smoke testing"
```
