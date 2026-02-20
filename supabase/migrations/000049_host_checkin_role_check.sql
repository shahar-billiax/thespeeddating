-- supabase/migrations/000049_host_checkin_role_check.sql

-- Add role validation to the check-in function to prevent
-- non-host users who were inadvertently added to venue_hosts from calling it
create or replace function host_check_in_attendee(
  p_registration_id integer,
  p_checked_in boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id integer;
  v_venue_id integer;
  v_role text;
begin
  -- Verify caller has host, host_plus, or admin role
  select role into v_role
  from profiles
  where id = auth.uid();

  if v_role is null or v_role not in ('host', 'host_plus', 'admin') then
    raise exception 'Not authorized: insufficient role';
  end if;

  -- Get the event for this registration
  select event_id into v_event_id
  from event_registrations
  where id = p_registration_id;

  if v_event_id is null then
    raise exception 'Registration not found';
  end if;

  -- Get the venue for this event
  select venue_id into v_venue_id
  from events
  where id = v_event_id;

  -- Verify caller is a host for this venue
  if v_venue_id is null or not is_venue_host(v_venue_id) then
    raise exception 'Not authorized: not a host for this venue';
  end if;

  -- Update only checked_in_at
  if p_checked_in then
    update event_registrations
    set checked_in_at = now()
    where id = p_registration_id;
  else
    update event_registrations
    set checked_in_at = null
    where id = p_registration_id;
  end if;
end;
$$;
