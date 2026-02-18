import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  computeFullMatch,
  type ScoringProfile,
  type ScoringContext,
} from "@/lib/compatibility/scoring";
import type { MatchWeightConfig } from "@/types/compatibility";

/**
 * POST /api/admin/recalculate-matches
 *
 * Admin-only endpoint to recalculate all compatibility scores.
 * Optionally accepts { userId } to recalculate for a single user.
 */

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const targetUserId = body.userId as string | undefined;

  const supabase = createAdminClient();

  // Get scoring weights (table from migration 040)
  const { data: weights } = (await supabase
    .from("match_weight_config" as any)
    .select("*")
    .eq("id", 1)
    .single()) as { data: any };

  const defaultWeights: MatchWeightConfig = {
    id: 1,
    life_alignment_weight: 0.30,
    psychological_weight: 0.25,
    chemistry_weight: 0.15,
    taste_learning_weight: 0.10,
    profile_completeness_weight: 0.05,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };

  const w: MatchWeightConfig = weights ?? defaultWeights;

  if (targetUserId) {
    // Recalculate for a single user
    const count = await recalculateForUser(supabase, targetUserId, w);
    return NextResponse.json({ success: true, computed: count });
  }

  // Full recalculation: get all active profiles
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_active", true);

  if (!allProfiles) {
    return NextResponse.json({ success: true, computed: 0 });
  }

  // Clear all existing scores
  await supabase.from("compatibility_scores" as any).delete().neq("user_a", "00000000-0000-0000-0000-000000000000");

  let totalComputed = 0;

  // Process in batches
  for (const profile of allProfiles) {
    const count = await recalculateForUser(supabase, profile.id, w);
    totalComputed += count;
  }

  return NextResponse.json({ success: true, computed: totalComputed });
}

async function recalculateForUser(
  supabase: any,
  userId: string,
  weights: MatchWeightConfig
): Promise<number> {
  // Get user's profile + related data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return 0;

  const { data: compat } = await supabase
    .from("compatibility_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: prefs } = await supabase
    .from("dealbreaker_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: taste } = await supabase
    .from("taste_vectors")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Get opposite gender candidates in same country
  const genderFilter = profile.sexual_preference === "both"
    ? undefined
    : profile.sexual_preference === "men"
    ? "male"
    : "female";

  let q = supabase
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .neq("id", userId);

  if (genderFilter) q = q.eq("gender", genderFilter);
  if (profile.country_id) q = q.eq("country_id", profile.country_id);

  const { data: candidates } = await q.limit(500);
  if (!candidates || candidates.length === 0) return 0;

  const candidateIds = candidates.map((c: any) => c.id);

  // Batch fetch
  const { data: compatProfiles } = await supabase
    .from("compatibility_profiles")
    .select("*")
    .in("user_id", candidateIds);

  const { data: dealbreakerProfiles } = await supabase
    .from("dealbreaker_preferences")
    .select("*")
    .in("user_id", candidateIds);

  const { data: tasteVectors } = await supabase
    .from("taste_vectors")
    .select("*")
    .in("user_id", candidateIds);

  const { data: ratingsFrom } = await supabase
    .from("date_ratings")
    .select("*")
    .eq("from_user_id", userId);

  const { data: ratingsTo } = await supabase
    .from("date_ratings")
    .select("*")
    .eq("to_user_id", userId);

  // Build maps
  const compatMap = new Map<string, any>();
  for (const c of compatProfiles ?? []) compatMap.set(c.user_id, c);

  const prefsMap = new Map<string, any>();
  for (const p of dealbreakerProfiles ?? []) prefsMap.set(p.user_id, p);

  const tasteMap = new Map<string, any>();
  for (const t of tasteVectors ?? []) tasteMap.set(t.user_id, t);

  const ratingsFromMap = new Map<string, any[]>();
  for (const r of ratingsFrom ?? []) {
    if (!ratingsFromMap.has(r.to_user_id)) ratingsFromMap.set(r.to_user_id, []);
    ratingsFromMap.get(r.to_user_id)!.push(r);
  }

  const ratingsToMap = new Map<string, any[]>();
  for (const r of ratingsTo ?? []) {
    if (!ratingsToMap.has(r.from_user_id)) ratingsToMap.set(r.from_user_id, []);
    ratingsToMap.get(r.from_user_id)!.push(r);
  }

  const scores: any[] = [];

  for (const candidate of candidates) {
    // Only compute if this user's ID < candidate (avoid duplicate pairs)
    const [userA, userB] = userId < candidate.id ? [userId, candidate.id] : [candidate.id, userId];

    // Skip if already computed (for full recalc, this prevents duplicates)
    const ctx: ScoringContext = {
      weights,
      ratingsFromA: userId < candidate.id
        ? (ratingsFromMap.get(candidate.id) ?? [])
        : (ratingsToMap.get(candidate.id) ?? []),
      ratingsFromB: userId < candidate.id
        ? (ratingsToMap.get(candidate.id) ?? [])
        : (ratingsFromMap.get(candidate.id) ?? []),
      tasteA: userId < candidate.id ? (taste ?? null) : (tasteMap.get(candidate.id) ?? null),
      tasteB: userId < candidate.id ? (tasteMap.get(candidate.id) ?? null) : (taste ?? null),
    };

    const profileA = userId < candidate.id ? profile : candidate;
    const profileB = userId < candidate.id ? candidate : profile;

    const result = computeFullMatch(
      profileA as unknown as ScoringProfile,
      profileB as unknown as ScoringProfile,
      userId < candidate.id ? (compat ?? null) : (compatMap.get(candidate.id) ?? null),
      userId < candidate.id ? (compatMap.get(candidate.id) ?? null) : (compat ?? null),
      userId < candidate.id ? (prefs ?? null) : (prefsMap.get(candidate.id) ?? null),
      userId < candidate.id ? (prefsMap.get(candidate.id) ?? null) : (prefs ?? null),
      ctx
    );

    if (result.rejected) continue;

    scores.push({
      user_a: userA,
      user_b: userB,
      score_a_to_b: result.score_a_to_b,
      score_b_to_a: result.score_b_to_a,
      final_score: result.final_score,
      breakdown: result.breakdown,
      computed_at: new Date().toISOString(),
    });
  }

  // Batch upsert
  const chunkSize = 100;
  for (let i = 0; i < scores.length; i += chunkSize) {
    const chunk = scores.slice(i, i + chunkSize);
    await supabase
      .from("compatibility_scores")
      .upsert(chunk, { onConflict: "user_a,user_b" });
  }

  return scores.length;
}
