import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── HELPERS ─────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── PERSONALITY ARCHETYPES ──────────────────────────
// Each archetype defines a personality "fingerprint" for the 20 compatibility questions.
// This creates realistic variance — users within the same archetype will cluster,
// and matches between compatible archetypes will score higher.

interface Archetype {
  name: string;
  emotional_expressiveness: number;
  conflict_approach: number;
  need_for_reassurance: number;
  stress_reaction: number;
  lifestyle_pace: number;
  social_energy: number;
  weekend_preference: number;
  structure_spontaneity: number;
  career_ambition_compat: number;
  financial_goals: number;
  personal_growth_drive: number;
  work_life_compat: number;
  parenting_style: number;
  family_involvement: number;
  relationship_timeline: number;
  living_preference: number;
  conversation_depth: number;
  affection_style: number;
  decision_making_style: number;
  need_for_novelty: number;
}

const ARCHETYPES: Record<string, Archetype> = {
  // Traditional family-focused, religious, settled
  traditional_settler: {
    name: "Traditional Settler",
    emotional_expressiveness: 3,
    conflict_approach: 3,
    need_for_reassurance: 3,
    stress_reaction: 2,
    lifestyle_pace: 2,
    social_energy: 3,
    weekend_preference: 2,
    structure_spontaneity: 2,
    career_ambition_compat: 3,
    financial_goals: 3,
    personal_growth_drive: 3,
    work_life_compat: 2,
    parenting_style: 4,
    family_involvement: 4,
    relationship_timeline: 4,
    living_preference: 3,
    conversation_depth: 3,
    affection_style: 3,
    decision_making_style: 3,
    need_for_novelty: 2,
  },
  // Ambitious career-driven, city life, modern
  ambitious_modern: {
    name: "Ambitious Modern",
    emotional_expressiveness: 3,
    conflict_approach: 4,
    need_for_reassurance: 2,
    stress_reaction: 3,
    lifestyle_pace: 4,
    social_energy: 4,
    weekend_preference: 4,
    structure_spontaneity: 3,
    career_ambition_compat: 5,
    financial_goals: 5,
    personal_growth_drive: 5,
    work_life_compat: 4,
    parenting_style: 3,
    family_involvement: 2,
    relationship_timeline: 2,
    living_preference: 5,
    conversation_depth: 4,
    affection_style: 3,
    decision_making_style: 4,
    need_for_novelty: 4,
  },
  // Warm, nurturing, family first, emotionally open
  nurturing_warmth: {
    name: "Nurturing Warmth",
    emotional_expressiveness: 5,
    conflict_approach: 2,
    need_for_reassurance: 4,
    stress_reaction: 3,
    lifestyle_pace: 2,
    social_energy: 3,
    weekend_preference: 3,
    structure_spontaneity: 2,
    career_ambition_compat: 2,
    financial_goals: 2,
    personal_growth_drive: 3,
    work_life_compat: 1,
    parenting_style: 3,
    family_involvement: 5,
    relationship_timeline: 4,
    living_preference: 3,
    conversation_depth: 4,
    affection_style: 5,
    decision_making_style: 2,
    need_for_novelty: 2,
  },
  // Adventurous, spontaneous, social butterfly
  adventurous_free: {
    name: "Adventurous Free Spirit",
    emotional_expressiveness: 4,
    conflict_approach: 3,
    need_for_reassurance: 2,
    stress_reaction: 2,
    lifestyle_pace: 5,
    social_energy: 5,
    weekend_preference: 5,
    structure_spontaneity: 5,
    career_ambition_compat: 3,
    financial_goals: 2,
    personal_growth_drive: 4,
    work_life_compat: 3,
    parenting_style: 1,
    family_involvement: 2,
    relationship_timeline: 1,
    living_preference: 5,
    conversation_depth: 3,
    affection_style: 4,
    decision_making_style: 2,
    need_for_novelty: 5,
  },
  // Deep thinker, introverted, values depth
  intellectual_deep: {
    name: "Intellectual Deep",
    emotional_expressiveness: 2,
    conflict_approach: 4,
    need_for_reassurance: 2,
    stress_reaction: 2,
    lifestyle_pace: 2,
    social_energy: 1,
    weekend_preference: 2,
    structure_spontaneity: 2,
    career_ambition_compat: 4,
    financial_goals: 3,
    personal_growth_drive: 5,
    work_life_compat: 3,
    parenting_style: 3,
    family_involvement: 2,
    relationship_timeline: 3,
    living_preference: 4,
    conversation_depth: 5,
    affection_style: 2,
    decision_making_style: 4,
    need_for_novelty: 3,
  },
  // Balanced, flexible, easygoing
  balanced_easygoing: {
    name: "Balanced Easygoing",
    emotional_expressiveness: 3,
    conflict_approach: 3,
    need_for_reassurance: 3,
    stress_reaction: 2,
    lifestyle_pace: 3,
    social_energy: 3,
    weekend_preference: 3,
    structure_spontaneity: 3,
    career_ambition_compat: 3,
    financial_goals: 3,
    personal_growth_drive: 3,
    work_life_compat: 3,
    parenting_style: 3,
    family_involvement: 3,
    relationship_timeline: 3,
    living_preference: 3,
    conversation_depth: 3,
    affection_style: 3,
    decision_making_style: 3,
    need_for_novelty: 3,
  },
};

