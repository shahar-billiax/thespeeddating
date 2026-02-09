"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getMyEvents() {
  const { supabase, user } = await requireUser();

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(
      `event_id, status, attended,
       events(id, event_date, start_time, event_type, match_submission_open, match_results_released,
              cities(name), venues(name))`
    )
    .eq("user_id", user.id)
    .in("status", ["confirmed", "attended"])
    .order("registered_at", { ascending: false });

  if (!registrations) return [];

  const now = new Date().toISOString().split("T")[0];

  // Only past events
  const pastEvents = registrations.filter(
    (r: any) => r.events?.event_date < now
  );

  // Check which events user has already scored
  const eventIds = pastEvents.map((r: any) => r.events?.id).filter(Boolean);

  const { data: scores } = await supabase
    .from("match_scores")
    .select("event_id")
    .eq("scorer_id", user.id)
    .in("event_id", eventIds.length > 0 ? eventIds : [-1]);

  const scoredEventIds = new Set(scores?.map((s) => s.event_id) ?? []);

  return pastEvents.map((r: any) => {
    const event = r.events;
    let status: "score" | "waiting" | "results";
    if (event.match_results_released) {
      status = "results";
    } else if (scoredEventIds.has(event.id)) {
      status = "waiting";
    } else if (event.match_submission_open) {
      status = "score";
    } else {
      status = "waiting";
    }

    return {
      eventId: event.id,
      date: event.event_date,
      time: event.start_time,
      type: event.event_type,
      city: event.cities?.name,
      venue: event.venues?.name,
      status,
    };
  });
}

export async function getScoreData(eventId: number) {
  const { supabase, user } = await requireUser();

  // Verify user attended this event
  const { data: reg } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .in("status", ["confirmed", "attended"])
    .single();

  if (!reg) return { error: "You did not attend this event" };

  // Check event allows scoring
  const { data: event } = await supabase
    .from("events")
    .select("match_submission_open, event_date")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found" };
  if (!event.match_submission_open)
    return { error: "Score submission is not open for this event" };

  // Check if already submitted
  const { data: existingScores } = await supabase
    .from("match_scores")
    .select("id")
    .eq("event_id", eventId)
    .eq("scorer_id", user.id)
    .limit(1);

  if (existingScores && existingScores.length > 0)
    return { error: "You have already submitted your choices" };

  // Get user profile for gender/preference
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("gender, sexual_preference, privacy_preferences")
    .eq("id", user.id)
    .single();

  if (!myProfile) return { error: "Profile not found" };

  // Get other participants
  const { data: otherRegs } = await supabase
    .from("event_registrations")
    .select("user_id, profiles(id, first_name, gender)")
    .eq("event_id", eventId)
    .in("status", ["confirmed", "attended"])
    .neq("user_id", user.id);

  // Filter by gender preference
  let candidates = (otherRegs ?? []).filter((r: any) => {
    const otherGender = r.profiles?.gender;
    if (myProfile.sexual_preference === "both") return true;
    if (myProfile.sexual_preference === "men") return otherGender === "male";
    if (myProfile.sexual_preference === "women") return otherGender === "female";
    // Default: opposite gender
    return otherGender !== myProfile.gender;
  });

  const defaults = (myProfile.privacy_preferences as any) ?? {};

  return {
    participants: candidates.map((c: any) => ({
      id: c.profiles?.id,
      firstName: c.profiles?.first_name,
    })),
    defaults: {
      shareEmail: defaults.share_email ?? true,
      sharePhone: defaults.share_phone ?? false,
      shareWhatsapp: defaults.share_whatsapp ?? false,
      shareInstagram: defaults.share_instagram ?? false,
      shareFacebook: defaults.share_facebook ?? false,
    },
  };
}

