/**
 * One-off script: fills in all fields required for 100% profile completion
 * on the admin@thespeeddating.co.uk account.
 *
 * Run with:
 *   npx tsx scripts/complete-admin-profile.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = "admin@thespeeddating.co.uk";

  // Look up the auth user id
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const authUser = users.find((u) => u.email === email);
  if (!authUser) {
    console.error(`User ${email} not found — run pnpm seed:admin first`);
    process.exit(1);
  }
  const userId = authUser.id;
  console.log(`Found admin user: ${userId}`);

  // 1. Fill missing profile fields (bio, occupation, faith, practice_frequency,
  //    wants_children, avatar_url).  Use upsert so it's safe to re-run.
  const { error: profileError } = await supabase.from("profiles").update({
    bio: "Platform administrator for TheSpeedDating.",
    occupation: "Administrator",
    faith: "Jewish",
    practice_frequency: "weekly",
    wants_children: "open",
    // Use a generic placeholder avatar that doesn't need Storage
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
  }).eq("id", userId);

  if (profileError) throw profileError;
  console.log("Profile fields updated.");

  // 2. Insert compatibility_profiles row (20 questions, all set to 3 = neutral)
  const { error: compatError } = await supabase
    .from("compatibility_profiles" as any)
    .upsert({
      user_id: userId,
      emotional_expressiveness: 3,
      conflict_approach: 3,
      need_for_reassurance: 3,
      stress_reaction: 3,
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
    }, { onConflict: "user_id" });

  if (compatError) throw compatError;
  console.log("Compatibility profile upserted.");

  // 3. Insert dealbreaker_preferences row (minimal / open preferences)
  const { error: dbError } = await supabase
    .from("dealbreaker_preferences" as any)
    .upsert({
      user_id: userId,
      preferred_age_min: 21,
      preferred_age_max: 55,
      religion_must_match: false,
      must_want_children: false,
    }, { onConflict: "user_id" });

  if (dbError) throw dbError;
  console.log("Dealbreaker preferences upserted.");

  console.log("\nDone — admin profile is now 100% complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
