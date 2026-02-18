"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type {
  CompatibilityProfileInput,
  DateRatingInput,
  DealbreakerPreferencesInput,
  EventFeedbackInput,
  ProfileLifeAlignmentInput,
  CompatibilityMatchResult,
  MatchWeightConfig,
} from "@/types/compatibility";
import {
  computeFullMatch,
  buildPremiumBreakdown,
  type ScoringProfile,
  type ScoringContext,
} from "./scoring";

// ─── Auth helpers ────────────────────────────────────────────────

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// ═══════════════════════════════════════════════════════════════
// PROFILE LIFE ALIGNMENT (Section A)
// ═══════════════════════════════════════════════════════════════

export async function getLifeAlignmentProfile() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("profiles")
    .select(
      `faith, religion_importance, practice_frequency, has_children,
       wants_children, children_timeline, career_ambition, work_life_philosophy,
       education_level, profession_category, personal_description,
       partner_expectations, marriage_vision`
    )
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateLifeAlignmentProfile(input: ProfileLifeAlignmentInput) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      faith: input.faith,
      religion_importance: input.religion_importance,
      practice_frequency: input.practice_frequency,
      has_children: input.has_children,
      wants_children: input.wants_children,
      children_timeline: input.children_timeline,
      career_ambition: input.career_ambition,
      work_life_philosophy: input.work_life_philosophy,
      education_level: input.education_level,
      profession_category: input.profession_category,
      personal_description: input.personal_description,
      partner_expectations: input.partner_expectations,
      marriage_vision: input.marriage_vision,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", user.id);

  if (error) throw new Error(`Failed to update life alignment profile: ${error.message}`);

  // Invalidate and recalculate compatibility scores since profile changed
  await invalidateAndRecalculate(user.id);
  revalidatePath("/profile");
  revalidatePath("/compatibility");
}

// ═══════════════════════════════════════════════════════════════
// COMPATIBILITY PROFILE (Section B — 20 Questions)
// ═══════════════════════════════════════════════════════════════

