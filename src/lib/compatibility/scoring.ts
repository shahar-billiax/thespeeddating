/**
 * Deep Compatibility Scoring Engine
 *
 * Deterministic, multi-factor matching algorithm:
 *   Step 1: Dealbreaker filter (hard rejection)
 *   Step 2: Life alignment score (30%)
 *   Step 3: Psychological compatibility score (25%)
 *   Step 4: Chemistry score from event ratings (15%)
 *   Step 5: Taste learning score (10%)
 *   Step 6: Profile completeness bonus (5%)
 *   Step 7: Mutual scoring — final = sqrt(A→B × B→A)
 *
 * All sub-scores normalized to [0, 1].
 */

import type {
  CompatibilityProfile,
  CompatibilityScoreBreakdown,
  DateRating,
  DealbreakerPreferences,
  ExplanationStrength,
  MatchExplanation,
  MatchWeightConfig,
  PremiumCompatibilityBreakdown,
  ProfileLifeAlignment,
  TasteVector,
} from "@/types/compatibility";
import { COMPAT_QUESTIONS } from "@/types/compatibility";

// ─── Types for scoring context ───────────────────────────────────

export interface ScoringProfile {
  id: string;
  date_of_birth: string;
  gender: string;
  faith: string | null;
  has_children: boolean | null;
  education: string | null;
  city_id: number | null;
  // Extended fields from migration 040
  religion_importance: number | null;
  practice_frequency: string | null;
  wants_children: string | null;
  children_timeline: string | null;
  career_ambition: number | null;
  work_life_philosophy: number | null;
  education_level: number | null;
  profession_category: string | null;
  personal_description: string | null;
  partner_expectations: string | null;
  marriage_vision: string | null;
}

export interface ScoringContext {
  weights: MatchWeightConfig;
  // Chemistry data: ratings from user toward the other, across all events
  ratingsFromA: DateRating[];
  ratingsFromB: DateRating[];
  // Taste vectors
  tasteA: TasteVector | null;
  tasteB: TasteVector | null;
}

// ─── Helper: age from DOB ────────────────────────────────────────

