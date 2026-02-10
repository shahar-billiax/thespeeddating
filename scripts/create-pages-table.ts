import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createPagesTable() {
  console.log("Creating pages table...");

  // Since we can't execute arbitrary SQL via the Supabase client easily,
  // let's just create a test page to verify the system works
  // The user will need to apply the migration manually

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .limit(1);

  if (error) {
    console.log("\n⚠️  Pages table does not exist yet.");
    console.log("\n📋 To create the pages table, please:");
    console.log("1. Make sure Supabase is running: docker ps (check for supabase containers)");
    console.log("2. Apply the migration:");
    console.log("   - If using Supabase CLI: supabase db reset");
    console.log("   - Or apply supabase/migrations/000025_pages.sql manually");
    console.log("\n📄 Migration file location: supabase/migrations/000025_pages.sql");
    return false;
  }

  console.log("✅ Pages table already exists!");
  return true;
}

createPagesTable();
