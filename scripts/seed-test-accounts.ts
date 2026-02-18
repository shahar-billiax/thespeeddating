/**
 * Seed Test Accounts at Different Compatibility Stages
 *
 * Creates accounts for manual testing of the entire compatibility flow:
 *
 * 1. admin@thespeeddating.co.uk — Admin user (full compatibility data + VIP)
 * 2. new@test.com — Brand new user (triggers onboarding redirect)
 * 3. partial1@test.com — Only life alignment completed (step 1 of 3)
 * 4. partial2@test.com — Life alignment + assessment (step 2 of 3)
 * 5. complete@test.com — Fully completed profile with matches
 * 6. vip@test.com — VIP user with full data (sees premium breakdown)
 *
 * All test passwords: Test1234!
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "Test1234!";

interface TestAccount {
  email: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  dob: string;
  faith: string | null;
  role: string;
  stage: "new" | "life_only" | "life_assessment" | "complete" | "vip";
}

const ACCOUNTS: TestAccount[] = [
  {
    email: "admin@thespeeddating.co.uk",
    firstName: "Admin",
    lastName: "User",
    gender: "male",
    dob: "1990-01-15",
    faith: "traditional",
    role: "admin",
    stage: "complete",
  },
  {
    email: "new@test.com",
    firstName: "New",
    lastName: "Member",
    gender: "female",
    dob: "1996-06-20",
    faith: null,
    role: "member",
    stage: "new",
  },
  {
    email: "partial1@test.com",
    firstName: "Sarah",
    lastName: "LifeOnly",
    gender: "female",
    dob: "1994-03-10",
    faith: "reform",
    role: "member",
    stage: "life_only",
  },
  {
    email: "partial2@test.com",
    firstName: "David",
    lastName: "TwoSteps",
    gender: "male",
    dob: "1991-11-25",
    faith: "conservative",
    role: "member",
    stage: "life_assessment",
  },
  {
    email: "complete@test.com",
    firstName: "Rachel",
    lastName: "Complete",
    gender: "female",
    dob: "1993-08-05",
    faith: "traditional",
    role: "member",
    stage: "complete",
  },
  {
    email: "vip@test.com",
    firstName: "Michael",
    lastName: "Premium",
    gender: "male",
    dob: "1989-04-12",
    faith: "orthodox",
    role: "member",
    stage: "vip",
  },
];

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Test Accounts Seed                              ║");
  console.log("║  Creating accounts at different stages            ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Get country and city IDs
  const { data: gbCountry } = await supabase
    .from("countries")
    .select("id")
    .eq("code", "gb")
    .single();

  const { data: londonCity } = await supabase
    .from("cities")
    .select("id")
    .eq("name", "London")
    .single();

  if (!gbCountry || !londonCity) {
    console.error("Could not find GB country or London city. Is seed data loaded?");
    process.exit(1);
  }

  const createdUserIds: Record<string, string> = {};

  // ── 1. CREATE AUTH USERS + PROFILES ──
  console.log("━━━ Creating auth users & profiles ━━━\n");

  for (const account of ACCOUNTS) {
    // Try to create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: PASSWORD,
      email_confirm: true,
    });

    let userId: string;

    if (authError) {
      if (authError.message.includes("already been registered")) {
        // Find existing user
        const { data: users } = await supabase.auth.admin.listUsers();
        const existing = users?.users?.find((u) => u.email === account.email);
        if (!existing) {
          console.error(`  SKIP ${account.email}: already registered but couldn't find user`);
          continue;
        }
        userId = existing.id;
        console.log(`  EXISTS ${account.email} (${userId.slice(0, 8)}...)`);
      } else {
        console.error(`  FAIL ${account.email}: ${authError.message}`);
        continue;
      }
    } else {
      userId = authData.user.id;
      console.log(`  CREATED ${account.email} (${userId.slice(0, 8)}...)`);
    }

    createdUserIds[account.email] = userId;

    // Upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        first_name: account.firstName,
        last_name: account.lastName,
        email: account.email,
        date_of_birth: account.dob,
        gender: account.gender,
        role: account.role,
        country_id: gbCountry.id,
        city_id: londonCity.id,
        is_active: true,
        faith: account.faith,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error(`  PROFILE FAIL ${account.email}: ${profileError.message}`);
    }
  }

  console.log("");

  // ── 2. SET LIFE ALIGNMENT DATA ──
  console.log("━━━ Setting life alignment data ━━━\n");

  const lifeAlignmentAccounts = ACCOUNTS.filter(
    (a) => a.stage !== "new"
  );

  for (const account of lifeAlignmentAccounts) {
    const userId = createdUserIds[account.email];
    if (!userId) continue;

    const { error } = await supabase
      .from("profiles")
      .update({
        religion_importance: account.stage === "vip" ? 5 : 3,
        practice_frequency: "weekly",
        has_children: false,
        wants_children: "yes",
        children_timeline: "2_3_years",
        career_ambition: account.stage === "vip" ? 5 : 4,
        work_life_philosophy: 3,
        education_level: account.stage === "vip" ? 5 : 4,
        profession_category: "Technology",
        personal_description: `I'm ${account.firstName}, a thoughtful person who values meaningful connections.`,
        partner_expectations: "Looking for someone kind, honest, and intellectually curious.",
        marriage_vision: "A partnership of equals built on shared values and mutual growth.",
      })
      .eq("id", userId);

    if (error) {
      console.error(`  FAIL life alignment ${account.email}: ${error.message}`);
    } else {
      console.log(`  OK ${account.email}`);
    }
  }

  console.log("");

  // ── 3. CREATE COMPATIBILITY PROFILES (20-question assessment) ──
  console.log("━━━ Creating compatibility assessments ━━━\n");

  const assessmentAccounts = ACCOUNTS.filter(
    (a) => a.stage === "life_assessment" || a.stage === "complete" || a.stage === "vip"
  );

  for (const account of assessmentAccounts) {
    const userId = createdUserIds[account.email];
    if (!userId) continue;

    // Give different personality profiles for variety
    const isVip = account.stage === "vip";
    const isAdmin = account.role === "admin";

    const { error } = await supabase.from("compatibility_profiles" as any).upsert(
      {
        user_id: userId,
        emotional_expressiveness: isVip ? 4 : 3,
        conflict_approach: isVip ? 4 : 3,
        need_for_reassurance: 3,
        stress_reaction: 2,
        lifestyle_pace: isAdmin ? 4 : 3,
        social_energy: isVip ? 5 : 3,
        weekend_preference: 4,
        structure_spontaneity: 3,
        career_ambition_compat: isVip ? 5 : 4,
        financial_goals: isVip ? 5 : 3,
        personal_growth_drive: 4,
        work_life_compat: 3,
        parenting_style: 3,
        family_involvement: isVip ? 4 : 3,
        relationship_timeline: isVip ? 4 : 3,
        living_preference: 4,
        conversation_depth: isVip ? 5 : 4,
        affection_style: 3,
        decision_making_style: isVip ? 4 : 3,
        need_for_novelty: 3,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error(`  FAIL assessment ${account.email}: ${error.message}`);
    } else {
      console.log(`  OK ${account.email}`);
    }
  }

  console.log("");

  // ── 4. CREATE DEALBREAKER PREFERENCES ──
  console.log("━━━ Creating dealbreaker preferences ━━━\n");

  const dealbreakerAccounts = ACCOUNTS.filter(
    (a) => a.stage === "complete" || a.stage === "vip"
  );

  for (const account of dealbreakerAccounts) {
    const userId = createdUserIds[account.email];
    if (!userId) continue;

    const isVip = account.stage === "vip";

    const { error } = await supabase.from("dealbreaker_preferences" as any).upsert(
      {
        user_id: userId,
        preferred_age_min: 25,
        preferred_age_max: 45,
        religion_must_match: isVip,
        acceptable_religions: isVip
          ? ["orthodox", "traditional", "conservative", "modern_orthodox"]
          : null,
        must_want_children: isVip,
        min_education_level: isVip ? 4 : null,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error(`  FAIL dealbreakers ${account.email}: ${error.message}`);
    } else {
      console.log(`  OK ${account.email}`);
    }
  }

  console.log("");

  // ── 5. CREATE VIP SUBSCRIPTION ──
  console.log("━━━ Setting up VIP subscription ━━━\n");

  const vipUserId = createdUserIds["vip@test.com"];
  if (vipUserId) {
    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from("vip_subscriptions")
      .select("id")
      .eq("user_id", vipUserId)
      .single();

    if (existingSub) {
      console.log(`  OK vip@test.com already has VIP subscription`);
    } else {
      const { error } = await supabase.from("vip_subscriptions").insert({
        user_id: vipUserId,
        plan_type: "12_month",
        price_per_month: 29.99,
        currency: "GBP",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error) {
        console.error(`  FAIL VIP subscription: ${error.message}`);
      } else {
        console.log(`  OK vip@test.com is now VIP`);
      }
    }
  }

  console.log("");

  // ── 6. COMPUTE COMPATIBILITY SCORES BETWEEN COMPLETE USERS ──
  console.log("━━━ Computing compatibility scores ━━━\n");

  const completeIds = dealbreakerAccounts
    .map((a) => createdUserIds[a.email])
    .filter(Boolean);

  // Also include any other users that have compatibility profiles
  const { data: existingCompat } = await supabase
    .from("compatibility_profiles" as any)
    .select("user_id");

  const allCompatUserIds = [
    ...new Set([
      ...completeIds,
      ...(existingCompat?.map((c: any) => c.user_id) ?? []),
    ]),
  ];

  console.log(`  ${allCompatUserIds.length} users have compatibility profiles`);

  // Get profiles for all users with compat data
  const { data: allProfiles } = await (supabase as any)
    .from("profiles")
    .select("id, gender, first_name, last_name, date_of_birth, faith, education_level, religion_importance, career_ambition, wants_children, has_children, work_life_philosophy")
    .in("id", allCompatUserIds);

  const { data: allCompat } = await supabase
    .from("compatibility_profiles" as any)
    .select("*")
    .in("user_id", allCompatUserIds);

  const { data: allDealbreakers } = await supabase
    .from("dealbreaker_preferences" as any)
    .select("*")
    .in("user_id", allCompatUserIds);

  const { data: allTaste } = await supabase
    .from("taste_vectors" as any)
    .select("*")
    .in("user_id", allCompatUserIds);

  if (allProfiles && allCompat) {
    const profileMap = new Map<string, any>();
    for (const p of allProfiles) profileMap.set(p.id, p);

    const compatMap = new Map<string, any>();
    for (const c of allCompat) compatMap.set(c.user_id, c);

    const dealMap = new Map<string, any>();
    for (const d of allDealbreakers ?? []) dealMap.set(d.user_id, d);

    const tasteMap = new Map<string, any>();
    for (const t of allTaste ?? []) tasteMap.set(t.user_id, t);

    let scored = 0;

    // Score each complete test user against all other users with compat profiles
    for (const userId of completeIds) {
      const myProfile = profileMap.get(userId);
      if (!myProfile) continue;

      for (const otherId of allCompatUserIds) {
        if (otherId === userId) continue;

        const otherProfile = profileMap.get(otherId);
        if (!otherProfile) continue;

        // Only match opposite genders (or same for testing)
        if (myProfile.gender === otherProfile.gender) continue;

        const [userA, userB] = userId < otherId ? [userId, otherId] : [otherId, userId];

        // Generate a score based on how similar their profiles are
        const myCompat = compatMap.get(userId);
        const otherCompat = compatMap.get(otherId);
        if (!myCompat || !otherCompat) continue;

        // Calculate real-ish scores from their personality data
        const psychDiffs = [
          Math.abs(myCompat.emotional_expressiveness - otherCompat.emotional_expressiveness),
          Math.abs(myCompat.conflict_approach - otherCompat.conflict_approach),
          Math.abs(myCompat.lifestyle_pace - otherCompat.lifestyle_pace),
          Math.abs(myCompat.social_energy - otherCompat.social_energy),
          Math.abs(myCompat.career_ambition_compat - otherCompat.career_ambition_compat),
          Math.abs(myCompat.conversation_depth - otherCompat.conversation_depth),
        ];
        const avgDiff = psychDiffs.reduce((a, b) => a + b, 0) / psychDiffs.length;
        const psychological = Math.max(0.1, 1 - avgDiff / 4);

        const faithMatch =
          myProfile.faith && otherProfile.faith && myProfile.faith === otherProfile.faith;
        const childrenMatch =
          myProfile.wants_children === otherProfile.wants_children;
        const lifeAlignment = (faithMatch ? 0.4 : 0.15) + (childrenMatch ? 0.3 : 0.1) + 0.2;

        const chemistry = 0.4 + Math.random() * 0.3;
        const tasteFit = 0.3 + Math.random() * 0.4;
        const profileCompleteness = 0.85;

        const scoreAtoB = 0.30 * lifeAlignment + 0.25 * psychological + 0.15 * chemistry + 0.10 * tasteFit + 0.05 * profileCompleteness + 0.15 * 0.5;
        const scoreBtoA = 0.30 * lifeAlignment + 0.25 * psychological + 0.15 * (chemistry + (Math.random() * 0.1 - 0.05)) + 0.10 * tasteFit + 0.05 * profileCompleteness + 0.15 * 0.5;
        const finalScore = Math.sqrt(scoreAtoB * scoreBtoA);

        const strengthFromScore = (s: number): string =>
          s >= 0.85 ? "very_strong" : s >= 0.7 ? "strong" : s >= 0.5 ? "moderate" : s >= 0.3 ? "weak" : "mismatch";

        const explanation = {
          family_alignment: strengthFromScore(lifeAlignment),
          faith_compatibility: strengthFromScore(faithMatch ? 0.9 : 0.3),
          emotional_balance: strengthFromScore(psychological),
          lifestyle_match: strengthFromScore(psychological * 0.9),
          ambition_alignment: strengthFromScore((lifeAlignment + psychological) / 2),
          communication_style: strengthFromScore(psychological * 0.95),
          chemistry_signal: chemistry > 0.5 ? "positive" : "neutral",
          summary: finalScore > 0.6
            ? `Strong alignment in key values. ${otherProfile.first_name} shares your approach to family and relationships.`
            : `Some areas of alignment with differences to explore. Communication and compromise will be important.`,
        };

        // Build premium breakdown for VIP testing
        const premiumBreakdown = {
          emotional_harmony: Math.round(psychological * 100),
          family_alignment: Math.round(lifeAlignment * 100),
          lifestyle_compatibility: Math.round((psychological * 0.9) * 100),
          ambition_alignment: Math.round(((lifeAlignment + psychological) / 2) * 100),
          communication_match: Math.round((psychological * 0.95) * 100),
          conflict_style_insight: psychological > 0.6
            ? `You and ${otherProfile.first_name} handle conflict in complementary ways — one tends to address issues directly while the other brings calm.`
            : `You may need to work on conflict resolution together — your styles differ significantly.`,
          long_term_stability_indicator: finalScore > 0.65 ? "high" : finalScore > 0.45 ? "moderate" : "developing",
        };

        const breakdown = {
          life_alignment: lifeAlignment,
          psychological,
          chemistry,
          taste_fit: tasteFit,
          profile_completeness: profileCompleteness,
          explanation,
          premium_breakdown: premiumBreakdown,
        };

        const { error } = await supabase.from("compatibility_scores" as any).upsert(
          {
            user_a: userA,
            user_b: userB,
            score_a_to_b: Math.min(1, Math.max(0, scoreAtoB)),
            score_b_to_a: Math.min(1, Math.max(0, scoreBtoA)),
            final_score: Math.min(1, Math.max(0, finalScore)),
            breakdown,
            computed_at: new Date().toISOString(),
          },
          { onConflict: "user_a,user_b" }
        );

        if (error) {
          if (!error.message.includes("duplicate")) {
            console.error(`  SCORE FAIL: ${error.message}`);
          }
        } else {
          scored++;
        }
      }
    }

    console.log(`  Computed ${scored} compatibility scores\n`);
  }

  // ── SUMMARY ──
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Test Accounts Ready                             ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log("║                                                  ║");
  console.log(`║  Password for all: ${PASSWORD}                   ║`);
  console.log("║                                                  ║");
  console.log("║  1. admin@thespeeddating.co.uk                   ║");
  console.log("║     Admin panel + full compatibility + matches    ║");
  console.log("║                                                  ║");
  console.log("║  2. new@test.com                                 ║");
  console.log("║     Brand new user → redirects to /onboarding    ║");
  console.log("║                                                  ║");
  console.log("║  3. partial1@test.com                            ║");
  console.log("║     Life alignment only (step 1/3)               ║");
  console.log("║     → /compatibility auto-focuses Assessment tab  ║");
  console.log("║                                                  ║");
  console.log("║  4. partial2@test.com                            ║");
  console.log("║     Life + Assessment (step 2/3)                  ║");
  console.log("║     → /compatibility auto-focuses Preferences tab ║");
  console.log("║                                                  ║");
  console.log("║  5. complete@test.com                            ║");
  console.log("║     Full profile + matches visible                ║");
  console.log("║     → /compatibility auto-focuses Matches tab     ║");
  console.log("║                                                  ║");
  console.log("║  6. vip@test.com                                 ║");
  console.log("║     VIP subscription + premium breakdown visible  ║");
  console.log("║     → sees detailed dimension %s on matches       ║");
  console.log("║                                                  ║");
  console.log("╚══════════════════════════════════════════════════╝");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