export async function getCompatibilityProfile() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("compatibility_profiles" as any)
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function saveCompatibilityProfile(input: CompatibilityProfileInput) {
  const { supabase, user } = await requireUser();

  // Validate all 20 values are 1-5
  const fields = Object.entries(input);
  for (const [key, val] of fields) {
    if (typeof val !== "number" || val < 1 || val > 5) {
      throw new Error(`Invalid value for ${key}: must be 1-5`);
    }
  }

  const { error } = await supabase
    .from("compatibility_profiles" as any)
    .upsert(
      {
        user_id: user.id,
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(`Failed to save compatibility profile: ${error.message}`);

  await invalidateAndRecalculate(user.id);
  revalidatePath("/profile");
  revalidatePath("/compatibility");
}

// ═══════════════════════════════════════════════════════════════
// DEALBREAKER PREFERENCES (Section C)
// ═══════════════════════════════════════════════════════════════

export async function getDealbreakers() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("dealbreaker_preferences" as any)
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function saveDealbreakers(input: DealbreakerPreferencesInput) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("dealbreaker_preferences" as any)
    .upsert(
      {
        user_id: user.id,
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(`Failed to save dealbreaker preferences: ${error.message}`);

  await invalidateAndRecalculate(user.id);
  revalidatePath("/compatibility");
}

// ═══════════════════════════════════════════════════════════════
// EVENT FEEDBACK (Post-Event Global)
// ═══════════════════════════════════════════════════════════════

export async function getEventFeedback(eventId: number) {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("event_feedback" as any)
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function submitEventFeedback(input: EventFeedbackInput) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("event_feedback" as any)
    .upsert(
      {
        event_id: input.event_id,
        user_id: user.id,
        overall_satisfaction: input.overall_satisfaction,
        met_aligned_people: input.met_aligned_people,
        would_attend_again: input.would_attend_again,
      },
      { onConflict: "event_id,user_id" }
    );

  if (error) throw new Error(`Failed to submit event feedback: ${error.message}`);

  revalidatePath(`/matches/${input.event_id}`);
}

// ═══════════════════════════════════════════════════════════════
// DATE RATINGS (Per-Person Evaluation)
// ═══════════════════════════════════════════════════════════════

export async function getDateRatings(eventId: number) {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("date_ratings" as any)
    .select("*")
    .eq("event_id", eventId)
    .eq("from_user_id", user.id);

  return data ?? [];
}

export async function submitDateRating(input: DateRatingInput) {
  const { supabase, user } = await requireUser();

  // Validate all ratings are 1-5
  for (const field of [
    "conversation_quality",
    "long_term_potential",
    "physical_chemistry",
    "comfort_level",
    "values_alignment",
    "energy_compatibility",
  ] as const) {
    const val = input[field];
    if (typeof val !== "number" || val < 1 || val > 5) {
      throw new Error(`Invalid value for ${field}: must be 1-5`);
    }
  }

  const { error } = await supabase
    .from("date_ratings" as any)
    .upsert(
      {
        event_id: input.event_id,
        from_user_id: user.id,
        to_user_id: input.to_user_id,
        would_meet_again: input.would_meet_again,
        conversation_quality: input.conversation_quality,
        long_term_potential: input.long_term_potential,
        physical_chemistry: input.physical_chemistry,
        comfort_level: input.comfort_level,
        values_alignment: input.values_alignment,
        energy_compatibility: input.energy_compatibility,
      },
      { onConflict: "event_id,from_user_id,to_user_id" }
    );

  if (error) throw new Error(`Failed to submit date rating: ${error.message}`);

  // Invalidate scores for both users since chemistry is directional
  // Recalculate for the submitting user; just invalidate for the other
  await invalidateAndRecalculate(user.id);
  await invalidateUserScores(input.to_user_id);
  revalidatePath(`/matches/${input.event_id}`);
}

// ═══════════════════════════════════════════════════════════════
// MATCH RETRIEVAL — GET COMPATIBILITY MATCHES
// ═══════════════════════════════════════════════════════════════

export async function getCompatibilityMatches(
  page = 1,
  perPage = 20
) {
  const { supabase, user } = await requireUser();

  // Fetch cached scores involving this user
  const offset = (page - 1) * perPage;

  const { data: scores, count } = await supabase
    .from("compatibility_scores" as any)
    .select("*", { count: "exact" })
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .gt("final_score", 0)
    .order("final_score", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (!scores || scores.length === 0) {
    return { matches: [], total: 0, page, per_page: perPage, has_more: false };
  }

  // Get partner IDs
  const partnerIds = scores.map((s: any) =>
    s.user_a === user.id ? s.user_b : s.user_a
  );

  // Fetch partner profiles, VIP status, and shared event counts in parallel
  const [profilesResult, vipResult, sharedCounts] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, date_of_birth, avatar_url, city_id, cities(name)")
      .in("id", partnerIds),
    supabase
      .from("vip_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
    getSharedEventCountsInternal(supabase, user.id, partnerIds),
  ]);

  const profiles = profilesResult.data;
  const isVip = !!vipResult.data;

  const profileMap = new Map<string, any>();
  for (const p of profiles ?? []) {
    profileMap.set(p.id, p);
  }

  const matches: CompatibilityMatchResult[] = scores.map((s: any) => {
    const partnerId = s.user_a === user.id ? s.user_b : s.user_a;
    const profile = profileMap.get(partnerId);
    const breakdown = s.breakdown as any;

    const age = profile?.date_of_birth
      ? Math.floor(
          (Date.now() - new Date(profile.date_of_birth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;

    // All stored scores passed dealbreakers (rejected pairs are never stored)
    const result: CompatibilityMatchResult = {
      user_id: partnerId,
      first_name: profile?.first_name ?? "Unknown",
      last_name: profile?.last_name ?? "",
      age,
      avatar_url: profile?.avatar_url ?? null,
      city: (profile?.cities as any)?.name ?? null,
      final_score: s.final_score,
      explanation: breakdown?.explanation ?? {
        family_alignment: "moderate",
        faith_compatibility: "moderate",
        emotional_balance: "moderate",
        lifestyle_match: "moderate",
        ambition_alignment: "moderate",
        communication_style: "moderate",
        chemistry_signal: "no_data",
        summary: "Compatibility data available.",
      },
      dealbreakers_passed: true,
      shared_event_count: sharedCounts[partnerId] ?? 0,
    };

    // Premium users get full breakdown from cached computation
    if (isVip && breakdown?.premium_breakdown) {
      result.premium_breakdown = breakdown.premium_breakdown;
    }

    return result;
  });

  return {
    matches,
    total: count ?? 0,
    page,
    per_page: perPage,
    has_more: (count ?? 0) > offset + perPage,
  };
}

// ═══════════════════════════════════════════════════════════════
// MATCH CALCULATION — RECALCULATE SCORES FOR A USER
// ═══════════════════════════════════════════════════════════════

const DEFAULT_WEIGHTS: MatchWeightConfig = {
  id: 1,
  life_alignment_weight: 0.30,
  psychological_weight: 0.25,
  chemistry_weight: 0.15,
  taste_learning_weight: 0.10,
  profile_completeness_weight: 0.05,
  updated_at: new Date().toISOString(),
  updated_by: null,
};

/**
 * Core recalculation logic — accepts a supabase client directly (no auth).
 * Used by both the authenticated wrapper and internal background recalculation.
 */
async function recalculateMatchesForUser(
  supabase: any,
  targetUserId: string
): Promise<{ computed: number }> {
  // Get the user's profile
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetUserId)
    .single();

  if (!myProfile) return { computed: 0 };

  // Get user's compat profile and dealbreakers
  const { data: myCompat } = (await supabase
    .from("compatibility_profiles" as any)
    .select("*")
    .eq("user_id", targetUserId)
    .single()) as { data: any };

  const { data: myPrefs } = (await supabase
    .from("dealbreaker_preferences" as any)
    .select("*")
    .eq("user_id", targetUserId)
    .single()) as { data: any };

  // Get taste vector
  const { data: myTaste } = (await supabase
    .from("taste_vectors" as any)
    .select("*")
    .eq("user_id", targetUserId)
    .single()) as { data: any };

  // Get scoring weights
  const { data: weights } = (await supabase
    .from("match_weight_config" as any)
    .select("*")
    .eq("id", 1)
    .single()) as { data: any };

  // Determine opposite gender for matching
  const genderFilter = myProfile.sexual_preference === "both"
    ? undefined
    : myProfile.sexual_preference === "men"
    ? "male"
    : "female";

  // Get candidate profiles (opposite gender, active, same country)
  let candidateQuery = supabase
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .neq("id", targetUserId);

  if (genderFilter) {
    candidateQuery = candidateQuery.eq("gender", genderFilter);
  }
  if (myProfile.country_id) {
    candidateQuery = candidateQuery.eq("country_id", myProfile.country_id);
  }

  const { data: candidates } = await candidateQuery.limit(500);

  if (!candidates || candidates.length === 0) return { computed: 0 };

  const candidateIds = candidates.map((c: any) => c.id);

  // Batch fetch compat profiles and dealbreakers
  const { data: compatProfiles } = (await supabase
    .from("compatibility_profiles" as any)
    .select("*")
    .in("user_id", candidateIds)) as { data: any[] | null };

  const { data: dealbreakerProfiles } = (await supabase
    .from("dealbreaker_preferences" as any)
    .select("*")
    .in("user_id", candidateIds)) as { data: any[] | null };

  const { data: tasteVectors } = (await supabase
    .from("taste_vectors" as any)
    .select("*")
    .in("user_id", candidateIds)) as { data: any[] | null };

  // Batch fetch date ratings involving the target user
  const { data: ratingsFrom } = (await supabase
    .from("date_ratings" as any)
    .select("*")
    .eq("from_user_id", targetUserId)) as { data: any[] | null };

  const { data: ratingsTo } = (await supabase
    .from("date_ratings" as any)
    .select("*")
    .eq("to_user_id", targetUserId)) as { data: any[] | null };

  // Build lookup maps
  const compatMap = new Map<string, any>();
  for (const c of compatProfiles ?? []) compatMap.set(c.user_id, c);

  const prefsMap = new Map<string, any>();
  for (const p of dealbreakerProfiles ?? []) prefsMap.set(p.user_id, p);

  const tasteMap = new Map<string, any>();
  for (const t of tasteVectors ?? []) tasteMap.set(t.user_id, t);

  const ratingsFromMap = new Map<string, any[]>();
  for (const r of ratingsFrom ?? []) {
    const key = r.to_user_id;
    if (!ratingsFromMap.has(key)) ratingsFromMap.set(key, []);
    ratingsFromMap.get(key)!.push(r);
  }

  const ratingsToMap = new Map<string, any[]>();
  for (const r of ratingsTo ?? []) {
    const key = r.from_user_id;
    if (!ratingsToMap.has(key)) ratingsToMap.set(key, []);
    ratingsToMap.get(key)!.push(r);
  }

  // Compute scores
  const scoresToUpsert: any[] = [];

  for (const candidate of candidates) {
    const ctx: ScoringContext = {
      weights: weights ?? DEFAULT_WEIGHTS,
      ratingsFromA: ratingsFromMap.get(candidate.id) ?? [],
      ratingsFromB: ratingsToMap.get(candidate.id) ?? [],
      tasteA: myTaste ?? null,
      tasteB: tasteMap.get(candidate.id) ?? null,
    };

    const result = computeFullMatch(
      myProfile as unknown as ScoringProfile,
      candidate as unknown as ScoringProfile,
      myCompat ?? null,
      compatMap.get(candidate.id) ?? null,
      myPrefs ?? null,
      prefsMap.get(candidate.id) ?? null,
      ctx
    );

    if (result.rejected) continue;

    // Canonical ordering: smaller UUID first
    const [userA, userB] =
      targetUserId < candidate.id
        ? [targetUserId, candidate.id]
        : [candidate.id, targetUserId];

    const [scoreAtoB, scoreBtoA] =
      targetUserId < candidate.id
        ? [result.score_a_to_b, result.score_b_to_a]
        : [result.score_b_to_a, result.score_a_to_b];

    scoresToUpsert.push({
      user_a: userA,
      user_b: userB,
      score_a_to_b: scoreAtoB,
      score_b_to_a: scoreBtoA,
      final_score: result.final_score,
      breakdown: result.breakdown,
      computed_at: new Date().toISOString(),
    });
  }

  // Batch upsert in chunks of 100
  const chunkSize = 100;
  for (let i = 0; i < scoresToUpsert.length; i += chunkSize) {
    const chunk = scoresToUpsert.slice(i, i + chunkSize);
    await supabase
      .from("compatibility_scores" as any)
      .upsert(chunk, { onConflict: "user_a,user_b" });
  }

  return { computed: scoresToUpsert.length };
}

/**
 * Recalculate compatibility scores (authenticated user wrapper).
 * Called from admin panel or user-facing contexts.
 */
export async function recalculateUserMatches(userId?: string) {
  const { supabase, user } = await requireUser();
  const targetUserId = userId ?? user.id;
  const result = await recalculateMatchesForUser(supabase, targetUserId);
  revalidatePath("/compatibility");
  return result;
}

// ═══════════════════════════════════════════════════════════════
// TASTE VECTOR UPDATE
// ═══════════════════════════════════════════════════════════════

/**
 * Update a user's taste vector based on their date ratings.
 * Called by nightly cron or after rating submission.
 */
export async function updateTasteVector(userId?: string) {
  const { supabase, user } = await requireUser();
  const targetUserId = userId ?? user.id;

  // Get all date ratings from user where any rating ≥ 4
  const { data: ratings } = (await supabase
    .from("date_ratings" as any)
    .select("*")
    .eq("from_user_id", targetUserId)) as { data: any[] | null };

  if (!ratings || ratings.length === 0) return;

  // Filter to positively rated dates (any rating ≥ 4 or would_meet_again)
  const positiveRatings = ratings.filter(
    (r: any) =>
      r.would_meet_again ||
      r.conversation_quality >= 4 ||
      r.long_term_potential >= 4 ||
      r.physical_chemistry >= 4
  );

  if (positiveRatings.length < 3) return; // Need minimum sample

  // Get profiles of positively rated users
  const ratedUserIds = positiveRatings.map((r: any) => r.to_user_id);

  // education_level, religion_importance, career_ambition are new columns
  // from migration 040 — not yet in generated types
  const { data: ratedProfiles } = (await supabase
    .from("profiles")
    .select("*")
    .in("id", ratedUserIds)) as { data: any[] | null };

  const { data: ratedCompats } = (await supabase
    .from("compatibility_profiles" as any)
    .select("user_id, social_energy, lifestyle_pace, conversation_depth, affection_style")
    .in("user_id", ratedUserIds)) as { data: any[] | null };

  if (!ratedProfiles || ratedProfiles.length === 0) return;

  // Get scorer's DOB for age diff calculation
  const { data: scorerProfile } = await supabase
    .from("profiles")
    .select("date_of_birth")
    .eq("id", targetUserId)
    .single();

  const scorerAge = scorerProfile?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(scorerProfile.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  // Build compat lookup
  const compatMap = new Map<string, any>();
  for (const c of ratedCompats ?? []) compatMap.set(c.user_id, c);

  // Average traits
  let sumEdu = 0, countEdu = 0;
  let sumRel = 0, countRel = 0;
  let sumAmb = 0, countAmb = 0;
  let sumSoc = 0, countSoc = 0;
  let sumPace = 0, countPace = 0;
  let sumConv = 0, countConv = 0;
  let sumAff = 0, countAff = 0;
  let sumAge = 0, countAge = 0;

  for (const p of ratedProfiles) {
    if ((p as any).education_level != null) { sumEdu += (p as any).education_level; countEdu++; }
    if ((p as any).religion_importance != null) { sumRel += (p as any).religion_importance; countRel++; }
    if ((p as any).career_ambition != null) { sumAmb += (p as any).career_ambition; countAmb++; }

    const compat = compatMap.get(p.id);
    if (compat) {
      if (compat.social_energy != null) { sumSoc += compat.social_energy; countSoc++; }
      if (compat.lifestyle_pace != null) { sumPace += compat.lifestyle_pace; countPace++; }
      if (compat.conversation_depth != null) { sumConv += compat.conversation_depth; countConv++; }
      if (compat.affection_style != null) { sumAff += compat.affection_style; countAff++; }
    }

    if (scorerAge && p.date_of_birth) {
      const ratedAge = Math.floor(
        (Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      sumAge += ratedAge - scorerAge;
      countAge++;
    }
  }

  const tasteVector = {
    user_id: targetUserId,
    avg_education_level: countEdu > 0 ? sumEdu / countEdu : null,
    avg_religion_importance: countRel > 0 ? sumRel / countRel : null,
    avg_career_ambition: countAmb > 0 ? sumAmb / countAmb : null,
    avg_social_energy: countSoc > 0 ? sumSoc / countSoc : null,
    avg_lifestyle_pace: countPace > 0 ? sumPace / countPace : null,
    avg_conversation_depth: countConv > 0 ? sumConv / countConv : null,
    avg_affection_style: countAff > 0 ? sumAff / countAff : null,
    avg_age_diff: countAge > 0 ? sumAge / countAge : null,
    sample_count: positiveRatings.length,
    updated_at: new Date().toISOString(),
  };

  await supabase
    .from("taste_vectors" as any)
    .upsert(tasteVector, { onConflict: "user_id" });
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Delete cached scores involving a user and trigger background recalculation.
 * Uses admin client so it works from any server context.
 */
async function invalidateAndRecalculate(userId: string) {
  const supabase = createAdminClient();

  // Delete cached scores
  await supabase
    .from("compatibility_scores" as any)
    .delete()
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);

  // Recalculate in the background (fire-and-forget, don't block the UI)
  recalculateMatchesForUser(supabase, userId).catch(() => {
    // Silently fail — scores will be recalculated on next admin batch run
  });
}

/**
 * Internal shared event count helper — accepts an existing supabase client.
 * Used inside getCompatibilityMatches to avoid double auth.
 */
async function getSharedEventCountsInternal(
  supabase: any,
  userId: string,
  partnerIds: string[]
): Promise<Record<string, number>> {
  if (partnerIds.length === 0) return {};

  const { data: myEvents } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("user_id", userId)
    .in("status", ["confirmed", "attended"]);

  if (!myEvents || myEvents.length === 0) return {};
  const myEventIds = myEvents.map((e: any) => e.event_id);

  const { data: partnerRegs } = await supabase
    .from("event_registrations")
    .select("user_id, event_id")
    .in("user_id", partnerIds)
    .in("event_id", myEventIds)
    .in("status", ["confirmed", "attended"]);

  const counts: Record<string, number> = {};
  for (const r of partnerRegs ?? []) {
    counts[r.user_id] = (counts[r.user_id] ?? 0) + 1;
  }
  return counts;
}

/**
 * Delete cached scores only (no recalculation). Used for bidirectional
 * invalidation where recalculation is triggered separately.
 */
async function invalidateUserScores(userId: string) {
  const supabase = createAdminClient();

  await supabase
    .from("compatibility_scores" as any)
    .delete()
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);
}

// ═══════════════════════════════════════════════════════════════
// PROFILE COMPLETION STATUS
// ═══════════════════════════════════════════════════════════════

// Get compatibility scores for the current user paired with specific users
export async function getCompatibilityScoresForUsers(partnerIds: string[]) {
  if (partnerIds.length === 0) return {};
  const { supabase, user } = await requireUser();

  const { data: scores } = (await supabase
    .from("compatibility_scores" as any)
    .select("user_a, user_b, final_score, breakdown")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .gt("final_score", 0)) as { data: any[] | null };

  const result: Record<string, { score: number; dealbreakers_passed: boolean }> = {};
  for (const s of scores ?? []) {
    const partnerId = s.user_a === user.id ? s.user_b : s.user_a;
    if (partnerIds.includes(partnerId)) {
      const breakdown = s.breakdown as any;
      result[partnerId] = {
        score: Math.round(s.final_score * 100),
        dealbreakers_passed: !breakdown?.dealbreaker_triggered,
      };
    }
  }
  return result;
}

// Get event IDs where the current user co-attended with specific users
export async function getSharedEventCounts(partnerIds: string[]) {
  if (partnerIds.length === 0) return {};
  const { supabase, user } = await requireUser();

  // Get all events current user attended
  const { data: myEvents } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("user_id", user.id)
    .in("status", ["confirmed", "attended"]);

  if (!myEvents || myEvents.length === 0) return {};
  const myEventIds = myEvents.map((e) => e.event_id);

  // Get registrations of partners in those same events
  const { data: partnerRegs } = await supabase
    .from("event_registrations")
    .select("user_id, event_id")
    .in("user_id", partnerIds)
    .in("event_id", myEventIds)
    .in("status", ["confirmed", "attended"]);

  const counts: Record<string, number> = {};
  for (const r of partnerRegs ?? []) {
    counts[r.user_id] = (counts[r.user_id] ?? 0) + 1;
  }
  return counts;
}

export async function getProfileCompletionStatus() {
  const { supabase, user } = await requireUser();

  // New columns from migration 040 not in generated types
  const { data: profile } = (await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()) as { data: any };

  const { data: compat } = (await supabase
    .from("compatibility_profiles" as any)
    .select("user_id")
    .eq("user_id", user.id)
    .single()) as { data: any };

  const { data: prefs } = (await supabase
    .from("dealbreaker_preferences" as any)
    .select("user_id")
    .eq("user_id", user.id)
    .single()) as { data: any };

  // Count filled life alignment fields — 7 core required fields, all must be filled
  const lifeFields = profile
    ? [
        profile.faith,
        profile.religion_importance,
        profile.practice_frequency,
        profile.wants_children,
        profile.career_ambition,
        profile.work_life_philosophy,
        profile.education_level,
      ]
    : [];

  const filledLifeFields = lifeFields.filter((f) => f != null && f !== "").length;

  return {
    life_alignment: {
      completed: filledLifeFields,
      total: 7,
      done: filledLifeFields >= 7,
    },
    compatibility_assessment: {
      done: !!compat,
    },
    dealbreaker_preferences: {
      done: !!prefs,
    },
    overall_complete:
      filledLifeFields >= 7 && !!compat && !!prefs,
  };
}
