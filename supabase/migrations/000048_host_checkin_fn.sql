-- supabase/migrations/000048_host_checkin_fn.sql

-- Drop the broad UPDATE policy (replaced by SECURITY DEFINER function below)
drop policy if exists "host_checkin_registrations" on event_registrations;

-- Drop the superseded per-event host registrations policy
drop policy if exists "event_hosts_read_registrations" on event_registrations;

-- Re-create is_venue_host with pinned search path to prevent search path injection
create or replace function is_venue_host(p_venue_id integer)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from venue_hosts
    where venue_id = p_venue_id
    and user_id = auth.uid()
  );
$$;

grant execute on function is_venue_host(integer) to authenticated;

-- Restricted check-in function: only allows updating checked_in_at
-- Replaces the broad UPDATE RLS policy to prevent hosts updating other columns
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
begin
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
    raise exception 'Not authorized';
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

grant execute on function host_check_in_attendee(integer, boolean) to authenticated;
