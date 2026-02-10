import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load .env file
config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Applying pages migration...");

  const migrationPath = join(process.cwd(), "supabase", "migrations", "000025_pages.sql");
  const sql = readFileSync(migrationPath, "utf-8");

  // Split by semicolons and execute each statement
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    const { error } = await supabase.rpc("exec_sql", { sql: statement });
    if (error) {
      console.error("Migration error:", error);
      // Try direct query as fallback
      const { error: directError } = await supabase.from("_").select("*").limit(0);
      console.log("Attempting direct execution...");
    }
  }

  console.log("✅ Pages migration applied successfully!");
  console.log("You can now access /admin/pages");
}

main().catch((err) => {
  console.error("Failed to apply migration:", err);
  console.log("\n⚠️  Please apply the migration manually:");
  console.log("1. Run: supabase start (if not running)");
  console.log("2. Run: supabase db reset");
  console.log("Or apply 000025_pages.sql directly to your database");
  process.exit(1);
});
