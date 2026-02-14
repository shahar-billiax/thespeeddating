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
const TEST_PASSWORD = "TestUser123!";

// Realistic test user data
const TEST_USERS = [
  // UK Males
  { first_name: "Daniel", last_name: "Cohen", gender: "male", dob: "1992-03-15", country: "gb", city: "London", occupation: "Software Engineer", education: "BSc Computer Science", relationship_status: "single", faith: "modern_orthodox" },
  { first_name: "Jonathan", last_name: "Levy", gender: "male", dob: "1988-07-22", country: "gb", city: "London", occupation: "Solicitor", education: "LLB Law", relationship_status: "single", faith: "traditional" },
  { first_name: "Adam", last_name: "Goldstein", gender: "male", dob: "1995-11-08", country: "gb", city: "Manchester", occupation: "Accountant", education: "ACA Qualified", relationship_status: "single", faith: "reform" },
  { first_name: "Michael", last_name: "Shapiro", gender: "male", dob: "1986-01-30", country: "gb", city: "London", occupation: "Doctor", education: "MBBS Medicine", relationship_status: "divorced", faith: "traditional" },
  { first_name: "Benjamin", last_name: "Rosen", gender: "male", dob: "1990-05-12", country: "gb", city: "Leeds", occupation: "Marketing Manager", education: "BA Marketing", relationship_status: "single", faith: "liberal" },
  { first_name: "Samuel", last_name: "Friedman", gender: "male", dob: "1993-09-25", country: "gb", city: "London", occupation: "Investment Analyst", education: "MSc Finance", relationship_status: "single", faith: "modern_orthodox" },
  { first_name: "David", last_name: "Katz", gender: "male", dob: "1985-04-18", country: "gb", city: "Birmingham", occupation: "Architect", education: "MArch Architecture", relationship_status: "separated", faith: "traditional" },
  // UK Females
  { first_name: "Sarah", last_name: "Bernstein", gender: "female", dob: "1994-06-20", country: "gb", city: "London", occupation: "Teacher", education: "PGCE Education", relationship_status: "single", faith: "modern_orthodox" },
  { first_name: "Rebecca", last_name: "Weiss", gender: "female", dob: "1991-12-05", country: "gb", city: "London", occupation: "Graphic Designer", education: "BA Design", relationship_status: "single", faith: "reform" },
  { first_name: "Hannah", last_name: "Abrahams", gender: "female", dob: "1989-08-14", country: "gb", city: "Manchester", occupation: "Physiotherapist", education: "BSc Physiotherapy", relationship_status: "single", faith: "traditional" },
  { first_name: "Rachel", last_name: "Green", gender: "female", dob: "1996-02-28", country: "gb", city: "London", occupation: "Junior Doctor", education: "MBBS Medicine", relationship_status: "single", faith: "modern_orthodox" },
  { first_name: "Emma", last_name: "Silver", gender: "female", dob: "1987-10-11", country: "gb", city: "Leeds", occupation: "Barrister", education: "LLB Law", relationship_status: "divorced", faith: "liberal" },
  { first_name: "Olivia", last_name: "Klein", gender: "female", dob: "1993-03-07", country: "gb", city: "London", occupation: "Product Manager", education: "MBA", relationship_status: "single", faith: "traditional" },
  // Israel Males
  { first_name: "Yonatan", last_name: "Levi", gender: "male", dob: "1991-04-02", country: "il", city: "Tel Aviv", occupation: "Startup Founder", education: "BSc Computer Science", relationship_status: "single", faith: "secular" },
  { first_name: "Noam", last_name: "Mizrahi", gender: "male", dob: "1994-08-19", country: "il", city: "Jerusalem", occupation: "Teacher", education: "BA Education", relationship_status: "single", faith: "conservative" },
  { first_name: "Omer", last_name: "Ben-David", gender: "male", dob: "1989-12-30", country: "il", city: "Tel Aviv", occupation: "Lawyer", education: "LLB Law", relationship_status: "single", faith: "secular" },
  // Israel Females
  { first_name: "Noa", last_name: "Peretz", gender: "female", dob: "1993-05-16", country: "il", city: "Tel Aviv", occupation: "UX Designer", education: "BDes Design", relationship_status: "single", faith: "secular" },
  { first_name: "Shira", last_name: "Alon", gender: "female", dob: "1990-11-03", country: "il", city: "Jerusalem", occupation: "Social Worker", education: "MSW Social Work", relationship_status: "single", faith: "conservative" },
  { first_name: "Tamar", last_name: "Haim", gender: "female", dob: "1995-07-21", country: "il", city: "Haifa", occupation: "Chemical Engineer", education: "BSc Chemistry", relationship_status: "single", faith: "secular" },
  { first_name: "Maya", last_name: "Dahan", gender: "female", dob: "1992-01-09", country: "il", city: "Tel Aviv", occupation: "Marketing Director", education: "MBA", relationship_status: "divorced", faith: "conservative" },
];

async function main() {
  console.log(`Seeding ${TEST_USERS.length} test users...\n`);

  // Fetch countries and cities
  const { data: countries } = await supabase.from("countries").select("id, code");
  const { data: cities } = await supabase.from("cities").select("id, name, country_id");

  if (!countries || !cities) {
    console.error("Could not fetch countries/cities. Run seed.sql first.");
    process.exit(1);
  }

  const countryMap = Object.fromEntries(countries.map((c) => [c.code, c.id]));
  const cityMap = Object.fromEntries(cities.map((c) => [`${c.country_id}:${c.name}`, c.id]));

  let created = 0;
  let skipped = 0;

  for (const user of TEST_USERS) {
    const email = `test-${user.first_name.toLowerCase()}-${user.last_name.toLowerCase()}@test.thespeeddating.com`;
    const countryId = countryMap[user.country];
    const cityId = cityMap[`${countryId}:${user.city}`];

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        console.log(`  SKIP  ${email} (already exists)`);
        skipped++;
        continue;
      }
      console.error(`  FAIL  ${email}: ${authError.message}`);
      continue;
    }

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email,
      date_of_birth: user.dob,
      gender: user.gender,
      phone: `+44${Math.floor(7000000000 + Math.random() * 999999999)}`,
      occupation: user.occupation,
      education: user.education,
      relationship_status: user.relationship_status,
      faith: user.faith,
      country_id: countryId,
      city_id: cityId,
      bio: `Hi, I'm ${user.first_name}. I work as a ${user.occupation} and I'm looking forward to meeting new people!`,
      role: "member",
      is_active: true,
      admin_comments: TEST_MARKER,
    });

    if (profileError) {
      console.error(`  FAIL  ${email} profile: ${profileError.message}`);
      // Clean up the auth user if profile fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      continue;
    }

    console.log(`  OK    ${email} (${user.first_name} ${user.last_name}, ${user.gender}, ${user.city})`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
  console.log(`All test users have password: ${TEST_PASSWORD}`);
  console.log(`All test users are tagged with admin_comments = "${TEST_MARKER}"`);
  console.log(`Run 'pnpm cleanup:test-users' to remove them.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
