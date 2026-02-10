import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "fs";

config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function setupPagesTable() {
  console.log("🔧 Setting up pages table...\n");

  // Check if table already exists
  const { data: existing, error: checkError } = await supabase
    .from("pages")
    .select("id")
    .limit(1);

  if (!checkError) {
    console.log("✅ Pages table already exists!");
    return true;
  }

  console.log("📄 Creating pages table using raw SQL...");

  // Try using the postgres connection
  const migrationSQL = readFileSync("supabase/migrations/000025_pages.sql", "utf-8");

  // Since we can't execute raw SQL easily through the JS client,
  // let's create the table through the REST API directly
  console.log("\n⚠️  The pages table needs to be created manually.");
  console.log("\nPlease run ONE of these commands:\n");
  console.log("Option 1 (if Supabase CLI installed):");
  console.log("  supabase db reset\n");
  console.log("Option 2 (direct SQL):");
  console.log("  Connect to your database and run: supabase/migrations/000025_pages.sql\n");

  return false;
}

setupPagesTable()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
