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

// ─── Event Listing ───────────────────────────────────────────

export async function getMyEvents() {
  const { supabase, user } = await requireUser();

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(
      `event_id, status, attended,
       events(id, event_date, start_time, event_type,
              match_submission_open, match_results_released,
              match_submission_deadline, match_submission_locked,
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

  // Check which events user has scored and whether they are drafts
  const eventIds = pastEvents.map((r: any) => r.events?.id).filter(Boolean);

  const { data: scores } = await supabase
    .from("match_scores")
    .select("event_id, is_draft")
    .eq("scorer_id", user.id)
    .in("event_id", eventIds.length > 0 ? eventIds : [-1]);

  // Build a map: eventId → { hasDraft, hasSubmitted }
  const scoreStatusMap = new Map<number, { hasDraft: boolean; hasSubmitted: boolean }>();
  for (const s of scores ?? []) {
    const existing = scoreStatusMap.get(s.event_id) ?? { hasDraft: false, hasSubmitted: false };
    if (s.is_draft) existing.hasDraft = true;
    else existing.hasSubmitted = true;
    scoreStatusMap.set(s.event_id, existing);
  }

  return pastEvents.map((r: any) => {
    const event = r.events;
    const scoreStatus = scoreStatusMap.get(event.id);
    let status: "score" | "waiting" | "results" | "expired";

    if (event.match_results_released) {
      status = "results";
    } else if (scoreStatus?.hasSubmitted) {
      status = "waiting";
    } else if (event.match_submission_open && !event.match_submission_locked) {
      // Check deadline
      if (event.match_submission_deadline && new Date(event.match_submission_deadline) < new Date()) {
        status = "expired";
      } else {
        status = "score"; // includes drafts (in-progress)
      }
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
      hasDraft: scoreStatus?.hasDraft ?? false,
      deadline: event.match_submission_deadline,
    };
  });
}

// ─── Match Questions ─────────────────────────────────────────

export async function getMatchQuestions(eventId: number) {
  const { supabase } = await requireUser();

  const { data: questions } = await supabase
    .from("event_match_questions")
    .select("*")
    .or(`event_id.is.null,event_id.eq.${eventId}`)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return questions ?? [];
}

// ─── Enhanced Score Data (card-by-card flow) ─────────────────

export async function getEnhancedScoreData(eventId: number) {
  const { supabase, user } = await requireUser();

  // Verify user attended this event
  const { data: reg } = await supabase
    .from("event_registrations")
    .select("id, attended")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .in("status", ["confirmed", "attended"])
    .single();

  if (!reg) return { error: "You did not attend this event" };

  // Check event settings
  const { data: event } = await supabase
    .from("events")
    .select("match_submission_open, match_submission_deadline, match_submission_locked, event_date")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found" };
  if (!event.match_submission_open) return { error: "Score submission is not open for this event" };
  if (event.match_submission_locked) return { error: "Score submission has been locked by admin" };

  // Check deadline
  if (event.match_submission_deadline) {
    if (new Date(event.match_submission_deadline) < new Date()) {
      return { error: "The deadline for submitting matches has passed" };
    }
  }

  // Check if already fully submitted (non-draft)
  const { data: existingScores } = await supabase
    .from("match_scores")
    .select("id, is_draft, scored_id, choice, share_email, share_phone, share_whatsapp, share_instagram, share_facebook")
    .eq("event_id", eventId)
    .eq("scorer_id", user.id);

  const hasSubmitted = existingScores?.some(s => !s.is_draft);
  if (hasSubmitted) return { error: "You have already submitted your choices" };

  // Get user profile for gender/preference
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("gender, sexual_preference, privacy_preferences")
    .eq("id", user.id)
    .single();

  if (!myProfile) return { error: "Profile not found" };

  // Get other participants with full profile data
  const { data: otherRegs } = await supabase
    .from("event_registrations")
    .select(`user_id, profiles(id, first_name, last_name, gender, date_of_birth, avatar_url, bio, interests, occupation, education, city_id, cities(name))`)
    .eq("event_id", eventId)
    .in("status", ["confirmed", "attended"])
    .neq("user_id", user.id);

  // Filter by gender preference
  const candidates = (otherRegs ?? []).filter((r: any) => {
    const otherGender = r.profiles?.gender;
    if (myProfile.sexual_preference === "both") return true;
    if (myProfile.sexual_preference === "men") return otherGender === "male";
    if (myProfile.sexual_preference === "women") return otherGender === "female";
    // Default: opposite gender
    return otherGender !== myProfile.gender;
  });

  // Get questions for this event
  const questions = await getMatchQuestions(eventId);

  // Load draft answers if any
  let draftAnswers: Record<string, any[]> = {};
  if (existingScores && existingScores.length > 0) {
    const scoreIds = existingScores.map(s => s.id);
    const { data: answers } = await supabase
      .from("match_score_answers")
      .select("match_score_id, question_id, answer")
      .in("match_score_id", scoreIds);

    // Group answers by match_score_id
    for (const ans of answers ?? []) {
      if (!draftAnswers[ans.match_score_id]) draftAnswers[ans.match_score_id] = [];
      draftAnswers[ans.match_score_id].push(ans);
    }
  }

  // Build draft data map: scored_id → saved data
  const draftMap: Record<string, any> = {};
  for (const s of existingScores ?? []) {
    draftMap[s.scored_id] = {
      choice: s.choice,
      shareEmail: s.share_email,
      sharePhone: s.share_phone,
      shareWhatsapp: s.share_whatsapp,
      shareInstagram: s.share_instagram,
      shareFacebook: s.share_facebook,
      answers: (draftAnswers[s.id] ?? []).reduce((acc: Record<number, string>, a: any) => {
        acc[a.question_id] = a.answer;
        return acc;
      }, {}),
    };
  }

  const defaults = (myProfile.privacy_preferences as any) ?? {};

  // VIP: check if user has active VIP and fetch who chose them
  let vipChoices: Record<string, string> | null = null;
  const { data: vipSub } = await supabase
    .from("vip_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);

  if (vipSub && vipSub.length > 0) {
    // Fetch all non-draft scores where this user was scored
    const { data: incomingScores } = await supabase
      .from("match_scores")
      .select("scorer_id, choice")
      .eq("event_id", eventId)
      .eq("scored_id", user.id)
      .eq("is_draft", false);

    if (incomingScores && incomingScores.length > 0) {
      vipChoices = {};
      for (const s of incomingScores) {
        vipChoices[s.scorer_id] = s.choice;
      }
    }
  }

  return {
    participants: candidates.map((c: any) => {
      const p = c.profiles;
      const age = p?.date_of_birth
        ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
      return {
        id: p?.id,
        firstName: p?.first_name ?? "Unknown",
        lastName: p?.last_name ?? "",
        age,
        avatarUrl: p?.avatar_url,
        bio: p?.bio,
        city: p?.cities?.name,
        interests: p?.interests ? p.interests.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
        occupation: p?.occupation,
        education: p?.education,
      };
    }),
    questions,
    draftScores: Object.keys(draftMap).length > 0 ? draftMap : null,
    defaults: {
      shareEmail: defaults.share_email ?? true,
      sharePhone: defaults.share_phone ?? false,
      shareWhatsapp: defaults.share_whatsapp ?? false,
      shareInstagram: defaults.share_instagram ?? false,
      shareFacebook: defaults.share_facebook ?? false,
    },
    deadline: event.match_submission_deadline,
    vipChoices,
  };
}

// ─── Draft Save (auto-save per person) ───────────────────────

export async function saveDraftScore(
  eventId: number,
  scoredId: string,
  choice: "date" | "friend" | "no",
  shares: {
    shareEmail: boolean;
    sharePhone: boolean;
    shareWhatsapp: boolean;
    shareInstagram: boolean;
    shareFacebook: boolean;
  },
  answers: { questionId: number; answer: string }[]
) {
  const { supabase, user } = await requireUser();

  // Server-side validation: check deadline and lock
  const { data: event } = await supabase
    .from("events")
    .select("match_submission_open, match_submission_deadline, match_submission_locked")
    .eq("id", eventId)
    .single();

  if (!event?.match_submission_open) return { error: "Submission not open" };
  if (event.match_submission_locked) return { error: "Submission locked" };
  if (event.match_submission_deadline && new Date(event.match_submission_deadline) < new Date()) {
    return { error: "Deadline passed" };
  }

  // Upsert the score as draft
  const { data: score, error: scoreError } = await supabase
    .from("match_scores")
    .upsert(
      {
        event_id: eventId,
        scorer_id: user.id,
        scored_id: scoredId,
        choice,
        share_email: shares.shareEmail,
        share_phone: shares.sharePhone,
        share_whatsapp: shares.shareWhatsapp,
        share_instagram: shares.shareInstagram,
        share_facebook: shares.shareFacebook,
        is_draft: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id,scorer_id,scored_id" }
    )
    .select("id")
    .single();

  if (scoreError) return { error: scoreError.message };

  // Delete existing answers for this score, then insert new ones
  await supabase
    .from("match_score_answers")
    .delete()
    .eq("match_score_id", score.id);

  if (answers.length > 0) {
    const { error: ansError } = await supabase
      .from("match_score_answers")
      .insert(
        answers.map((a) => ({
          match_score_id: score.id,
          question_id: a.questionId,
          answer: a.answer,
        }))
      );

    if (ansError) return { error: ansError.message };
  }

  return { success: true };
}

// ─── Final Submission ────────────────────────────────────────

export async function submitFinalScores(eventId: number) {
  const { supabase, user } = await requireUser();

  // Server-side validation
  const { data: event } = await supabase
    .from("events")
    .select("match_submission_open, match_submission_deadline, match_submission_locked")
    .eq("id", eventId)
    .single();

  if (!event?.match_submission_open) return { error: "Submission not open" };
  if (event.match_submission_locked) return { error: "Submission locked" };
  if (event.match_submission_deadline && new Date(event.match_submission_deadline) < new Date()) {
    return { error: "Deadline passed" };
  }

  // Get all draft scores
  const { data: draftScores } = await supabase
    .from("match_scores")
    .select("id")
    .eq("event_id", eventId)
    .eq("scorer_id", user.id)
    .eq("is_draft", true);

  if (!draftScores || draftScores.length === 0) {
    return { error: "No scores to submit" };
  }

  // Mark all as final
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("match_scores")
    .update({
      is_draft: false,
      submitted_at: now,
      submitted_by_user_at: now,
    })
    .eq("event_id", eventId)
    .eq("scorer_id", user.id)
    .eq("is_draft", true);

  if (error) return { error: error.message };

  // Trigger match computation
  await supabase.rpc("compute_matches", { p_event_id: eventId });

  revalidatePath("/matches");
  return { success: true };
}

// ─── Submission Progress ─────────────────────────────────────

export async function getSubmissionProgress(eventId: number) {
  const { supabase, user } = await requireUser();

  // Get user profile for gender preference
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("gender, sexual_preference")
    .eq("id", user.id)
    .single();

  // Get all other attended participants
  const { data: otherRegs } = await supabase
    .from("event_registrations")
    .select("user_id, profiles(gender)")
    .eq("event_id", eventId)
    .in("status", ["confirmed", "attended"])
    .neq("user_id", user.id);

  const total = (otherRegs ?? []).filter((r: any) => {
    const otherGender = r.profiles?.gender;
    if (myProfile?.sexual_preference === "both") return true;
    if (myProfile?.sexual_preference === "men") return otherGender === "male";
    if (myProfile?.sexual_preference === "women") return otherGender === "female";
    return otherGender !== myProfile?.gender;
  }).length;

  // Count saved scores (including drafts)
  const { count } = await supabase
    .from("match_scores")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("scorer_id", user.id);

  return { completed: count ?? 0, total };
}

// ─── Legacy: kept for backward compatibility ─────────────────

export async function getScoreData(eventId: number) {
  const { supabase, user } = await requireUser();

  const { data: reg } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .in("status", ["confirmed", "attended"])
    .single();

  if (!reg) return { error: "You did not attend this event" };

  const { data: event } = await supabase
    .from("events")
    .select("match_submission_open, event_date")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found" };
  if (!event.match_submission_open)
    return { error: "Score submission is not open for this event" };

  const { data: existingScores } = await supabase
    .from("match_scores")
    .select("id, is_draft")
    .eq("event_id", eventId)
    .eq("scorer_id", user.id)
    .limit(1);

  if (existingScores && existingScores.length > 0 && !existingScores[0].is_draft)
    return { error: "You have already submitted your choices" };

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("gender, sexual_preference, privacy_preferences")
    .eq("id", user.id)
    .single();

  if (!myProfile) return { error: "Profile not found" };

  const { data: otherRegs } = await supabase
    .from("event_registrations")
    .select("user_id, profiles(id, first_name, gender)")
    .eq("event_id", eventId)
    .in("status", ["confirmed", "attended"])
    .neq("user_id", user.id);

  let candidates = (otherRegs ?? []).filter((r: any) => {
    const otherGender = r.profiles?.gender;
    if (myProfile.sexual_preference === "both") return true;
    if (myProfile.sexual_preference === "men") return otherGender === "male";
    if (myProfile.sexual_preference === "women") return otherGender === "female";
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

  const { data: existing } = await supabase
    .from("match_scores")
    .select("id, is_draft")
    .eq("event_id", eventId)
    .eq("scorer_id", user.id)
    .limit(1);

  if (existing && existing.length > 0 && !existing[0].is_draft)
    return { error: "Already submitted" };

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
    is_draft: false,
  }));

  const { error } = await supabase.from("match_scores").insert(inserts);
  if (error) return { error: error.message };

  await supabase.rpc("compute_matches", { p_event_id: eventId });

  revalidatePath("/matches");
  return { success: true };
}

// ─── Match Results ───────────────────────────────────────────

export async function getMatchResults(eventId: number) {
  const { supabase, user } = await requireUser();

  const { data: event } = await supabase
    .from("events")
    .select("match_results_released, event_date, cities(name)")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found" };
  if (!event.match_results_released)
    return { error: "Results are not yet available" };

  const { data: results } = await supabase
    .from("match_results")
    .select(
      `id, result_type, user_a_id, user_b_id, user_a_shares, user_b_shares`
    )
    .eq("event_id", eventId)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .neq("result_type", "no_match");

  if (!results) return { matches: [], event };

  const otherIds = results.map((r) =>
    r.user_a_id === user.id ? r.user_b_id : r.user_a_id
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, date_of_birth, bio, email, phone, whatsapp, instagram, facebook, city_id, cities(name)")
    .in("id", otherIds.length > 0 ? otherIds : ["none"]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  const matches = results.map((r) => {
    const isUserA = r.user_a_id === user.id;
    const otherId = isUserA ? r.user_b_id : r.user_a_id;
    const otherProfile = profileMap.get(otherId) as any;
    const otherShares = (isUserA ? r.user_b_shares : r.user_a_shares) as any;

    const age = otherProfile?.date_of_birth
      ? Math.floor((Date.now() - new Date(otherProfile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    return {
      id: r.id,
      userId: otherId,
      type: r.result_type as "mutual_date" | "mutual_friend",
      firstName: otherProfile?.first_name ?? "Unknown",
      lastName: otherProfile?.last_name ?? "",
      avatarUrl: otherProfile?.avatar_url ?? null,
      age,
      city: otherProfile?.cities?.name ?? null,
      bio: otherProfile?.bio ?? null,
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

  const { count: totalParticipants } = await supabase
    .from("event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .in("status", ["confirmed", "attended"]);

  const { count: totalScorers } = await supabase
    .from("match_scores")
    .select("scorer_id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("is_draft", false);

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

// ─── VIP Bonus ───────────────────────────────────────────────

export async function getVipBonusData(eventId: number) {
  const { supabase, user } = await requireUser();

  const { data: vip } = await supabase
    .from("vip_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);

  if (!vip || vip.length === 0) return null;

  const { data: whoChoseMe } = await supabase
    .from("match_scores")
    .select("scorer_id, choice, profiles!match_scores_scorer_id_fkey(first_name, avatar_url)")
    .eq("event_id", eventId)
    .eq("scored_id", user.id)
    .eq("is_draft", false)
    .in("choice", ["date", "friend"]);

  return (whoChoseMe ?? []).map((s: any) => ({
    name: s.profiles?.first_name ?? "Someone",
    avatarUrl: s.profiles?.avatar_url ?? null,
    choice: s.choice,
  }));
}

// ─── VIP Status Check ────────────────────────────────────────

export async function checkVipStatus() {
  const { supabase, user } = await requireUser();

  const { data: vip } = await supabase
    .from("vip_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);

  return !!(vip && vip.length > 0);
}

// ─── Submitted Choices Review ───────────────────────────────

export async function getSubmittedChoices(eventId: number) {
  const { supabase, user } = await requireUser();

  // Verify user attended
  const { data: reg } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .in("status", ["confirmed", "attended"])
    .single();

  if (!reg) return { error: "You did not attend this event" };

  // Get event info
  const { data: event } = await supabase
    .from("events")
    .select("event_date, event_type, cities(name), venues(name)")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found" };

  // Get user's submitted scores
  const { data: scores } = await supabase
    .from("match_scores")
    .select("scored_id, choice")
    .eq("event_id", eventId)
    .eq("scorer_id", user.id)
    .eq("is_draft", false);

  if (!scores || scores.length === 0) {
    return { error: "No submitted choices found" };
  }

  // Get scored participant profiles
  const scoredIds = scores.map((s) => s.scored_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, date_of_birth, city_id, cities(name)")
    .in("id", scoredIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  const choices = scores.map((s) => {
    const p = profileMap.get(s.scored_id) as any;
    const age = p?.date_of_birth
      ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    return {
      id: s.scored_id,
      firstName: p?.first_name ?? "Unknown",
      lastName: p?.last_name ?? "",
      avatarUrl: p?.avatar_url ?? null,
      age,
      city: p?.cities?.name ?? null,
      choice: s.choice as "date" | "friend" | "no",
    };
  });

  return {
    choices,
    event: {
      date: event.event_date,
      type: event.event_type,
      city: (event.cities as any)?.name ?? null,
      venue: (event.venues as any)?.name ?? null,
    },
  };
}
