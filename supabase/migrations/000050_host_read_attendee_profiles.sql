-- Allow hosts to read profiles of attendees registered at their venue's events
create policy "host_read_attendee_profiles" on profiles for select
  using (
    exists (
      select 1
      from event_registrations er
      join events e on e.id = er.event_id
      join venue_hosts vh on vh.venue_id = e.venue_id
      where er.user_id = profiles.id
        and vh.user_id = auth.uid()
    )
  );
