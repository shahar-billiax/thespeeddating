/**
 * Types for the Deep Compatibility Matchmaking System.
 *
 * These extend the auto-generated database.ts types for new tables
 * added by migration 000040_deep_compatibility.sql.
 */

// ─── Profile Extensions (columns added to profiles) ──────────────

export interface ProfileLifeAlignment {
  faith: string | null;
  religion_importance: number | null; // 1-5
  practice_frequency: "daily" | "weekly" | "occasionally" | "rarely" | null;
  has_children: boolean | null;
  wants_children: "yes" | "no" | "open" | null;
  children_timeline: "soon" | "2_3_years" | "flexible" | null;
  career_ambition: number | null; // 1-5
  work_life_philosophy: number | null; // 1-5
  education_level: number | null; // 1-5
  profession_category: string | null;
  personal_description: string | null;
  partner_expectations: string | null;
  marriage_vision: string | null;
}

// ─── Compatibility Profile (20-Question Assessment) ──────────────

export interface CompatibilityProfile {
  user_id: string;

  // Emotional Style (q1-q4)
  emotional_expressiveness: number; // 1-5
  conflict_approach: number;
  need_for_reassurance: number;
  stress_reaction: number;

  // Lifestyle & Energy (q5-q8)
  lifestyle_pace: number;
  social_energy: number;
  weekend_preference: number;
  structure_spontaneity: number;

  // Ambition & Growth (q9-q12)
  career_ambition_compat: number;
  financial_goals: number;
  personal_growth_drive: number;
  work_life_compat: number;

  // Family & Long-Term Vision (q13-q16)
  parenting_style: number;
  family_involvement: number;
  relationship_timeline: number;
  living_preference: number;

  // Communication & Bonding (q17-q20)
  conversation_depth: number;
  affection_style: number;
  decision_making_style: number;
  need_for_novelty: number;

  created_at: string;
  updated_at: string;
}

/** The 20 compatibility questions, keyed by DB column name */
export const COMPAT_QUESTIONS = [
  // Emotional Style
  {
    key: "emotional_expressiveness",
    category: "emotional",
    label: "Emotional Expressiveness",
    lowLabel: "Reserved",
    highLabel: "Expressive",
    scoringType: "complement" as const,
  },
  {
    key: "conflict_approach",
    category: "emotional",
    label: "Conflict Approach",
    lowLabel: "Avoid",
    highLabel: "Address directly",
    scoringType: "similarity" as const,
  },
  {
    key: "need_for_reassurance",
    category: "emotional",
    label: "Need for Reassurance",
    lowLabel: "Independent",
    highLabel: "Need frequent reassurance",
    scoringType: "similarity" as const,
  },
  {
    key: "stress_reaction",
    category: "emotional",
    label: "Stress Reaction",
    lowLabel: "Calm",
    highLabel: "Reactive",
    scoringType: "similarity" as const,
  },
  // Lifestyle & Energy
  {
    key: "lifestyle_pace",
    category: "lifestyle",
    label: "Lifestyle Pace",
    lowLabel: "Calm",
    highLabel: "Adventurous",
    scoringType: "similarity" as const,
  },
  {
    key: "social_energy",
    category: "lifestyle",
    label: "Social Energy",
    lowLabel: "Introvert",
    highLabel: "Extrovert",
    scoringType: "complement" as const,
  },
  {
    key: "weekend_preference",
    category: "lifestyle",
    label: "Weekend Preference",
    lowLabel: "Stay home",
    highLabel: "Go out / Explore",
    scoringType: "similarity" as const,
  },
  {
    key: "structure_spontaneity",
    category: "lifestyle",
    label: "Structure vs Spontaneity",
    lowLabel: "Structured",
    highLabel: "Spontaneous",
    scoringType: "complement" as const,
  },
  // Ambition & Growth
  {
    key: "career_ambition_compat",
    category: "ambition",
    label: "Career Ambition",
    lowLabel: "Stable",
    highLabel: "Highly ambitious",
    scoringType: "similarity" as const,
  },
  {
    key: "financial_goals",
    category: "ambition",
    label: "Financial Goals",
    lowLabel: "Comfort",
    highLabel: "Wealth building",
    scoringType: "similarity" as const,
  },
  {
    key: "personal_growth_drive",
    category: "ambition",
    label: "Personal Growth Drive",
    lowLabel: "Content",
    highLabel: "Constant improvement",
    scoringType: "similarity" as const,
  },
  {
    key: "work_life_compat",
    category: "ambition",
    label: "Work-Life Philosophy",
    lowLabel: "Family-first",
    highLabel: "Career-first",
    scoringType: "similarity" as const,
  },
  // Family & Long-Term Vision
  {
    key: "parenting_style",
    category: "family",
    label: "Parenting Style",
    lowLabel: "Relaxed",
    highLabel: "Structured",
    scoringType: "similarity" as const,
  },
  {
    key: "family_involvement",
    category: "family",
    label: "Extended Family Involvement",
    lowLabel: "Independent",
    highLabel: "Very family-integrated",
    scoringType: "similarity" as const,
  },
  {
    key: "relationship_timeline",
    category: "family",
    label: "Relationship Timeline",
    lowLabel: "Slow build",
    highLabel: "Fast toward marriage",
    scoringType: "similarity" as const,
  },
  {
    key: "living_preference",
    category: "family",
    label: "Living Preference",
    lowLabel: "Rural / Suburban",
    highLabel: "Urban / City",
    scoringType: "similarity" as const,
  },
  // Communication & Bonding
  {
    key: "conversation_depth",
    category: "communication",
    label: "Conversation Depth",
    lowLabel: "Light / Fun",
    highLabel: "Deep / Philosophical",
    scoringType: "similarity" as const,
  },
  {
    key: "affection_style",
    category: "communication",
    label: "Affection Style",
    lowLabel: "Private",
    highLabel: "Very expressive",
    scoringType: "similarity" as const,
  },
  {
    key: "decision_making_style",
    category: "communication",
    label: "Decision-Making Style",
    lowLabel: "Go with the flow",
    highLabel: "Strong leadership",
    scoringType: "complement" as const,
  },
  {
    key: "need_for_novelty",
    category: "communication",
    label: "Need for Novelty",
    lowLabel: "Love routine",
    highLabel: "Need variety",
    scoringType: "similarity" as const,
  },
] as const;

