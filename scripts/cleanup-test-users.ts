import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_MARKER = "[TEST_USER]";

async function main() {
  console.log("Finding test users...\n");

  // Find all profiles tagged as test users
  const { data: testProfiles, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("admin_comments", TEST_MARKER);

  if (error) {
    console.error("Error fetching test profiles:", error.message);
    process.exit(1);
  }

  if (!testProfiles || testProfiles.length === 0) {
    console.log("No test users found. Nothing to clean up.");
    return;
  }

  console.log(`Found ${testProfiles.length} test users to remove:\n`);

  let deleted = 0;

  for (const profile of testProfiles) {
    // Deleting the auth user cascades to profiles (FK with ON DELETE CASCADE)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(profile.id);

    if (deleteError) {
      console.error(`  FAIL  ${profile.email}: ${deleteError.message}`);
      continue;
    }

    console.log(`  DEL   ${profile.email} (${profile.first_name} ${profile.last_name})`);
    deleted++;
  }

  console.log(`  ${deleted} test users removed.\n`);

  // Also clean up test events (tagged with [TEST_EVENT] in description)
  console.log("Finding test events...");
  const { data: testEvents } = await supabase
    .from("events")
    .select("id, event_date, description")
    .like("description", "%[TEST_EVENT]%");

  if (testEvents?.length) {
    for (const evt of testEvents) {
      // Delete registrations and matches first (no cascade on events)
      await supabase.from("event_registrations").delete().eq("event_id", evt.id);
      await supabase.from("match_results").delete().eq("event_id", evt.id);
      const { error: evtErr } = await supabase.from("events").delete().eq("id", evt.id);
      if (evtErr) {
        console.error(`  FAIL  Event ${evt.id}: ${evtErr.message}`);
      } else {
        console.log(`  DEL   Event ${evt.event_date} (id=${evt.id})`);
      }
    }
    console.log(`  ${testEvents.length} test events removed.`);
  } else {
    console.log("  No test events found.");
  }

  console.log("\nCleanup complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