// Map user names to archetypes for consistent personality assignment
const USER_ARCHETYPE_MAP: Record<string, string> = {
  // Basic test users
  Daniel: "ambitious_modern",
  Jonathan_Levy: "traditional_settler",
  Adam: "balanced_easygoing",
  Michael: "intellectual_deep",
  Benjamin: "adventurous_free",
  Samuel: "ambitious_modern",
  David: "traditional_settler",
  Sarah: "traditional_settler",
  Rebecca: "adventurous_free",
  Hannah: "nurturing_warmth",
  Rachel: "ambitious_modern",
  Emma: "intellectual_deep",
  Olivia: "ambitious_modern",
  Yonatan: "adventurous_free",
  Noam: "nurturing_warmth",
  Omer: "intellectual_deep",
  Noa: "adventurous_free",
  Shira: "nurturing_warmth",
  Tamar: "ambitious_modern",
  Maya: "balanced_easygoing",
  // Anime test users
  Jonathan_Joestar: "traditional_settler",
  Joseph: "adventurous_free",
  Jotaro: "intellectual_deep",
  Josuke: "nurturing_warmth",
  Bruno: "traditional_settler",
  Lisa: "ambitious_modern",
  Jolyne: "adventurous_free",
  Trish: "ambitious_modern",
  Luffy: "adventurous_free",
  Zoro: "intellectual_deep",
  Sanji: "nurturing_warmth",
  Nami: "ambitious_modern",
  Robin: "intellectual_deep",
  Vivi: "nurturing_warmth",
  Ichigo: "balanced_easygoing",
  Uryu: "intellectual_deep",
  Renji: "adventurous_free",
  Toshiro: "intellectual_deep",
  Orihime: "nurturing_warmth",
  Rukia: "traditional_settler",
  Rangiku: "adventurous_free",
  Yoruichi: "adventurous_free",
};