export type CompatQuestionKey = (typeof COMPAT_QUESTIONS)[number]["key"];
export type CompatCategory = "emotional" | "lifestyle" | "ambition" | "family" | "communication";

// ─── Dealbreaker Preferences ─────────────────────────────────────

export interface DealbreakerPreferences {
  user_id: string;
  preferred_age_min: number | null;
  preferred_age_max: number | null;
  religion_must_match: boolean;
  acceptable_religions: string[] | null;
  must_want_children: boolean;
  min_education_level: number | null; // 1-5
  created_at: string;
  updated_at: string;
}

// ─── Event Feedback (Post-Event Global) ──────────────────────────

export interface EventFeedback {
  id: number;
  event_id: number;
  user_id: string;
  overall_satisfaction: number; // 1-5
  met_aligned_people: boolean;
  would_attend_again: boolean;
  created_at: string;
}

// ─── Date Ratings (Per-Person Evaluation) ────────────────────────

export interface DateRating {
  id: string;
  event_id: number;
  from_user_id: string;
  to_user_id: string;
  would_meet_again: boolean;
  conversation_quality: number; // 1-5
  long_term_potential: number;
  physical_chemistry: number;
  comfort_level: number;
  values_alignment: number;
  energy_compatibility: number;
  created_at: string;
}

// ─── Taste Vector ────────────────────────────────────────────────

export interface TasteVector {
  user_id: string;
  avg_education_level: number | null;
  avg_religion_importance: number | null;
  avg_career_ambition: number | null;
  avg_social_energy: number | null;
  avg_lifestyle_pace: number | null;
  avg_conversation_depth: number | null;
  avg_affection_style: number | null;
  avg_age_diff: number | null;
  sample_count: number;
  updated_at: string;
}

// ─── Compatibility Score (Cached) ────────────────────────────────

export interface CompatibilityScoreBreakdown {
  life_alignment: number; // 0-1
  psychological: number; // 0-1
  chemistry: number; // 0-1
  taste_fit: number; // 0-1
  profile_completeness: number; // 0-1
  explanation: MatchExplanation;
  premium_breakdown?: PremiumCompatibilityBreakdown;
}

export interface CompatibilityScore {
  user_a: string;
  user_b: string;
  score_a_to_b: number;
  score_b_to_a: number;
  final_score: number;
  breakdown: CompatibilityScoreBreakdown;
  computed_at: string;
}

// ─── Match Explanation ───────────────────────────────────────────

export type ExplanationStrength = "very_strong" | "strong" | "moderate" | "weak" | "mismatch";

export interface MatchExplanation {
  family_alignment: ExplanationStrength;
  faith_compatibility: ExplanationStrength;
  emotional_balance: ExplanationStrength;
  lifestyle_match: ExplanationStrength;
  ambition_alignment: ExplanationStrength;
  communication_style: ExplanationStrength;
  chemistry_signal: "positive" | "neutral" | "no_data";
  summary: string; // Human-readable 1-2 sentence summary
}

// ─── Premium Breakdown ──────────────────────────────────────────

export interface PremiumCompatibilityBreakdown {
  emotional_harmony: number; // 0-100%
  family_alignment: number;
  lifestyle_compatibility: number;
  ambition_alignment: number;
  communication_match: number;
  conflict_style_insight: string;
  long_term_stability_indicator: "high" | "moderate" | "developing";
}

// ─── Match Weight Config ─────────────────────────────────────────

export interface MatchWeightConfig {
  id: number;
  life_alignment_weight: number;
  psychological_weight: number;
  chemistry_weight: number;
  taste_learning_weight: number;
  profile_completeness_weight: number;
  updated_at: string;
  updated_by: string | null;
}

// ─── API Types ───────────────────────────────────────────────────

export interface CompatibilityMatchResult {
  user_id: string;
  first_name: string;
  last_name: string;
  age: number | null;
  avatar_url: string | null;
  city: string | null;
  final_score: number;
  explanation: MatchExplanation;
  dealbreakers_passed: boolean;
  shared_event_count: number;
  // Premium-only fields
  premium_breakdown?: PremiumCompatibilityBreakdown;
}

export interface MatchesListResponse {
  matches: CompatibilityMatchResult[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// ─── Form input types ────────────────────────────────────────────

export type CompatibilityProfileInput = Omit<CompatibilityProfile, "user_id" | "created_at" | "updated_at">;
export type DealbreakerPreferencesInput = Omit<DealbreakerPreferences, "user_id" | "created_at" | "updated_at">;
export type EventFeedbackInput = Omit<EventFeedback, "id" | "user_id" | "created_at">;
export type DateRatingInput = Omit<DateRating, "id" | "from_user_id" | "created_at">;
export type ProfileLifeAlignmentInput = Partial<ProfileLifeAlignment>;
