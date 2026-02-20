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
    .order("event_date", { ascending: upcoming });

  if (upcoming) {
    query = query.gte("event_date", now);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getHostEventWithAttendees(eventId: number) {
  const { supabase, user } = await requireHost();

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

  if (eventError) {
    if (eventError.code === "PGRST116") redirect("/host/events");
    throw eventError;
  }
  if (!event) redirect("/host/events");

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
  const { supabase } = await requireHost();

  const { error } = await supabase.rpc("host_check_in_attendee", {
    p_registration_id: registrationId,
    p_checked_in: true,
  });

  if (error) throw error;
}

export async function uncheckInAttendee(registrationId: number) {
  const { supabase } = await requireHost();

  const { error } = await supabase.rpc("host_check_in_attendee", {
    p_registration_id: registrationId,
    p_checked_in: false,
  });

  if (error) throw error;
}