export async function submitScores(
  eventId: number,
  scores: {
    scoredId: string;
    choice: "date" | "friend" | "no";
    shareEmail: boolean;
    sharePhone: boolean;
    shareWhatsapp: boolean;
    shareInstagram: boolean;
    shareFacebook: boolean;
  }[]
) {
  const { supabase, user } = await requireUser();

  // Verify not already submitted
  const { data: existing } = await supabase
    .from("match_scores")
    .select("id")
    .eq("event_id", eventId)
    .eq("scorer_id", user.id)
    .limit(1);

  if (existing && existing.length > 0)
    return { error: "Already submitted" };

  // Insert all scores
  const inserts = scores.map((s) => ({
    event_id: eventId,
    scorer_id: user.id,
    scored_id: s.scoredId,
    choice: s.choice,
    share_email: s.shareEmail,
    share_phone: s.sharePhone,
    share_whatsapp: s.shareWhatsapp,
    share_instagram: s.shareInstagram,
    share_facebook: s.shareFacebook,
  }));

  const { error } = await supabase.from("match_scores").insert(inserts);
  if (error) return { error: error.message };

  // Trigger match computation
  await supabase.rpc("compute_matches", { p_event_id: eventId });

  revalidatePath("/matches");
  return { success: true };
}

export async function getMatchResults(eventId: number) {
  const { supabase, user } = await requireUser();

  // Verify event has results released
  const { data: event } = await supabase
    .from("events")
    .select("match_results_released, event_date, cities(name)")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found" };
  if (!event.match_results_released)
    return { error: "Results are not yet available" };

  // Get matches where this user is involved
  const { data: results } = await supabase
    .from("match_results")
    .select(
      `id, result_type, user_a_id, user_b_id, user_a_shares, user_b_shares`
    )
    .eq("event_id", eventId)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .neq("result_type", "no_match");

  if (!results) return { matches: [], event };

  // Fetch profiles for matched users
  const otherIds = results.map((r) =>
    r.user_a_id === user.id ? r.user_b_id : r.user_a_id
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, email, phone, whatsapp, instagram, facebook")
    .in("id", otherIds.length > 0 ? otherIds : ["none"]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  const matches = results.map((r) => {
    const isUserA = r.user_a_id === user.id;
    const otherId = isUserA ? r.user_b_id : r.user_a_id;
    const otherProfile = profileMap.get(otherId);
    const otherShares = (isUserA ? r.user_b_shares : r.user_a_shares) as any;
    const myShares = (isUserA ? r.user_a_shares : r.user_b_shares) as any;

    return {
      id: r.id,
      type: r.result_type as "mutual_date" | "mutual_friend",
      name: otherProfile?.first_name ?? "Unknown",
      sharedContacts: {
        email: otherShares?.share_email ? otherProfile?.email : null,
        phone: otherShares?.share_phone ? otherProfile?.phone : null,
        whatsapp: otherShares?.share_whatsapp ? otherProfile?.whatsapp : null,
        instagram: otherShares?.share_instagram
          ? otherProfile?.instagram
          : null,
        facebook: otherShares?.share_facebook ? otherProfile?.facebook : null,
      },
    };
  });

  // Check how many people haven't submitted
  const { count: totalParticipants } = await supabase
    .from("event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .in("status", ["confirmed", "attended"]);

  const { count: totalScorers } = await supabase
    .from("match_scores")
    .select("scorer_id", { count: "exact", head: true })
    .eq("event_id", eventId);

  // Deduplicate scorers
  const pending = (totalParticipants ?? 0) - (totalScorers ?? 0);

  return {
    matches,
    event: {
      date: event.event_date,
      city: (event.cities as any)?.name,
    },
    pendingSubmissions: Math.max(0, pending),
  };
}

export async function getVipBonusData(eventId: number) {
  const { supabase, user } = await requireUser();

  // Check VIP status
  const { data: vip } = await supabase
    .from("vip_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);

  if (!vip || vip.length === 0) return null;

  // Get people who chose this user (date or friend)
  const { data: whoChoseMe } = await supabase
    .from("match_scores")
    .select("scorer_id, choice, profiles!match_scores_scorer_id_fkey(first_name)")
    .eq("event_id", eventId)
    .eq("scored_id", user.id)
    .in("choice", ["date", "friend"]);

  return (whoChoseMe ?? []).map((s: any) => ({
    name: s.profiles?.first_name ?? "Someone",
    choice: s.choice,
  }));
}