function getAge(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ═══════════════════════════════════════════════════════════════
// STEP 1: DEALBREAKER FILTER
// ═══════════════════════════════════════════════════════════════

/**
 * Returns true if the pair should be REJECTED (dealbreaker triggered).
 * Checks both directions — A's prefs against B, and B's prefs against A.
 */
export function checkDealbreakers(
  profileA: ScoringProfile,
  profileB: ScoringProfile,
  prefsA: DealbreakerPreferences | null,
  prefsB: DealbreakerPreferences | null
): boolean {
  return (
    checkOneWayDealbreakers(profileA, profileB, prefsA) ||
    checkOneWayDealbreakers(profileB, profileA, prefsB)
  );
}

function checkOneWayDealbreakers(
  _fromProfile: ScoringProfile,
  toProfile: ScoringProfile,
  prefs: DealbreakerPreferences | null
): boolean {
  if (!prefs) return false;

  // Age range check
  if (prefs.preferred_age_min != null || prefs.preferred_age_max != null) {
    const age = getAge(toProfile.date_of_birth);
    if (prefs.preferred_age_min != null && age < prefs.preferred_age_min) return true;
    if (prefs.preferred_age_max != null && age > prefs.preferred_age_max) return true;
  }

  // Religion must match
  if (prefs.religion_must_match) {
    // Reject if either person hasn't specified their religion
    if (!toProfile.faith || !_fromProfile.faith) return true;
    if (toProfile.faith !== _fromProfile.faith) {
      // Check acceptable religions list
      if (prefs.acceptable_religions && prefs.acceptable_religions.length > 0) {
        if (!prefs.acceptable_religions.includes(toProfile.faith)) return true;
      } else {
        return true;
      }
    }
  }

  // Must want children
  if (prefs.must_want_children && toProfile.wants_children === "no") {
    return true;
  }

  // Minimum education level
  if (prefs.min_education_level != null && toProfile.education_level != null) {
    if (toProfile.education_level < prefs.min_education_level) return true;
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: LIFE ALIGNMENT SCORE (30%)
// ═══════════════════════════════════════════════════════════════

export function computeLifeAlignment(a: ScoringProfile, b: ScoringProfile): number {
  let score = 0;
  let weights = 0;

  // Kids alignment (weight: 3)
  const kidsScore = computeKidsAlignment(a, b);
  if (kidsScore !== null) {
    score += kidsScore * 3;
    weights += 3;
  }

  // Religion alignment weighted by importance (weight: 2.5)
  const faithScore = computeFaithAlignment(a, b);
  if (faithScore !== null) {
    score += faithScore * 2.5;
    weights += 2.5;
  }

  // Education distance (weight: 1.5)
  if (a.education_level != null && b.education_level != null) {
    const edDiff = Math.abs(a.education_level - b.education_level);
    const edScore = 1 - edDiff / 4; // max diff is 4 (1 vs 5)
    score += edScore * 1.5;
    weights += 1.5;
  }

  // Age compatibility (weight: 2)
  const ageA = getAge(a.date_of_birth);
  const ageB = getAge(b.date_of_birth);
  const ageDiff = Math.abs(ageA - ageB);
  // 0 diff = 1.0, 10+ diff = 0.0
  const ageScore = Math.max(0, 1 - ageDiff / 10);
  score += ageScore * 2;
  weights += 2;

  // Work-life philosophy alignment (weight: 1.5)
  if (a.work_life_philosophy != null && b.work_life_philosophy != null) {
    const wlDiff = Math.abs(a.work_life_philosophy - b.work_life_philosophy);
    const wlScore = 1 - wlDiff / 4;
    score += wlScore * 1.5;
    weights += 1.5;
  }

  // Career ambition alignment (weight: 1)
  if (a.career_ambition != null && b.career_ambition != null) {
    const caDiff = Math.abs(a.career_ambition - b.career_ambition);
    const caScore = 1 - caDiff / 4;
    score += caScore * 1;
    weights += 1;
  }

  return weights > 0 ? score / weights : 0.5;
}

function computeKidsAlignment(a: ScoringProfile, b: ScoringProfile): number | null {
  if (!a.wants_children || !b.wants_children) return null;

  // Exact match = 1.0
  if (a.wants_children === b.wants_children) return 1.0;

  // "open" matches with anything except strict mismatch
  if (a.wants_children === "open" || b.wants_children === "open") return 0.7;

  // yes vs no = 0.0
  return 0.0;
}

function computeFaithAlignment(a: ScoringProfile, b: ScoringProfile): number | null {
  if (!a.faith && !b.faith) return null;

  // Same faith
  if (a.faith === b.faith) return 1.0;

  // Different faith — weighted by how important it is to each
  const impA = a.religion_importance ?? 1;
  const impB = b.religion_importance ?? 1;
  const avgImportance = (impA + impB) / 2;

  // High importance + mismatch = low score
  // Low importance + mismatch = moderate score
  return Math.max(0, 1 - (avgImportance - 1) / 4);
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: PSYCHOLOGICAL COMPATIBILITY (25%)
// ═══════════════════════════════════════════════════════════════

export function computePsychologicalScore(
  a: CompatibilityProfile | null,
  b: CompatibilityProfile | null
): number {
  if (!a || !b) return 0.5; // neutral if missing

  let totalScore = 0;
  let count = 0;

  for (const q of COMPAT_QUESTIONS) {
    const valA = a[q.key as keyof CompatibilityProfile] as number;
    const valB = b[q.key as keyof CompatibilityProfile] as number;

    if (typeof valA !== "number" || typeof valB !== "number") continue;

    let questionScore: number;

    if (q.scoringType === "similarity") {
      // Similarity: closer values = higher score
      const diff = Math.abs(valA - valB);
      questionScore = 1 - diff / 4; // max diff = 4 (1 vs 5)
    } else {
      // Complement: moderate difference is ideal (1-2 apart)
      const diff = Math.abs(valA - valB);
      if (diff <= 2) {
        questionScore = 1 - diff * 0.1; // 0 diff = 1.0, 2 diff = 0.8
      } else {
        questionScore = Math.max(0, 0.8 - (diff - 2) * 0.3); // 3 diff = 0.5, 4 diff = 0.2
      }
    }

    totalScore += questionScore;
    count++;
  }

  return count > 0 ? totalScore / count : 0.5;
}

// ═══════════════════════════════════════════════════════════════
// STEP 4: CHEMISTRY SCORE (15%)
// ═══════════════════════════════════════════════════════════════

/**
 * Computes chemistry score from one user's ratings of another.
 * Returns 0.5 (neutral) if no interactions exist.
 */
export function computeChemistryScore(ratingsFromUser: DateRating[]): number {
  if (ratingsFromUser.length === 0) return 0.5;

  // Use the most recent rating (could average across events later)
  const latest = ratingsFromUser.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  // Weighted components
  const wouldMeetWeight = 0.30;
  const conversationWeight = 0.15;
  const longTermWeight = 0.20;
  const chemistryWeight = 0.10;
  const comfortWeight = 0.10;
  const valuesWeight = 0.10;
  const energyWeight = 0.05;

  const wouldMeetScore = latest.would_meet_again ? 1.0 : 0.0;
  const normalize = (val: number) => (val - 1) / 4; // 1-5 → 0-1

  return (
    wouldMeetScore * wouldMeetWeight +
    normalize(latest.conversation_quality) * conversationWeight +
    normalize(latest.long_term_potential) * longTermWeight +
    normalize(latest.physical_chemistry) * chemistryWeight +
    normalize(latest.comfort_level) * comfortWeight +
    normalize(latest.values_alignment) * valuesWeight +
    normalize(latest.energy_compatibility) * energyWeight
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 5: TASTE LEARNING SCORE (10%)
// ═══════════════════════════════════════════════════════════════

/**
 * How well does the candidate match the user's learned taste vector?
 */
export function computeTasteFitScore(
  taste: TasteVector | null,
  candidateProfile: ScoringProfile,
  candidateCompat: CompatibilityProfile | null,
  scorerDob: string
): number {
  if (!taste || taste.sample_count < 3) return 0.5; // not enough data

  let score = 0;
  let count = 0;

  // Education level match
  if (taste.avg_education_level != null && candidateProfile.education_level != null) {
    const diff = Math.abs(taste.avg_education_level - candidateProfile.education_level);
    score += Math.max(0, 1 - diff / 4);
    count++;
  }

  // Career ambition match
  if (taste.avg_career_ambition != null && candidateProfile.career_ambition != null) {
    const diff = Math.abs(taste.avg_career_ambition - candidateProfile.career_ambition);
    score += Math.max(0, 1 - diff / 4);
    count++;
  }

  // Social energy match
  if (taste.avg_social_energy != null && candidateCompat) {
    const diff = Math.abs(taste.avg_social_energy - candidateCompat.social_energy);
    score += Math.max(0, 1 - diff / 4);
    count++;
  }

  // Lifestyle pace match
  if (taste.avg_lifestyle_pace != null && candidateCompat) {
    const diff = Math.abs(taste.avg_lifestyle_pace - candidateCompat.lifestyle_pace);
    score += Math.max(0, 1 - diff / 4);
    count++;
  }

  // Conversation depth match
  if (taste.avg_conversation_depth != null && candidateCompat) {
    const diff = Math.abs(taste.avg_conversation_depth - candidateCompat.conversation_depth);
    score += Math.max(0, 1 - diff / 4);
    count++;
  }

  // Age difference match
  if (taste.avg_age_diff != null) {
    const scorerAge = getAge(scorerDob);
    const candidateAge = getAge(candidateProfile.date_of_birth);
    const actualDiff = candidateAge - scorerAge;
    const prefDiff = taste.avg_age_diff;
    const deviation = Math.abs(actualDiff - prefDiff);
    score += Math.max(0, 1 - deviation / 10);
    count++;
  }

  return count > 0 ? score / count : 0.5;
}

// ═══════════════════════════════════════════════════════════════
// STEP 6: PROFILE COMPLETENESS BONUS (5%)
// ═══════════════════════════════════════════════════════════════

export function computeProfileCompleteness(
  profile: ScoringProfile,
  compat: CompatibilityProfile | null,
  prefs: DealbreakerPreferences | null
): number {
  let filled = 0;
  let total = 0;

  // Life alignment fields
  const lifeFields = [
    profile.faith,
    profile.religion_importance,
    profile.practice_frequency,
    profile.wants_children,
    profile.career_ambition,
    profile.work_life_philosophy,
    profile.education_level,
    profile.personal_description,
    profile.partner_expectations,
    profile.marriage_vision,
  ];
  for (const f of lifeFields) {
    total++;
    if (f != null && f !== "") filled++;
  }

  // Compat profile = 20 questions
  if (compat) {
    filled += 20;
  }
  total += 20;

  // Dealbreaker preferences
  if (prefs) {
    filled += 3; // at minimum they set something
  }
  total += 3;

  return total > 0 ? filled / total : 0;
}

// ═══════════════════════════════════════════════════════════════
// MATCH EXPLANATION ENGINE
// ═══════════════════════════════════════════════════════════════

function strengthFromScore(score: number): ExplanationStrength {
  if (score >= 0.85) return "very_strong";
  if (score >= 0.70) return "strong";
  if (score >= 0.50) return "moderate";
  if (score >= 0.30) return "weak";
  return "mismatch";
}

function chemistrySignal(ratings: DateRating[]): "positive" | "neutral" | "no_data" {
  if (ratings.length === 0) return "no_data";
  const latest = ratings.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  if (latest.would_meet_again && latest.long_term_potential >= 4) return "positive";
  return "neutral";
}

function generateExplanationSummary(explanation: Omit<MatchExplanation, "summary">): string {
  const parts: string[] = [];

  const strengthLabel = {
    very_strong: "excellent",
    strong: "strong",
    moderate: "moderate",
    weak: "some differences in",
    mismatch: "challenges in",
  };

  if (explanation.family_alignment === "very_strong" || explanation.family_alignment === "strong") {
    parts.push(`${strengthLabel[explanation.family_alignment]} family alignment`);
  }
  if (explanation.faith_compatibility === "very_strong" || explanation.faith_compatibility === "strong") {
    parts.push(`shared faith values`);
  }
  if (explanation.emotional_balance === "very_strong" || explanation.emotional_balance === "strong") {
    parts.push(`complementary emotional styles`);
  }
  if (explanation.lifestyle_match === "very_strong" || explanation.lifestyle_match === "strong") {
    parts.push(`compatible lifestyles`);
  }
  if (explanation.chemistry_signal === "positive") {
    parts.push(`positive event chemistry`);
  }

  if (parts.length === 0) {
    parts.push("moderate overall compatibility with room to grow");
  }

  return "You share " + parts.join(", ") + ".";
}

export function buildExplanation(
  profileA: ScoringProfile,
  profileB: ScoringProfile,
  compatA: CompatibilityProfile | null,
  compatB: CompatibilityProfile | null,
  ratingsFromA: DateRating[],
  ratingsFromB: DateRating[]
): MatchExplanation {
  // Family alignment
  const kidsScore = computeKidsAlignment(profileA, profileB) ?? 0.5;
  const familyCompat =
    compatA && compatB
      ? (scoreSimilarity(compatA.parenting_style, compatB.parenting_style) +
          scoreSimilarity(compatA.family_involvement, compatB.family_involvement) +
          scoreSimilarity(compatA.relationship_timeline, compatB.relationship_timeline)) /
        3
      : 0.5;
  const familyScore = (kidsScore + familyCompat) / 2;

  // Faith
  const faithScore = computeFaithAlignment(profileA, profileB) ?? 0.5;

  // Emotional balance (complement traits)
  const emotionalScore =
    compatA && compatB
      ? (scoreComplement(compatA.emotional_expressiveness, compatB.emotional_expressiveness) +
          scoreSimilarity(compatA.conflict_approach, compatB.conflict_approach) +
          scoreSimilarity(compatA.stress_reaction, compatB.stress_reaction)) /
        3
      : 0.5;

  // Lifestyle
  const lifestyleScore =
    compatA && compatB
      ? (scoreSimilarity(compatA.lifestyle_pace, compatB.lifestyle_pace) +
          scoreComplement(compatA.social_energy, compatB.social_energy) +
          scoreSimilarity(compatA.weekend_preference, compatB.weekend_preference)) /
        3
      : 0.5;

  // Ambition
  const ambitionScore =
    compatA && compatB
      ? (scoreSimilarity(compatA.career_ambition_compat, compatB.career_ambition_compat) +
          scoreSimilarity(compatA.financial_goals, compatB.financial_goals) +
          scoreSimilarity(compatA.work_life_compat, compatB.work_life_compat)) /
        3
      : 0.5;

  // Communication
  const commScore =
    compatA && compatB
      ? (scoreSimilarity(compatA.conversation_depth, compatB.conversation_depth) +
          scoreSimilarity(compatA.affection_style, compatB.affection_style) +
          scoreComplement(compatA.decision_making_style, compatB.decision_making_style)) /
        3
      : 0.5;

  const explanation: Omit<MatchExplanation, "summary"> = {
    family_alignment: strengthFromScore(familyScore),
    faith_compatibility: strengthFromScore(faithScore),
    emotional_balance: strengthFromScore(emotionalScore),
    lifestyle_match: strengthFromScore(lifestyleScore),
    ambition_alignment: strengthFromScore(ambitionScore),
    communication_style: strengthFromScore(commScore),
    chemistry_signal: chemistrySignal([...ratingsFromA, ...ratingsFromB]),
  };

  return {
    ...explanation,
    summary: generateExplanationSummary(explanation),
  };
}

// ─── Premium Breakdown ───────────────────────────────────────────

export function buildPremiumBreakdown(
  profileA: ScoringProfile,
  profileB: ScoringProfile,
  compatA: CompatibilityProfile | null,
  compatB: CompatibilityProfile | null
): PremiumCompatibilityBreakdown {
  // Emotional harmony
  const emotionalHarmony =
    compatA && compatB
      ? ((scoreComplement(compatA.emotional_expressiveness, compatB.emotional_expressiveness) +
          scoreSimilarity(compatA.conflict_approach, compatB.conflict_approach) +
          scoreSimilarity(compatA.need_for_reassurance, compatB.need_for_reassurance) +
          scoreSimilarity(compatA.stress_reaction, compatB.stress_reaction)) /
          4) *
        100
      : 50;

  // Family alignment
  const kidsScore = computeKidsAlignment(profileA, profileB) ?? 0.5;
  const familyAlignment =
    compatA && compatB
      ? ((kidsScore +
          scoreSimilarity(compatA.parenting_style, compatB.parenting_style) +
          scoreSimilarity(compatA.family_involvement, compatB.family_involvement) +
          scoreSimilarity(compatA.relationship_timeline, compatB.relationship_timeline)) /
          4) *
        100
      : 50;

  // Lifestyle compatibility
  const lifestyleCompat =
    compatA && compatB
      ? ((scoreSimilarity(compatA.lifestyle_pace, compatB.lifestyle_pace) +
          scoreComplement(compatA.social_energy, compatB.social_energy) +
          scoreSimilarity(compatA.weekend_preference, compatB.weekend_preference) +
          scoreComplement(compatA.structure_spontaneity, compatB.structure_spontaneity)) /
          4) *
        100
      : 50;

  // Ambition alignment
  const ambitionAlignment =
    compatA && compatB
      ? ((scoreSimilarity(compatA.career_ambition_compat, compatB.career_ambition_compat) +
          scoreSimilarity(compatA.financial_goals, compatB.financial_goals) +
          scoreSimilarity(compatA.personal_growth_drive, compatB.personal_growth_drive) +
          scoreSimilarity(compatA.work_life_compat, compatB.work_life_compat)) /
          4) *
        100
      : 50;

  // Communication match
  const communicationMatch =
    compatA && compatB
      ? ((scoreSimilarity(compatA.conversation_depth, compatB.conversation_depth) +
          scoreSimilarity(compatA.affection_style, compatB.affection_style) +
          scoreComplement(compatA.decision_making_style, compatB.decision_making_style) +
          scoreSimilarity(compatA.need_for_novelty, compatB.need_for_novelty)) /
          4) *
        100
      : 50;

  // Conflict style insight
  let conflictInsight = "You both have similar approaches to handling disagreements.";
  if (compatA && compatB) {
    const diff = Math.abs(compatA.conflict_approach - compatB.conflict_approach);
    if (diff >= 3) {
      conflictInsight =
        "You have very different conflict styles — one tends to avoid while the other addresses directly. This may require extra communication.";
    } else if (diff >= 2) {
      conflictInsight =
        "You have somewhat different conflict approaches, which can balance each other with awareness.";
    }
  }

  // Long-term stability
  const avgScore = (emotionalHarmony + familyAlignment + ambitionAlignment) / 3;
  const stability: "high" | "moderate" | "developing" =
    avgScore >= 75 ? "high" : avgScore >= 55 ? "moderate" : "developing";

  return {
    emotional_harmony: Math.round(emotionalHarmony),
    family_alignment: Math.round(familyAlignment),
    lifestyle_compatibility: Math.round(lifestyleCompat),
    ambition_alignment: Math.round(ambitionAlignment),
    communication_match: Math.round(communicationMatch),
    conflict_style_insight: conflictInsight,
    long_term_stability_indicator: stability,
  };
}

// ─── Scoring helpers ─────────────────────────────────────────────

function scoreSimilarity(a: number, b: number): number {
  return 1 - Math.abs(a - b) / 4;
}

function scoreComplement(a: number, b: number): number {
  const diff = Math.abs(a - b);
  if (diff <= 2) return 1 - diff * 0.1;
  return Math.max(0, 0.8 - (diff - 2) * 0.3);
}

// ═══════════════════════════════════════════════════════════════
// FULL PIPELINE: Compute match between two users
// ═══════════════════════════════════════════════════════════════

export interface FullMatchResult {
  score_a_to_b: number;
  score_b_to_a: number;
  final_score: number;
  breakdown: CompatibilityScoreBreakdown;
  rejected: boolean; // true if dealbreaker triggered
}

export function computeFullMatch(
  profileA: ScoringProfile,
  profileB: ScoringProfile,
  compatA: CompatibilityProfile | null,
  compatB: CompatibilityProfile | null,
  prefsA: DealbreakerPreferences | null,
  prefsB: DealbreakerPreferences | null,
  ctx: ScoringContext
): FullMatchResult {
  // Step 1: Dealbreaker check
  if (checkDealbreakers(profileA, profileB, prefsA, prefsB)) {
    return {
      score_a_to_b: 0,
      score_b_to_a: 0,
      final_score: 0,
      breakdown: {
        life_alignment: 0,
        psychological: 0,
        chemistry: 0,
        taste_fit: 0,
        profile_completeness: 0,
        explanation: {
          family_alignment: "mismatch",
          faith_compatibility: "mismatch",
          emotional_balance: "mismatch",
          lifestyle_match: "mismatch",
          ambition_alignment: "mismatch",
          communication_style: "mismatch",
          chemistry_signal: "no_data",
          summary: "Dealbreaker preferences prevent this match.",
        },
      },
      rejected: true,
    };
  }

  const w = ctx.weights;

  // Step 2: Life alignment (symmetric)
  const lifeAlignment = computeLifeAlignment(profileA, profileB);

  // Step 3: Psychological compatibility (symmetric)
  const psychological = computePsychologicalScore(compatA, compatB);

  // Step 4: Chemistry (directional)
  const chemistryAtoB = computeChemistryScore(ctx.ratingsFromA);
  const chemistryBtoA = computeChemistryScore(ctx.ratingsFromB);

  // Step 5: Taste fit (directional)
  const tasteFitAtoB = computeTasteFitScore(ctx.tasteA, profileB, compatB, profileA.date_of_birth);
  const tasteFitBtoA = computeTasteFitScore(ctx.tasteB, profileA, compatA, profileB.date_of_birth);

  // Step 6: Profile completeness (directional — how complete is the candidate)
  const completenessB = computeProfileCompleteness(profileB, compatB, prefsB);
  const completenessA = computeProfileCompleteness(profileA, compatA, prefsA);

  // Compose directional scores
  const baseWeight = 1 - w.life_alignment_weight - w.psychological_weight -
    w.chemistry_weight - w.taste_learning_weight - w.profile_completeness_weight;

  const scoreAtoB =
    lifeAlignment * w.life_alignment_weight +
    psychological * w.psychological_weight +
    chemistryAtoB * w.chemistry_weight +
    tasteFitAtoB * w.taste_learning_weight +
    completenessB * w.profile_completeness_weight +
    0.5 * baseWeight; // neutral base for remaining weight

  const scoreBtoA =
    lifeAlignment * w.life_alignment_weight +
    psychological * w.psychological_weight +
    chemistryBtoA * w.chemistry_weight +
    tasteFitBtoA * w.taste_learning_weight +
    completenessA * w.profile_completeness_weight +
    0.5 * baseWeight;

  // Step 7: Mutual scoring
  const finalScore = Math.sqrt(scoreAtoB * scoreBtoA);

  // Build explanation
  const explanation = buildExplanation(
    profileA,
    profileB,
    compatA,
    compatB,
    ctx.ratingsFromA,
    ctx.ratingsFromB
  );

  // Build premium breakdown (stored in cache for VIP users)
  const premiumBreakdown = buildPremiumBreakdown(profileA, profileB, compatA, compatB);

  return {
    score_a_to_b: Math.round(scoreAtoB * 10000) / 10000,
    score_b_to_a: Math.round(scoreBtoA * 10000) / 10000,
    final_score: Math.round(finalScore * 10000) / 10000,
    breakdown: {
      life_alignment: Math.round(lifeAlignment * 10000) / 10000,
      psychological: Math.round(psychological * 10000) / 10000,
      chemistry: Math.round(((chemistryAtoB + chemistryBtoA) / 2) * 10000) / 10000,
      taste_fit: Math.round(((tasteFitAtoB + tasteFitBtoA) / 2) * 10000) / 10000,
      profile_completeness: Math.round(((completenessA + completenessB) / 2) * 10000) / 10000,
      explanation,
      premium_breakdown: premiumBreakdown,
    },
    rejected: false,
  };
}