// Life alignment data per archetype
const LIFE_ALIGNMENT: Record<string, {
  religion_importance: number;
  practice_frequency: string;
  wants_children: string;
  children_timeline: string | null;
  career_ambition: number;
  work_life_philosophy: number;
  education_level: number;
  personal_description: string;
  partner_expectations: string;
  marriage_vision: string;
}> = {
  traditional_settler: {
    religion_importance: 4,
    practice_frequency: "weekly",
    wants_children: "yes",
    children_timeline: "soon",
    career_ambition: 3,
    work_life_philosophy: 2,
    education_level: 4,
    personal_description: "Grounded and family-oriented. I value traditions and building a stable home.",
    partner_expectations: "Someone who shares my values and wants to build a family together. Kindness and loyalty are essential.",
    marriage_vision: "A warm home filled with love, Shabbat dinners, and raising children who carry our traditions forward.",
  },
  ambitious_modern: {
    religion_importance: 2,
    practice_frequency: "occasionally",
    wants_children: "open",
    children_timeline: "2_3_years",
    career_ambition: 5,
    work_life_philosophy: 4,
    education_level: 5,
    personal_description: "Driven and goal-oriented. I love the energy of city life and pushing myself to grow.",
    partner_expectations: "Someone equally ambitious who understands long hours but also knows how to switch off and enjoy life.",
    marriage_vision: "A power couple supporting each other's dreams while building an exciting life together.",
  },
  nurturing_warmth: {
    religion_importance: 3,
    practice_frequency: "occasionally",
    wants_children: "yes",
    children_timeline: "soon",
    career_ambition: 2,
    work_life_philosophy: 1,
    education_level: 3,
    personal_description: "Caring, empathetic, and always putting others first. I find joy in making people feel loved.",
    partner_expectations: "Someone genuine and emotionally available. I need a partner who values connection and family.",
    marriage_vision: "A loving home where everyone feels safe and supported. Family always comes first.",
  },
  adventurous_free: {
    religion_importance: 1,
    practice_frequency: "rarely",
    wants_children: "open",
    children_timeline: "flexible",
    career_ambition: 3,
    work_life_philosophy: 3,
    education_level: 3,
    personal_description: "Life is an adventure! I love trying new things, travelling, and meeting people from all walks of life.",
    partner_expectations: "Someone spontaneous who's up for anything. Curiosity and a sense of humour are must-haves.",
    marriage_vision: "A partnership of equals who explore the world together and never stop having fun.",
  },
  intellectual_deep: {
    religion_importance: 2,
    practice_frequency: "rarely",
    wants_children: "open",
    children_timeline: "2_3_years",
    career_ambition: 4,
    work_life_philosophy: 3,
    education_level: 5,
    personal_description: "Thoughtful and introspective. I value deep conversations and continuous learning.",
    partner_expectations: "An intellectually curious partner who enjoys debating ideas and exploring philosophical questions.",
    marriage_vision: "A meeting of minds — two people growing together through shared learning and meaningful conversation.",
  },
  balanced_easygoing: {
    religion_importance: 3,
    practice_frequency: "occasionally",
    wants_children: "yes",
    children_timeline: "flexible",
    career_ambition: 3,
    work_life_philosophy: 3,
    education_level: 4,
    personal_description: "Flexible and easy to get along with. I go with the flow and find happiness in simple things.",
    partner_expectations: "Someone genuine and kind. No drama — just real connection and mutual respect.",
    marriage_vision: "A balanced partnership where we support each other and enjoy a calm, happy life together.",
  },
};

// Dealbreaker preferences per archetype
const DEALBREAKER_MAP: Record<string, {
  preferred_age_min_offset: number;
  preferred_age_max_offset: number;
  religion_must_match: boolean;
  acceptable_religions: string[] | null;
  must_want_children: boolean;
  min_education_level: number | null;
}> = {
  traditional_settler: {
    preferred_age_min_offset: -3,
    preferred_age_max_offset: 5,
    religion_must_match: true,
    acceptable_religions: ["modern_orthodox", "traditional", "conservative"],
    must_want_children: true,
    min_education_level: 3,
  },
  ambitious_modern: {
    preferred_age_min_offset: -5,
    preferred_age_max_offset: 3,
    religion_must_match: false,
    acceptable_religions: null,
    must_want_children: false,
    min_education_level: 4,
  },
  nurturing_warmth: {
    preferred_age_min_offset: -2,
    preferred_age_max_offset: 8,
    religion_must_match: false,
    acceptable_religions: null,
    must_want_children: true,
    min_education_level: null,
  },
  adventurous_free: {
    preferred_age_min_offset: -5,
    preferred_age_max_offset: 5,
    religion_must_match: false,
    acceptable_religions: null,
    must_want_children: false,
    min_education_level: null,
  },
  intellectual_deep: {
    preferred_age_min_offset: -3,
    preferred_age_max_offset: 5,
    religion_must_match: false,
    acceptable_religions: null,
    must_want_children: false,
    min_education_level: 4,
  },
  balanced_easygoing: {
    preferred_age_min_offset: -4,
    preferred_age_max_offset: 6,
    religion_must_match: false,
    acceptable_religions: null,
    must_want_children: false,
    min_education_level: null,
  },
};

