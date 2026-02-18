/**
 * Taste Vector Cron Job
 *
 * This module updates taste vectors for all active users.
 * It should be called nightly by a cron service (e.g., Vercel Cron, GitHub Actions).
 *
 * Usage: Call via API route POST /api/admin/recalculate-matches with:
 *   { "action": "update-taste-vectors" }
 *
 * Or import and call directly in a server context.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export async function updateAllTasteVectors(): Promise<{ updated: number; scoresInvalidated: number }> {
  const supabase = createAdminClient();

  // Get all users who have date_ratings
  const { data: raters } = await supabase
    .from("date_ratings" as any)
    .select("from_user_id")
    .limit(10000);

  if (!raters) return { updated: 0, scoresInvalidated: 0 };

  // Unique user IDs
  const userIds = [...new Set(raters.map((r: any) => r.from_user_id))];

  let updated = 0;
  const updatedUserIds: string[] = [];

  for (const userId of userIds) {
    try {
      await updateTasteVectorForUser(supabase, userId);
      updatedUserIds.push(userId);
      updated++;
    } catch {
      // Skip individual failures
    }
  }

  // Invalidate cached scores for all users whose taste vectors changed
  let scoresInvalidated = 0;
  for (const userId of updatedUserIds) {
    try {
      await supabase
        .from("compatibility_scores" as any)
        .delete()
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);
      scoresInvalidated++;
    } catch {
      // Skip individual failures
    }
  }

  return { updated, scoresInvalidated };
}

async function updateTasteVectorForUser(supabase: any, userId: string) {
  // Get all date ratings from this user
  const { data: ratings } = await supabase
    .from("date_ratings")
    .select("*")
    .eq("from_user_id", userId);

  if (!ratings || ratings.length === 0) return;

  // Filter to positive ratings
  const positiveRatings = ratings.filter(
    (r: any) =>
      r.would_meet_again ||
      r.conversation_quality >= 4 ||
      r.long_term_potential >= 4 ||
      r.physical_chemistry >= 4
  );

  if (positiveRatings.length < 3) return;

  // Get profiles of positively rated users
  const ratedUserIds = positiveRatings.map((r: any) => r.to_user_id);

  const { data: ratedProfiles } = await supabase
    .from("profiles")
    .select("id, date_of_birth, education_level, religion_importance, career_ambition")
    .in("id", ratedUserIds);

  const { data: ratedCompats } = await supabase
    .from("compatibility_profiles")
    .select("user_id, social_energy, lifestyle_pace, conversation_depth, affection_style")
    .in("user_id", ratedUserIds);

  if (!ratedProfiles || ratedProfiles.length === 0) return;

  // Get scorer's DOB
  const { data: scorerProfile } = await supabase
    .from("profiles")
    .select("date_of_birth")
    .eq("id", userId)
    .single();

  const scorerAge = scorerProfile?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(scorerProfile.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const compatMap = new Map<string, any>();
  for (const c of ratedCompats ?? []) compatMap.set(c.user_id, c);

  let sumEdu = 0, countEdu = 0;
  let sumRel = 0, countRel = 0;
  let sumAmb = 0, countAmb = 0;
  let sumSoc = 0, countSoc = 0;
  let sumPace = 0, countPace = 0;
  let sumConv = 0, countConv = 0;
  let sumAff = 0, countAff = 0;
  let sumAge = 0, countAge = 0;

  for (const p of ratedProfiles) {
    if (p.education_level != null) { sumEdu += p.education_level; countEdu++; }
    if (p.religion_importance != null) { sumRel += p.religion_importance; countRel++; }
    if (p.career_ambition != null) { sumAmb += p.career_ambition; countAmb++; }

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

  await supabase.from("taste_vectors").upsert(
    {
      user_id: userId,
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
    },
    { onConflict: "user_id" }
  );
}
