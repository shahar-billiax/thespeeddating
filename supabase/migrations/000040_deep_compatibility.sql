-- Deep Compatibility Matchmaking System
-- Adds extended profiling, psychological assessment, dealbreakers,
-- event ratings, taste learning, and cached compatibility scoring.

-- ═══════════════════════════════════════════════════════════════
-- 1. EXTEND PROFILES — Life Alignment Data (Section A)
-- ═══════════════════════════════════════════════════════════════

-- Note: profiles.faith already exists for basic religion text.
-- We reuse it and add structured fields alongside it.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS religion_importance smallint CHECK (religion_importance BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS practice_frequency text CHECK (practice_frequency IN ('daily', 'weekly', 'occasionally', 'rarely')),
  ADD COLUMN IF NOT EXISTS wants_children text CHECK (wants_children IN ('yes', 'no', 'open')),
  ADD COLUMN IF NOT EXISTS children_timeline text CHECK (children_timeline IN ('soon', '2_3_years', 'flexible')),
  ADD COLUMN IF NOT EXISTS career_ambition smallint CHECK (career_ambition BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS work_life_philosophy smallint CHECK (work_life_philosophy BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS education_level smallint CHECK (education_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS profession_category text,
  ADD COLUMN IF NOT EXISTS personal_description text,
  ADD COLUMN IF NOT EXISTS partner_expectations text,
  ADD COLUMN IF NOT EXISTS marriage_vision text;

-- Indexes for dealbreaker filtering
CREATE INDEX IF NOT EXISTS idx_profiles_faith ON profiles(faith);
CREATE INDEX IF NOT EXISTS idx_profiles_wants_children ON profiles(wants_children);
CREATE INDEX IF NOT EXISTS idx_profiles_dob ON profiles(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_profiles_education_level ON profiles(education_level);

-- ═══════════════════════════════════════════════════════════════
-- 2. COMPATIBILITY PROFILES — 20-Question Assessment (Section B)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE compatibility_profiles (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Emotional Style (q1-q4)
  emotional_expressiveness smallint NOT NULL CHECK (emotional_expressiveness BETWEEN 1 AND 5),
  conflict_approach smallint NOT NULL CHECK (conflict_approach BETWEEN 1 AND 5),
  need_for_reassurance smallint NOT NULL CHECK (need_for_reassurance BETWEEN 1 AND 5),
  stress_reaction smallint NOT NULL CHECK (stress_reaction BETWEEN 1 AND 5),

  -- Lifestyle & Energy (q5-q8)
  lifestyle_pace smallint NOT NULL CHECK (lifestyle_pace BETWEEN 1 AND 5),
  social_energy smallint NOT NULL CHECK (social_energy BETWEEN 1 AND 5),
  weekend_preference smallint NOT NULL CHECK (weekend_preference BETWEEN 1 AND 5),
  structure_spontaneity smallint NOT NULL CHECK (structure_spontaneity BETWEEN 1 AND 5),

  -- Ambition & Growth (q9-q12)
  career_ambition_compat smallint NOT NULL CHECK (career_ambition_compat BETWEEN 1 AND 5),
  financial_goals smallint NOT NULL CHECK (financial_goals BETWEEN 1 AND 5),
  personal_growth_drive smallint NOT NULL CHECK (personal_growth_drive BETWEEN 1 AND 5),
  work_life_compat smallint NOT NULL CHECK (work_life_compat BETWEEN 1 AND 5),

  -- Family & Long-Term Vision (q13-q16)
  parenting_style smallint NOT NULL CHECK (parenting_style BETWEEN 1 AND 5),
  family_involvement smallint NOT NULL CHECK (family_involvement BETWEEN 1 AND 5),
  relationship_timeline smallint NOT NULL CHECK (relationship_timeline BETWEEN 1 AND 5),
  living_preference smallint NOT NULL CHECK (living_preference BETWEEN 1 AND 5),

  -- Communication & Bonding (q17-q20)
  conversation_depth smallint NOT NULL CHECK (conversation_depth BETWEEN 1 AND 5),
  affection_style smallint NOT NULL CHECK (affection_style BETWEEN 1 AND 5),
  decision_making_style smallint NOT NULL CHECK (decision_making_style BETWEEN 1 AND 5),
  need_for_novelty smallint NOT NULL CHECK (need_for_novelty BETWEEN 1 AND 5),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. DEALBREAKER PREFERENCES (Section C)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE dealbreaker_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  preferred_age_min smallint,
  preferred_age_max smallint,
  religion_must_match boolean NOT NULL DEFAULT false,
  acceptable_religions text[],  -- NULL = any, array = specific list
  must_want_children boolean NOT NULL DEFAULT false,
  min_education_level smallint CHECK (min_education_level BETWEEN 1 AND 5),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. EVENT FEEDBACK — Post-Event Global Rating
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE event_feedback (
  id serial PRIMARY KEY,
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  overall_satisfaction smallint NOT NULL CHECK (overall_satisfaction BETWEEN 1 AND 5),
  met_aligned_people boolean NOT NULL,
  would_attend_again boolean NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_feedback_event ON event_feedback(event_id);
CREATE INDEX idx_event_feedback_user ON event_feedback(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. DATE RATINGS — Per-Person Evaluation After Events
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE date_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  would_meet_again boolean NOT NULL,
  conversation_quality smallint NOT NULL CHECK (conversation_quality BETWEEN 1 AND 5),
  long_term_potential smallint NOT NULL CHECK (long_term_potential BETWEEN 1 AND 5),
  physical_chemistry smallint NOT NULL CHECK (physical_chemistry BETWEEN 1 AND 5),
  comfort_level smallint NOT NULL CHECK (comfort_level BETWEEN 1 AND 5),
  values_alignment smallint NOT NULL CHECK (values_alignment BETWEEN 1 AND 5),
  energy_compatibility smallint NOT NULL CHECK (energy_compatibility BETWEEN 1 AND 5),

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (event_id, from_user_id, to_user_id)
);

CREATE INDEX idx_date_ratings_event ON date_ratings(event_id);
CREATE INDEX idx_date_ratings_from ON date_ratings(from_user_id);
CREATE INDEX idx_date_ratings_to ON date_ratings(to_user_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. TASTE VECTORS — Learned Preferences from Ratings
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE taste_vectors (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Averaged traits of highly-rated dates
  avg_education_level real,
  avg_religion_importance real,
  avg_career_ambition real,
  avg_social_energy real,
  avg_lifestyle_pace real,
  avg_conversation_depth real,
  avg_affection_style real,
  avg_age_diff real,           -- average age difference of preferred matches
  sample_count integer NOT NULL DEFAULT 0,  -- how many ratings informed this

  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. COMPATIBILITY SCORES — Cached Mutual Match Scores
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE compatibility_scores (
  user_a uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Individual direction scores
  score_a_to_b real NOT NULL,
  score_b_to_a real NOT NULL,
  -- Final mutual score = sqrt(a_to_b * b_to_a)
  final_score real NOT NULL,

  -- Breakdown per scoring dimension (0-1 each)
  breakdown jsonb NOT NULL DEFAULT '{}',
  -- Example: {
  --   "life_alignment": 0.82,
  --   "psychological": 0.75,
  --   "chemistry": 0.50,
  --   "taste_fit": 0.60,
  --   "explanation": { ... }
  -- }

  computed_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (user_a, user_b),
  CHECK (user_a < user_b)  -- canonical ordering: smaller UUID first
);

CREATE INDEX idx_compat_scores_user_a ON compatibility_scores(user_a);
CREATE INDEX idx_compat_scores_user_b ON compatibility_scores(user_b);
CREATE INDEX idx_compat_scores_final ON compatibility_scores(final_score DESC);

-- ═══════════════════════════════════════════════════════════════
-- 8. MATCH WEIGHT CONFIG — Admin-Adjustable Scoring Weights
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE match_weight_config (
  id integer PRIMARY KEY DEFAULT 1,  -- singleton row
  life_alignment_weight real NOT NULL DEFAULT 0.30,
  psychological_weight real NOT NULL DEFAULT 0.25,
  chemistry_weight real NOT NULL DEFAULT 0.15,
  taste_learning_weight real NOT NULL DEFAULT 0.10,
  profile_completeness_weight real NOT NULL DEFAULT 0.05,
  -- Remaining 15% is reserved / implicit base score
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES profiles(id),

  CHECK (
    life_alignment_weight + psychological_weight + chemistry_weight +
    taste_learning_weight + profile_completeness_weight <= 1.0
  )
);

-- Seed default weights
INSERT INTO match_weight_config (id) VALUES (1);

-- ═══════════════════════════════════════════════════════════════
-- 9. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

-- compatibility_profiles
ALTER TABLE compatibility_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own compatibility profile"
  ON compatibility_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own compatibility profile"
  ON compatibility_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own compatibility profile"
  ON compatibility_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to compatibility profiles"
  ON compatibility_profiles FOR ALL USING (is_admin());

-- dealbreaker_preferences
ALTER TABLE dealbreaker_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own dealbreaker preferences"
  ON dealbreaker_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dealbreaker preferences"
  ON dealbreaker_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dealbreaker preferences"
  ON dealbreaker_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to dealbreaker preferences"
  ON dealbreaker_preferences FOR ALL USING (is_admin());

-- event_feedback
ALTER TABLE event_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own event feedback"
  ON event_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own event feedback"
  ON event_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own event feedback"
  ON event_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to event feedback"
  ON event_feedback FOR ALL USING (is_admin());

-- date_ratings
ALTER TABLE date_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own date ratings"
  ON date_ratings FOR SELECT USING (auth.uid() = from_user_id);
CREATE POLICY "Users can insert own date ratings"
  ON date_ratings FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update own date ratings"
  ON date_ratings FOR UPDATE USING (auth.uid() = from_user_id);
CREATE POLICY "Admins full access to date ratings"
  ON date_ratings FOR ALL USING (is_admin());

-- taste_vectors
ALTER TABLE taste_vectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own taste vector"
  ON taste_vectors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to taste vectors"
  ON taste_vectors FOR ALL USING (is_admin());

-- compatibility_scores (users can see scores involving themselves)
ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own compatibility scores"
  ON compatibility_scores FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Admins full access to compatibility scores"
  ON compatibility_scores FOR ALL USING (is_admin());

-- match_weight_config (admin-only)
ALTER TABLE match_weight_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access to match weight config"
  ON match_weight_config FOR ALL USING (is_admin());