// Profession categories
const PROFESSION_MAP: Record<string, string> = {
  "Software Engineer": "tech",
  "Solicitor": "legal",
  "Accountant": "finance",
  "Doctor": "medical",
  "Marketing Manager": "business",
  "Investment Analyst": "finance",
  "Architect": "creative",
  "Teacher": "education",
  "Graphic Designer": "creative",
  "Physiotherapist": "medical",
  "Junior Doctor": "medical",
  "Barrister": "legal",
  "Product Manager": "tech",
  "Startup Founder": "tech",
  "Lawyer": "legal",
  "UX Designer": "creative",
  "Social Worker": "social",
  "Chemical Engineer": "science",
  "Marketing Director": "business",
  "Archaeologist": "academic",
  "Real Estate Developer": "business",
  "Marine Biologist": "science",
  "Head Chef": "hospitality",
  "Meteorologist": "science",
  "Archaeologist & Historian": "academic",
  "Diplomat (UN Junior Associate)": "government",
  "Emergency Medicine Doctor": "medical",
  "Fashion Designer": "creative",
  "Police Officer": "public_service",
  "Cybersecurity Analyst": "tech",
  "Pastry Chef": "hospitality",
  "Art Gallery Curator": "creative",
  "PR & Events Manager": "business",
  "Athletic Coach": "sports",
  "Kendo Instructor": "sports",
  "Martial Arts Instructor": "sports",
  "Criminal Defence Lawyer": "legal",
  "Fashion Stylist": "creative",
  "Restaurant Owner": "hospitality",
};

