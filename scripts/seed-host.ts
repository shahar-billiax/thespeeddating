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
  const email = "host@thespeeddating.co.uk";
  const password = "host123456";

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("Host user already exists, skipping auth creation.");
    } else {
      throw authError;
    }
  }

  const userId = authData?.user?.id ?? (await supabase.auth.admin.listUsers())
    .data.users.find((u) => u.email === email)?.id;

  if (!userId) {
    console.error("Could not find or create user");
    process.exit(1);
  }

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

  // Upsert host profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    first_name: "Hannah",
    last_name: "Host",
    email,
    date_of_birth: "1990-06-15",
    gender: "female",
    role: "host",
    country_id: country?.id,
    city_id: city?.id,
  });

  if (profileError) throw profileError;

  console.log(`\nHost user created:`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  URL:      http://localhost:3000/host`);
  console.log(`\nTo assign venues, log in as admin and go to /admin/venues/[id]`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
