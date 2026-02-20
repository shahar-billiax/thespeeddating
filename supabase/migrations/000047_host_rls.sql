-- supabase/migrations/000047_host_rls.sql

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
