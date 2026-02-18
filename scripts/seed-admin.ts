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

async function main() {
  const email = "admin@thespeeddating.co.uk";
  const password = "admin123456";

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("Admin user already exists, skipping.");
      return;
    }
    throw authError;
  }

  const userId = authData.user.id;

  // Get UK country
  const { data: country } = await supabase
    .from("countries")
    .select("id")
    .eq("code", "gb")
    .single();

  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("name", "London")
    .single();

  // Create admin profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    first_name: "Admin",
    last_name: "User",
    email,
    date_of_birth: "1990-01-01",
    gender: "male",
    role: "admin",
    country_id: country?.id,
    city_id: city?.id,
  });

  if (profileError) throw profileError;

  console.log(`Admin user created: ${email} / ${password}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