// ─── MAIN ────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Compatibility System Seed Data                  ║");
  console.log("║  Life Alignment • Assessment • Dealbreakers      ║");
  console.log("║  Event Feedback • Date Ratings • Taste Vectors   ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // ── 1. FIND ALL TEST USERS ──
  console.log("━━━ Finding test users ━━━\n");

  const { data: testUsers } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, gender, date_of_birth, faith, occupation, admin_comments")
    .or("admin_comments.eq.[TEST_USER],admin_comments.eq.[ANIME_TEST]")
    .eq("is_active", true);

  // Also find admin user
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, gender, date_of_birth, faith, occupation, role")
    .eq("role", "admin")
    .limit(1)
    .single();

  const allUsers = [...(testUsers ?? [])];
  if (adminProfile) {
    allUsers.push({ ...adminProfile, admin_comments: "admin" });
    console.log(`  Found admin: ${adminProfile.first_name} ${adminProfile.last_name}`);
  }

  console.log(`  Found ${testUsers?.length ?? 0} test users + ${adminProfile ? 1 : 0} admin = ${allUsers.length} total\n`);

  if (allUsers.length === 0) {
    console.error("No test users found. Run seed:test-users and/or seed:matching-test first.");
    process.exit(1);
  }

  // ── 2. UPDATE PROFILES WITH LIFE ALIGNMENT ──
  console.log("━━━ Updating profiles with life alignment data ━━━\n");
  let profilesUpdated = 0;

  for (const user of allUsers) {
    const archetypeKey = getArchetypeKey(user);
    const archetype = ARCHETYPES[archetypeKey];
    const lifeData = LIFE_ALIGNMENT[archetypeKey];
    const profCategory = PROFESSION_MAP[user.occupation ?? ""] || "other";

    const { error } = await supabase
      .from("profiles")
      .update({
        religion_importance: lifeData.religion_importance,
        practice_frequency: lifeData.practice_frequency,
        wants_children: lifeData.wants_children,
        children_timeline: lifeData.children_timeline,
        career_ambition: lifeData.career_ambition,
        work_life_philosophy: lifeData.work_life_philosophy,
        education_level: lifeData.education_level,
        profession_category: profCategory,
        personal_description: lifeData.personal_description,
        partner_expectations: lifeData.partner_expectations,
        marriage_vision: lifeData.marriage_vision,
      })
      .eq("id", user.id);

    if (error) {
      console.error(`  FAIL  ${user.first_name} ${user.last_name}: ${error.message}`);
    } else {
      profilesUpdated++;
    }
  }
  console.log(`  Updated ${profilesUpdated} profiles with life alignment data\n`);

  // ── 3. CREATE COMPATIBILITY PROFILES (20-question assessment) ──
  console.log("━━━ Creating compatibility profiles ━━━\n");
  let compatCreated = 0;

  for (const user of allUsers) {
    const archetypeKey = getArchetypeKey(user);
    const arch = ARCHETYPES[archetypeKey];

    // Add some noise (+-1) to the archetype values for realism
    const profile = {
      user_id: user.id,
      emotional_expressiveness: clamp(arch.emotional_expressiveness + rand(-1, 1)),
      conflict_approach: clamp(arch.conflict_approach + rand(-1, 1)),
      need_for_reassurance: clamp(arch.need_for_reassurance + rand(-1, 1)),
      stress_reaction: clamp(arch.stress_reaction + rand(-1, 1)),
      lifestyle_pace: clamp(arch.lifestyle_pace + rand(-1, 1)),
      social_energy: clamp(arch.social_energy + rand(-1, 1)),
      weekend_preference: clamp(arch.weekend_preference + rand(-1, 1)),
      structure_spontaneity: clamp(arch.structure_spontaneity + rand(-1, 1)),
      career_ambition_compat: clamp(arch.career_ambition_compat + rand(-1, 1)),
      financial_goals: clamp(arch.financial_goals + rand(-1, 1)),
      personal_growth_drive: clamp(arch.personal_growth_drive + rand(-1, 1)),
      work_life_compat: clamp(arch.work_life_compat + rand(-1, 1)),
      parenting_style: clamp(arch.parenting_style + rand(-1, 1)),
      family_involvement: clamp(arch.family_involvement + rand(-1, 1)),
      relationship_timeline: clamp(arch.relationship_timeline + rand(-1, 1)),
      living_preference: clamp(arch.living_preference + rand(-1, 1)),
      conversation_depth: clamp(arch.conversation_depth + rand(-1, 1)),
      affection_style: clamp(arch.affection_style + rand(-1, 1)),
      decision_making_style: clamp(arch.decision_making_style + rand(-1, 1)),
      need_for_novelty: clamp(arch.need_for_novelty + rand(-1, 1)),
    };

    const { error } = await supabase
      .from("compatibility_profiles")
      .upsert(profile, { onConflict: "user_id" });

    if (error) {
      console.error(`  FAIL  ${user.first_name}: ${error.message}`);
    } else {
      compatCreated++;
    }
  }
  console.log(`  Created ${compatCreated} compatibility profiles\n`);

  // ── 4. CREATE DEALBREAKER PREFERENCES ──
  console.log("━━━ Creating dealbreaker preferences ━━━\n");
  let dealbreakersCreated = 0;

  for (const user of allUsers) {
    const archetypeKey = getArchetypeKey(user);
    const dbPrefs = DEALBREAKER_MAP[archetypeKey];
    const userAge = user.date_of_birth
      ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 30;

    const prefs = {
      user_id: user.id,
      preferred_age_min: Math.max(21, userAge + dbPrefs.preferred_age_min_offset),
      preferred_age_max: Math.min(55, userAge + dbPrefs.preferred_age_max_offset),
      religion_must_match: dbPrefs.religion_must_match,
      acceptable_religions: dbPrefs.acceptable_religions,
      must_want_children: dbPrefs.must_want_children,
      min_education_level: dbPrefs.min_education_level,
    };

    const { error } = await supabase
      .from("dealbreaker_preferences")
      .upsert(prefs, { onConflict: "user_id" });

    if (error) {
      console.error(`  FAIL  ${user.first_name}: ${error.message}`);
    } else {
      dealbreakersCreated++;
    }
  }
  console.log(`  Created ${dealbreakersCreated} dealbreaker preferences\n`);

  // ── 5. CREATE EVENT FEEDBACK + DATE RATINGS ──
  console.log("━━━ Creating event feedback & date ratings ━━━\n");

  // Find events with registrations
  const { data: events } = await supabase
    .from("events")
    .select("id, event_date, description")
    .order("event_date", { ascending: false });

  if (!events || events.length === 0) {
    console.log("  No events found — skipping feedback/ratings.\n");
  } else {
    let feedbackCount = 0;
    let ratingCount = 0;

    for (const event of events) {
      // Get registrations for this event
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select("user_id")
        .eq("event_id", event.id)
        .eq("attended", true);

      if (!registrations || registrations.length < 2) continue;

      const attendeeIds = registrations.map((r) => r.user_id);
      const eventUsers = allUsers.filter((u) => attendeeIds.includes(u.id));

      if (eventUsers.length < 2) continue;

      console.log(`  Event ${event.id} (${event.event_date}): ${eventUsers.length} attendees`);

      // Create event feedback for ~70% of attendees
      for (const user of eventUsers) {
        if (Math.random() > 0.7) continue; // 30% skip feedback

        const archetypeKey = getArchetypeKey(user);
        const satisfaction = archetypeKey === "adventurous_free" ? rand(3, 5) : rand(2, 5);

        const { error } = await supabase
          .from("event_feedback")
          .upsert(
            {
              event_id: event.id,
              user_id: user.id,
              overall_satisfaction: satisfaction,
              met_aligned_people: satisfaction >= 3,
              would_attend_again: satisfaction >= 2,
            },
            { onConflict: "event_id,user_id" }
          );

        if (error) {
          if (!error.message.includes("duplicate")) {
            console.error(`    FEEDBACK FAIL ${user.first_name}: ${error.message}`);
          }
        } else {
          feedbackCount++;
        }
      }

      // Create date ratings between opposite-gender attendees
      const males = eventUsers.filter((u) => u.gender === "male");
      const females = eventUsers.filter((u) => u.gender === "female");

      for (const male of males) {
        for (const female of females) {
          // ~60% of pairs rate each other
          if (Math.random() > 0.6) continue;

          const maleArch = getArchetypeKey(male);
          const femaleArch = getArchetypeKey(female);

          // Compatible archetypes get higher ratings
          const isCompatible = areCompatibleArchetypes(maleArch, femaleArch);

          // Male rates female
          const maleRating = generateRating(isCompatible);
          const { error: mErr } = await supabase
            .from("date_ratings")
            .upsert(
              {
                event_id: event.id,
                from_user_id: male.id,
                to_user_id: female.id,
                ...maleRating,
              },
              { onConflict: "event_id,from_user_id,to_user_id" }
            );

          if (mErr) {
            if (!mErr.message.includes("duplicate")) {
              console.error(`    RATING FAIL ${male.first_name}→${female.first_name}: ${mErr.message}`);
            }
          } else {
            ratingCount++;
          }

          // Female rates male (slightly different scores)
          const femaleRating = generateRating(isCompatible);
          const { error: fErr } = await supabase
            .from("date_ratings")
            .upsert(
              {
                event_id: event.id,
                from_user_id: female.id,
                to_user_id: male.id,
                ...femaleRating,
              },
              { onConflict: "event_id,from_user_id,to_user_id" }
            );

          if (fErr) {
            if (!fErr.message.includes("duplicate")) {
              console.error(`    RATING FAIL ${female.first_name}→${male.first_name}: ${fErr.message}`);
            }
          } else {
            ratingCount++;
          }
        }
      }
    }

    console.log(`\n  Event feedback: ${feedbackCount}`);
    console.log(`  Date ratings: ${ratingCount}\n`);
  }

  // ── 6. COMPUTE TASTE VECTORS ──
  console.log("━━━ Computing taste vectors ━━━\n");
  let tasteVectorsCreated = 0;

  // Get all users who have submitted date ratings
  const { data: raters } = await supabase
    .from("date_ratings")
    .select("from_user_id");

  if (raters && raters.length > 0) {
    const uniqueRaterIds = [...new Set(raters.map((r: any) => r.from_user_id))];
    console.log(`  ${uniqueRaterIds.length} users have date ratings — computing taste vectors...\n`);

    for (const userId of uniqueRaterIds) {
      // Get positive ratings from this user
      const { data: ratings } = await supabase
        .from("date_ratings")
        .select("to_user_id, would_meet_again, conversation_quality, long_term_potential, physical_chemistry")
        .eq("from_user_id", userId);

      if (!ratings || ratings.length === 0) continue;

      const positiveRatings = ratings.filter(
        (r: any) =>
          r.would_meet_again ||
          r.conversation_quality >= 4 ||
          r.long_term_potential >= 4 ||
          r.physical_chemistry >= 4
      );

      if (positiveRatings.length < 2) continue;

      // Get profiles of positively-rated users
      const ratedIds = positiveRatings.map((r: any) => r.to_user_id);
      const { data: ratedProfiles } = await supabase
        .from("profiles")
        .select("id, date_of_birth, education_level, religion_importance, career_ambition")
        .in("id", ratedIds);

      const { data: ratedCompats } = await supabase
        .from("compatibility_profiles")
        .select("user_id, social_energy, lifestyle_pace, conversation_depth, affection_style")
        .in("user_id", ratedIds);

      if (!ratedProfiles || ratedProfiles.length === 0) continue;

      // Get rater's DOB for age diff calculation
      const { data: raterProfile } = await supabase
        .from("profiles")
        .select("date_of_birth")
        .eq("id", userId)
        .single();

      const raterAge = raterProfile?.date_of_birth
        ? Math.floor((Date.now() - new Date(raterProfile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
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

        if (raterAge && p.date_of_birth) {
          const ratedAge = Math.floor(
            (Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          );
          sumAge += ratedAge - raterAge;
          countAge++;
        }
      }

      const { error } = await supabase
        .from("taste_vectors")
        .upsert(
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

      if (error) {
        console.error(`  FAIL taste vector for ${userId}: ${error.message}`);
      } else {
        tasteVectorsCreated++;
      }
    }
  }
  console.log(`  Created ${tasteVectorsCreated} taste vectors\n`);

  // ── 7. COMPUTE COMPATIBILITY SCORES (sample pairs) ──
  console.log("━━━ Computing compatibility scores (sample pairs) ━━━\n");
  let scoresComputed = 0;

  // Get all users with compatibility profiles
  const { data: compatUsers } = await supabase
    .from("compatibility_profiles")
    .select("user_id");

  if (compatUsers && compatUsers.length >= 2) {
    const userIds = compatUsers.map((u: any) => u.user_id);

    // Compute scores between all opposite-gender pairs (limited to first 200 pairs)
    const maleUsers = allUsers.filter((u) => u.gender === "male" && userIds.includes(u.id));
    const femaleUsers = allUsers.filter((u) => u.gender === "female" && userIds.includes(u.id));

    console.log(`  Computing scores for ${maleUsers.length} males × ${femaleUsers.length} females...\n`);

    for (const male of maleUsers) {
      for (const female of femaleUsers) {
        // Canonical ordering: user_a < user_b
        const [userA, userB] = male.id < female.id ? [male, female] : [female, male];
        const maleArch = getArchetypeKey(male);
        const femaleArch = getArchetypeKey(female);
        const isCompat = areCompatibleArchetypes(maleArch, femaleArch);

        // Generate realistic scores based on archetype compatibility
        const baseScore = isCompat ? rand(60, 90) / 100 : rand(25, 60) / 100;
        const scoreAtoB = Math.min(1, Math.max(0, baseScore + (Math.random() * 0.1 - 0.05)));
        const scoreBtoA = Math.min(1, Math.max(0, baseScore + (Math.random() * 0.1 - 0.05)));
        const finalScore = Math.sqrt(scoreAtoB * scoreBtoA);

        const lifeAlignment = isCompat ? rand(60, 95) / 100 : rand(20, 55) / 100;
        const psychological = isCompat ? rand(55, 90) / 100 : rand(25, 60) / 100;
        const chemistry = rand(30, 80) / 100; // More random — based on events
        const tasteFit = rand(30, 70) / 100;

        // Build explanation
        const strengthFromScore = (score: number) =>
          score >= 0.85 ? "very_strong" : score >= 0.7 ? "strong" : score >= 0.5 ? "moderate" : score >= 0.3 ? "weak" : "mismatch";

        const explanation = {
          family_alignment: strengthFromScore(lifeAlignment),
          faith_compatibility: strengthFromScore(lifeAlignment * 0.9),
          emotional_balance: strengthFromScore(psychological),
          lifestyle_match: strengthFromScore(psychological * 0.95),
          ambition_alignment: strengthFromScore((lifeAlignment + psychological) / 2),
          communication_style: strengthFromScore(psychological),
          chemistry_signal: chemistry > 0.5 ? "positive" : "neutral",
          summary: isCompat
            ? `Strong alignment in values and lifestyle. ${finalScore > 0.7 ? "Excellent" : "Good"} compatibility across key dimensions.`
            : `Some differences in priorities and lifestyle. Areas of alignment exist but may require compromise.`,
        };

        const breakdown = {
          life_alignment: lifeAlignment,
          psychological,
          chemistry,
          taste_fit: tasteFit,
          profile_completeness: rand(70, 100) / 100,
          explanation,
        };

        const { error } = await supabase
          .from("compatibility_scores")
          .upsert(
            {
              user_a: userA.id,
              user_b: userB.id,
              score_a_to_b: scoreAtoB,
              score_b_to_a: scoreBtoA,
              final_score: finalScore,
              breakdown,
              computed_at: new Date().toISOString(),
            },
            { onConflict: "user_a,user_b" }
          );

        if (error) {
          if (!error.message.includes("duplicate")) {
            console.error(`  SCORE FAIL ${userA.first_name}↔${userB.first_name}: ${error.message}`);
          }
        } else {
          scoresComputed++;
        }
      }
    }
  }
  console.log(`  Computed ${scoresComputed} compatibility scores\n`);

  // ── SUMMARY ──
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Compatibility Seed Summary                      ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║  Profiles updated:      ${String(profilesUpdated).padStart(3)}                      ║`);
  console.log(`║  Compat profiles:       ${String(compatCreated).padStart(3)}                      ║`);
  console.log(`║  Dealbreaker prefs:     ${String(dealbreakersCreated).padStart(3)}                      ║`);
  console.log(`║  Taste vectors:         ${String(tasteVectorsCreated).padStart(3)}                      ║`);
  console.log(`║  Compatibility scores:  ${String(scoresComputed).padStart(3)}                      ║`);
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("\n━━━ Archetype Assignments ━━━\n");
  console.log("  Traditional Settler:   Jonathan Levy, David, Sarah, Bruno, Rukia");
  console.log("  Ambitious Modern:      Daniel, Samuel, Rachel, Olivia, Lisa, Trish, Nami, Tamar");
  console.log("  Nurturing Warmth:      Hannah, Josuke, Sanji, Vivi, Orihime, Noam, Shira");
  console.log("  Adventurous Free:      Benjamin, Rebecca, Joseph, Jolyne, Luffy, Renji, Rangiku, Yoruichi, Yonatan, Noa");
  console.log("  Intellectual Deep:     Michael, Emma, Jotaro, Zoro, Robin, Uryu, Toshiro, Omer");
  console.log("  Balanced Easygoing:    Adam, Ichigo, Maya");
  console.log("\n━━━ High-Compatibility Pairs ━━━\n");
  console.log("  Traditional ↔ Traditional: Jonathan Levy ↔ Sarah (shared values)");
  console.log("  Traditional ↔ Nurturing:   Bruno ↔ Vivi (stable + warm)");
  console.log("  Ambitious ↔ Ambitious:     Daniel ↔ Rachel (power couple)");
  console.log("  Intellectual ↔ Intellectual: Jotaro ↔ Robin (deep minds)");
  console.log("  Adventurous ↔ Adventurous:  Luffy ↔ Noa (free spirits)");
  console.log("  Balanced ↔ Any:            Ichigo (compatible with most)");
}

// ─── HELPER FUNCTIONS ────────────────────────────────

function getArchetypeKey(user: { first_name: string; last_name: string }): string {
  // Check specific full-name keys first (for disambiguation)
  const fullKey = `${user.first_name}_${user.last_name}`;
  if (USER_ARCHETYPE_MAP[fullKey]) return USER_ARCHETYPE_MAP[fullKey];

  // Then check first name
  if (USER_ARCHETYPE_MAP[user.first_name]) return USER_ARCHETYPE_MAP[user.first_name];

  // Default
  return "balanced_easygoing";
}

function clamp(value: number, min = 1, max = 5): number {
  return Math.max(min, Math.min(max, value));
}

function areCompatibleArchetypes(a: string, b: string): boolean {
  // Same archetype = high compatibility
  if (a === b) return true;

  const compatPairs = [
    ["traditional_settler", "nurturing_warmth"],
    ["ambitious_modern", "intellectual_deep"],
    ["adventurous_free", "balanced_easygoing"],
    ["balanced_easygoing", "nurturing_warmth"],
    ["balanced_easygoing", "traditional_settler"],
    ["balanced_easygoing", "ambitious_modern"],
    ["balanced_easygoing", "intellectual_deep"],
    ["intellectual_deep", "traditional_settler"],
  ];

  return compatPairs.some(
    ([x, y]) => (a === x && b === y) || (a === y && b === x)
  );
}

function generateRating(isCompatible: boolean) {
  if (isCompatible) {
    return {
      would_meet_again: Math.random() > 0.2,
      conversation_quality: rand(3, 5),
      long_term_potential: rand(3, 5),
      physical_chemistry: rand(2, 5),
      comfort_level: rand(3, 5),
      values_alignment: rand(3, 5),
      energy_compatibility: rand(3, 5),
    };
  }
  return {
    would_meet_again: Math.random() > 0.6,
    conversation_quality: rand(1, 4),
    long_term_potential: rand(1, 3),
    physical_chemistry: rand(1, 4),
    comfort_level: rand(2, 4),
    values_alignment: rand(1, 3),
    energy_compatibility: rand(1, 4),
  };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
