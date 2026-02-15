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

const TEST_MARKER = "[ANIME_TEST]";
const TEST_PASSWORD = "OraOra123!";

// ─── AVATAR URLS ─────────────────────────────────────────
// Free-to-use placeholder portraits from UI Faces / randomuser-style services
// We use DiceBear API (open source, no auth) for deterministic avatar generation
function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

// ─── TEST USER DATA ──────────────────────────────────────
// Subtle anime references in names/bios — recognizable to fans but plausible as real names

interface TestUser {
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  dob: string;
  country: "gb" | "il";
  city: string;
  occupation: string;
  education: string;
  bio: string;
  interests: string;
  height_cm: number | null;
  instagram: string | null;
  avatar_seed: string | null; // null = no photo (edge case)
  faith: string;
  relationship_status: string;
  sexual_preference: string;
  anime: string; // which series they reference (for logging)
}

const TEST_USERS: TestUser[] = [
  // ═══ JOJO'S BIZARRE ADVENTURE ═══

  // UK Males
  {
    first_name: "Jonathan",
    last_name: "Joestar",
    gender: "male",
    dob: "1993-04-04",
    country: "gb",
    city: "London",
    occupation: "Archaeologist",
    education: "BA History & Archaeology",
    bio: "A gentleman at heart with a passion for history. I believe in treating everyone with dignity. Looking for someone who shares my values of honour and kindness.",
    interests: "History, Boxing, Wine, Antiques, Fencing",
    height_cm: 195,
    instagram: "jonathan.joestar",
    avatar_seed: "jonathan-joestar",
    faith: "traditional",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "JoJo",
  },
  {
    first_name: "Joseph",
    last_name: "Joestar",
    gender: "male",
    dob: "1990-09-27",
    country: "gb",
    city: "London",
    occupation: "Real Estate Developer",
    education: "MBA Business",
    bio: "Quick thinker, always one step ahead. I love travelling — New York, Rome, Cairo, you name it. Your next line is: 'Tell me more!' ...right?",
    interests: "Travel, Comedy, Martial Arts, Classic Cars, Strategy Games",
    height_cm: 193,
    instagram: "joseph.joestar",
    avatar_seed: "joseph-joestar",
    faith: "reform",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "JoJo",
  },
  {
    first_name: "Jotaro",
    last_name: "Kujo",
    gender: "male",
    dob: "1995-01-01",
    country: "gb",
    city: "London",
    occupation: "Marine Biologist",
    education: "PhD Marine Science",
    bio: "Quiet, focused, and passionate about ocean conservation. I don't talk much, but when I do, I mean it. Dolphins are underrated.",
    interests: "Marine Biology, Fishing, Travel, Astronomy, Reading",
    height_cm: 195,
    instagram: null,
    avatar_seed: "jotaro-kujo",
    faith: "secular",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "JoJo",
  },
  {
    first_name: "Josuke",
    last_name: "Higashida",
    gender: "male",
    dob: "1997-06-01",
    country: "gb",
    city: "Manchester",
    occupation: "Physiotherapist",
    education: "BSc Physiotherapy",
    bio: "I'm a healer by nature — love helping people feel their best. Great hair is non-negotiable. Don't touch it. Seriously. Let's grab Italian food!",
    interests: "Cooking, Fashion, Music, Gaming, Football",
    height_cm: 180,
    instagram: "josuke.h",
    avatar_seed: "josuke-higashida",
    faith: "liberal",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "JoJo",
  },
  {
    first_name: "Bruno",
    last_name: "Bucciarati",
    gender: "male",
    dob: "1991-09-27",
    country: "gb",
    city: "London",
    occupation: "Social Worker",
    education: "MSW Social Work",
    bio: "Devoted to my community and the people around me. I lead with empathy and integrity. Looking for someone genuine — I can always tell when someone's lying.",
    interests: "Community Work, Italian Cuisine, Art, Music, Hiking",
    height_cm: 178,
    instagram: "bruno.b",
    avatar_seed: "bruno-bucciarati",
    faith: "traditional",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "JoJo",
  },

  // UK Females (JoJo)
  {
    first_name: "Lisa",
    last_name: "Joseph",
    gender: "female",
    dob: "1992-12-10",
    country: "gb",
    city: "London",
    occupation: "Martial Arts Instructor",
    education: "BA Physical Education",
    bio: "Strong, independent, and always training. I've lived in Venice and London. Looking for someone who can keep up with me — physically and intellectually.",
    interests: "Martial Arts, Travel, Fashion, History, Swimming",
    height_cm: 175,
    instagram: "lisa.joseph",
    avatar_seed: "lisa-joseph",
    faith: "traditional",
    relationship_status: "divorced",
    sexual_preference: "men",
    anime: "JoJo",
  },
  {
    first_name: "Jolyne",
    last_name: "Cujo",
    gender: "female",
    dob: "1998-08-12",
    country: "gb",
    city: "London",
    occupation: "Criminal Defence Lawyer",
    education: "LLB Law",
    bio: "Fierce, determined, and not afraid to fight for what's right. Love butterflies, string art, and punk rock. My dad never calls, but that's fine.",
    interests: "Law, Music, Art, Butterflies, Rock Climbing",
    height_cm: 174,
    instagram: "jolyne.cujo",
    avatar_seed: "jolyne-cujo",
    faith: "secular",
    relationship_status: "single",
    sexual_preference: "men",
    anime: "JoJo",
  },
  {
    first_name: "Trish",
    last_name: "Unas",
    gender: "female",
    dob: "1999-06-08",
    country: "gb",
    city: "Manchester",
    occupation: "Fashion Stylist",
    education: "BA Fashion Design",
    bio: "Aspiring fashion icon with a dramatic past. Started from nothing, now building my own brand. I value loyalty and authenticity above everything.",
    interests: "Fashion, Pop Music, Shopping, Photography, Yoga",
    height_cm: 163,
    instagram: "trish.u",
    avatar_seed: null, // EDGE CASE: no photo
    faith: "liberal",
    relationship_status: "single",
    sexual_preference: "men",
    anime: "JoJo",
  },

  // ═══ ONE PIECE ═══

  // UK Males
  {
    first_name: "Luffy",
    last_name: "Monkey",
    gender: "male",
    dob: "1996-05-05",
    country: "gb",
    city: "London",
    occupation: "Restaurant Owner",
    education: "Self-taught Chef",
    bio: "I'm going to find the greatest restaurant in the world! Meat lover, eternal optimist, fiercely loyal to my friends. Straw hat is my lucky charm.",
    interests: "Food, Adventure, Boating, Wrestling, BBQ",
    height_cm: 174,
    instagram: "luffy.monkey",
    avatar_seed: "luffy-monkey",
    faith: "secular",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "One Piece",
  },
  {
    first_name: "Zoro",
    last_name: "Roronoa",
    gender: "male",
    dob: "1994-11-11",
    country: "gb",
    city: "London",
    occupation: "Kendo Instructor",
    education: "BA Sports Science",
    bio: "Three-time national kendo champion. I train hard, nap harder, and I'm always somehow lost. Looking for someone with direction — literally and figuratively.",
    interests: "Kendo, Weightlifting, Sake Tasting, Napping, Meditation",
    height_cm: 181,
    instagram: null,
    avatar_seed: "zoro-roronoa",
    faith: "secular",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "One Piece",
  },
  {
    first_name: "Sanji",
    last_name: "Vinsmoke",
    gender: "male",
    dob: "1993-03-02",
    country: "gb",
    city: "London",
    occupation: "Head Chef",
    education: "Le Cordon Bleu",
    bio: "Classically trained chef with a weakness for romance. I'll cook you the best meal of your life on our first date. Chivalry is not dead.",
    interests: "Cooking, Fine Dining, Wine, Kickboxing, Romance",
    height_cm: 180,
    instagram: "chef.sanji",
    avatar_seed: "sanji-vinsmoke",
    faith: "reform",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "One Piece",
  },

  // UK Females (One Piece)
  {
    first_name: "Nami",
    last_name: "Belmer",
    gender: "female",
    dob: "1995-07-03",
    country: "gb",
    city: "London",
    occupation: "Meteorologist",
    education: "MSc Atmospheric Science",
    bio: "I can predict the weather better than any app. Love maps, money management, and tangerine groves. Smart, resourceful, and no, you can't borrow any money.",
    interests: "Weather, Cartography, Finance, Sailing, Tangerines",
    height_cm: 170,
    instagram: "nami.weather",
    avatar_seed: "nami-belmer",
    faith: "secular",
    relationship_status: "single",
    sexual_preference: "men",
    anime: "One Piece",
  },
  {
    first_name: "Robin",
    last_name: "Nico",
    gender: "female",
    dob: "1990-02-06",
    country: "gb",
    city: "London",
    occupation: "Archaeologist & Historian",
    education: "PhD Ancient History",
    bio: "I've spent years studying lost civilisations and ancient texts. I have a dry sense of humour and a passion for uncovering the truth. I want to live.",
    interests: "Archaeology, Reading, Coffee, Languages, Museums",
    height_cm: 188,
    instagram: "robin.nico",
    avatar_seed: "robin-nico",
    faith: "liberal",
    relationship_status: "single",
    sexual_preference: "men",
    anime: "One Piece",
  },
  {
    first_name: "Vivi",
    last_name: "Nefertari",
    gender: "female",
    dob: "1996-02-02",
    country: "gb",
    city: "Manchester",
    occupation: "Diplomat (UN Junior Associate)",
    education: "MA International Relations",
    bio: "Passionate about peace and community building. Grew up with a lot of responsibility and learned to lead with compassion. My duck is named Carue.",
    interests: "Diplomacy, Horse Riding, Dancing, Volunteering, History",
    height_cm: 169,
    instagram: "vivi.n",
    avatar_seed: "vivi-nefertari",
    faith: "reform",
    relationship_status: "single",
    sexual_preference: "men",
    anime: "One Piece",
  },

  // ═══ BLEACH ═══

  // Israel Males
  {
    first_name: "Ichigo",
    last_name: "Kurosaki",
    gender: "male",
    dob: "1994-07-15",
    country: "il",
    city: "Tel Aviv",
    occupation: "Emergency Medicine Doctor",
    education: "MD Medicine",
    bio: "I protect the people I care about — it's just who I am. Working in A&E keeps me grounded. Despite the permanent scowl, I'm actually friendly.",
    interests: "Medicine, Shakespeare, Martial Arts, Guitar, Running",
    height_cm: 181,
    instagram: "ichigo.k",
    avatar_seed: "ichigo-kurosaki",
    faith: "secular",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "Bleach",
  },
  {
    first_name: "Uryu",
    last_name: "Ishida",
    gender: "male",
    dob: "1994-11-06",
    country: "il",
    city: "Tel Aviv",
    occupation: "Fashion Designer",
    education: "BDes Fashion",
    bio: "Precise, detail-oriented, and proud of my heritage. I sew all my own clothes. Top of my class, and I never miss — whether it's a stitch or a deadline.",
    interests: "Sewing, Archery, Medicine, Cross-stitch, Tailoring",
    height_cm: 177,
    instagram: "uryu.ishida",
    avatar_seed: "uryu-ishida",
    faith: "conservative",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "Bleach",
  },
  {
    first_name: "Renji",
    last_name: "Abarai",
    gender: "male",
    dob: "1992-08-31",
    country: "il",
    city: "Jerusalem",
    occupation: "Police Officer",
    education: "BA Criminology",
    bio: "Street-smart and ambitious. Worked my way up from nothing and proud of every scar. Loyal to a fault — once you're my friend, you're family.",
    interests: "Martial Arts, Tattoos, Hiking, Dogs, Rock Music",
    height_cm: 188,
    instagram: null,
    avatar_seed: null, // EDGE CASE: no photo
    faith: "traditional",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "Bleach",
  },
  {
    first_name: "Toshiro",
    last_name: "Hitsugaya",
    gender: "male",
    dob: "1999-12-20",
    country: "il",
    city: "Tel Aviv",
    occupation: "Cybersecurity Analyst",
    education: "BSc Computer Science",
    bio: "Yes, I look younger than I am. No, I don't want to hear about it. Youngest team lead at my company. I'm cool under pressure — literally.",
    interests: "Cybersecurity, Chess, Ice Hockey, Watermelon, Winter Sports",
    height_cm: 168,
    instagram: "toshiro.h",
    avatar_seed: "toshiro-hitsugaya",
    faith: "secular",
    relationship_status: "single",
    sexual_preference: "women",
    anime: "Bleach",
  },

  // Israel Females (Bleach)
  {
    first_name: "Orihime",
    last_name: "Inoue",
    gender: "female",
    dob: "1995-09-03",
    country: "il",
    city: "Tel Aviv",
    occupation: "Pastry Chef",
    education: "Culinary Arts Diploma",
    bio: "I believe in the power of kindness and red bean paste in everything. My cooking is... creative. I'll always be there to pick you up when you're down.",
    interests: "Baking, Creative Cooking, Healing Arts, Crafts, Stargazing",
    height_cm: 157,
    instagram: "orihime.i",
    avatar_seed: "orihime-inoue",
    faith: "conservative",
    relationship_status: "single",
    sexual_preference: "men",
    anime: "Bleach",
  },
  {
    first_name: "Rukia",
    last_name: "Kuchiki",
    gender: "female",
    dob: "1993-01-14",
    country: "il",
    city: "Jerusalem",
    occupation: "Art Gallery Curator",
    education: "MA Fine Arts",
    bio: "From humble beginnings to curating exhibits at major galleries. I draw terrible rabbits and I'm proud of it. Quiet dignity, fierce loyalty.",
    interests: "Art, Drawing, Climbing, Theatre, Juice Boxes",
    height_cm: 144,
    instagram: "rukia.kuchiki",
    avatar_seed: "rukia-kuchiki",
    faith: "traditional",
    relationship_status: "single",
    sexual_preference: "men",
    anime: "Bleach",
  },
  {
    first_name: "Rangiku",
    last_name: "Matsumoto",
    gender: "female",
    dob: "1991-09-29",
    country: "il",
    city: "Tel Aviv",
    occupation: "PR & Events Manager",
    education: "BA Communications",
    bio: "Life's too short to skip happy hour. I work hard and play harder. Procrastination is an art form, and I've mastered it. Let's go shopping!",
    interests: "Socialising, Wine, Shopping, Dancing, Travel",
    height_cm: 172,
    instagram: "rangiku.m",
    avatar_seed: "rangiku-matsumoto",
    faith: "secular",
    relationship_status: "divorced",
    sexual_preference: "men",
    anime: "Bleach",
  },
  {
    first_name: "Yoruichi",
    last_name: "Shihouin",
    gender: "female",
    dob: "1989-01-01",
    country: "il",
    city: "Tel Aviv",
    occupation: "Athletic Coach",
    education: "MSc Sports Science",
    bio: "Former national sprinter turned coach. I'm fast, mysterious, and love cats. I show up when you least expect it. Playful but fiercely protective.",
    interests: "Sprinting, Cats, Hot Springs, Mentoring, Pranks",
    height_cm: 156,
    instagram: "yoruichi.s",
    avatar_seed: "yoruichi-shihouin",
    faith: "secular",
    relationship_status: "single",
    sexual_preference: "men",
    anime: "Bleach",
  },
];

// ─── VENUES ──────────────────────────────────────────────

const TEST_VENUES = [
  {
    name: "The Star & Compass",
    address: "42 Great Russell Street",
    city: "London",
    country: "gb",
    venue_type: "bar",
    description: "Elegant cocktail bar in Bloomsbury with private event space",
  },
  {
    name: "The Northern Quarter Social",
    address: "15 Tib Street",
    city: "Manchester",
    country: "gb",
    venue_type: "bar",
    description: "Trendy bar in the heart of Manchester's NQ",
  },
  {
    name: "Café Dizengoff",
    address: "Dizengoff 78",
    city: "Tel Aviv",
    country: "il",
    venue_type: "restaurant",
    description: "Vibrant café on Dizengoff Street, perfect for social events",
  },
  {
    name: "The Jerusalem Lounge",
    address: "12 Ben Yehuda Street",
    city: "Jerusalem",
    country: "il",
    venue_type: "bar",
    description: "Cozy lounge bar in the city centre",
  },
];

// ─── EVENTS ──────────────────────────────────────────────

interface TestEvent {
  label: string;
  event_date: string;
  start_time: string;
  event_type: string;
  country: "gb" | "il";
  city: string;
  venue_label: string;
  description: string;
  age_min: number;
  age_max: number;
  limit_male: number;
  limit_female: number;
  price: number;
  currency: string;
  // state flags
  match_submission_open: boolean;
  match_submission_locked: boolean;
  match_submission_deadline: string | null;
  match_results_released: boolean;
  is_published: boolean;
  scenario: string;
}

const TEST_EVENTS: TestEvent[] = [
  // ── SCENARIO A: Fully completed event (all scored, results released) ──
  {
    label: "A",
    event_date: "2026-01-10",
    start_time: "19:30",
    event_type: "jewish_general",
    country: "gb",
    city: "London",
    venue_label: "The Star & Compass",
    description: "[ANIME_TEST] January London Speed Dating — JoJo vs One Piece",
    age_min: 25,
    age_max: 38,
    limit_male: 10,
    limit_female: 10,
    price: 25,
    currency: "GBP",
    match_submission_open: false,
    match_submission_locked: true,
    match_submission_deadline: "2026-01-17T23:59:00Z",
    match_results_released: true,
    is_published: true,
    scenario: "Completed: all submitted, results released, mutual matches exist",
  },
  // ── SCENARIO B: Scoring open, some submitted, some drafts, some not started ──
  {
    label: "B",
    event_date: "2026-02-08",
    start_time: "20:00",
    event_type: "singles",
    country: "gb",
    city: "Manchester",
    venue_label: "The Northern Quarter Social",
    description: "[ANIME_TEST] February Manchester Mixer — Scoring In Progress",
    age_min: 25,
    age_max: 40,
    limit_male: 8,
    limit_female: 8,
    price: 22,
    currency: "GBP",
    match_submission_open: true,
    match_submission_locked: false,
    match_submission_deadline: "2026-02-22T23:59:00Z",
    match_results_released: false,
    is_published: true,
    scenario: "In Progress: mix of submitted, draft, and pending scorers",
  },
  // ── SCENARIO C: Israel event, scoring open, deadline approaching ──
  {
    label: "C",
    event_date: "2026-02-05",
    start_time: "20:30",
    event_type: "jewish_general",
    country: "il",
    city: "Tel Aviv",
    venue_label: "Café Dizengoff",
    description: "[ANIME_TEST] February Tel Aviv Night — Bleach Edition",
    age_min: 24,
    age_max: 37,
    limit_male: 10,
    limit_female: 10,
    price: 80,
    currency: "ILS",
    match_submission_open: true,
    match_submission_locked: false,
    match_submission_deadline: "2026-02-17T23:59:00Z",
    match_results_released: false,
    is_published: true,
    scenario: "Scoring open, Bleach characters, deadline approaching, VIP test",
  },
  // ── SCENARIO D: Deadline expired, some didn't submit ──
  {
    label: "D",
    event_date: "2026-01-20",
    start_time: "19:00",
    event_type: "jewish_general",
    country: "il",
    city: "Jerusalem",
    venue_label: "The Jerusalem Lounge",
    description: "[ANIME_TEST] January Jerusalem Evening — Deadline Passed",
    age_min: 25,
    age_max: 40,
    limit_male: 6,
    limit_female: 6,
    price: 75,
    currency: "ILS",
    match_submission_open: true,
    match_submission_locked: true,
    match_submission_deadline: "2026-01-28T23:59:00Z",
    match_results_released: false,
    is_published: true,
    scenario: "Locked: deadline passed, some never submitted — edge case",
  },
];

// ─── HELPERS ─────────────────────────────────────────────

type CreatedUser = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  country: string;
  city: string;
  anime: string;
  has_avatar: boolean;
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── MAIN ────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Anime Matching Test Data Seeder                ║");
  console.log("║  JoJo • One Piece • Bleach                     ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // ── Lookup tables ──
  const { data: countries } = await supabase.from("countries").select("id, code");
  const { data: cities } = await supabase.from("cities").select("id, name, country_id");

  if (!countries || !cities) {
    console.error("Could not fetch countries/cities. Run db:reset first.");
    process.exit(1);
  }

  const countryMap = Object.fromEntries(countries.map((c) => [c.code, c.id]));
  const cityLookup = (countryCode: string, cityName: string) => {
    const countryId = countryMap[countryCode];
    return cities.find((c) => c.country_id === countryId && c.name === cityName)?.id;
  };

  // ── 1. CREATE USERS ──
  console.log("━━━ Creating anime test users ━━━\n");
  const createdUsers: CreatedUser[] = [];

  for (const user of TEST_USERS) {
    const email = `anime-${user.first_name.toLowerCase()}-${user.last_name.toLowerCase()}@test.thespeeddating.com`;
    const countryId = countryMap[user.country];
    const cityId = cityLookup(user.country, user.city);

    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: TEST_PASSWORD,
        email_confirm: true,
      });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        // Fetch existing user id
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find((u) => u.email === email);
        if (existing) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, gender, avatar_url")
            .eq("id", existing.id)
            .single();
          if (profile) {
            createdUsers.push({
              id: profile.id,
              first_name: user.first_name,
              last_name: user.last_name,
              gender: user.gender,
              country: user.country,
              city: user.city,
              anime: user.anime,
              has_avatar: !!profile.avatar_url,
            });
          }
        }
        console.log(
          `  SKIP  ${user.first_name} ${user.last_name} (${user.anime}) — already exists`
        );
        continue;
      }
      console.error(`  FAIL  ${email}: ${authError.message}`);
      continue;
    }

    const userId = authData.user.id;
    const hasAvatar = user.avatar_seed !== null;

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name: user.first_name,
      last_name: user.last_name,
      email,
      date_of_birth: user.dob,
      gender: user.gender,
      phone: user.country === "gb"
        ? `+44${7000000000 + Math.floor(Math.random() * 999999999)}`
        : `+972${50000000 + Math.floor(Math.random() * 9999999)}`,
      occupation: user.occupation,
      education: user.education,
      bio: user.bio,
      interests: user.interests,
      height_cm: user.height_cm,
      instagram: user.instagram,
      avatar_url: hasAvatar ? avatarUrl(user.avatar_seed!) : null,
      country_id: countryId,
      city_id: cityId,
      role: "member",
      is_active: true,
      faith: user.faith,
      relationship_status: user.relationship_status,
      sexual_preference: user.sexual_preference,
      admin_comments: TEST_MARKER,
      privacy_preferences: {
        shareEmail: true,
        sharePhone: Math.random() > 0.3,
        shareWhatsapp: Math.random() > 0.4,
        shareInstagram: !!user.instagram,
        shareFacebook: false,
      },
    });

    if (profileError) {
      console.error(
        `  FAIL  ${user.first_name} ${user.last_name}: ${profileError.message}`
      );
      await supabase.auth.admin.deleteUser(userId);
      continue;
    }

    createdUsers.push({
      id: userId,
      first_name: user.first_name,
      last_name: user.last_name,
      gender: user.gender,
      country: user.country,
      city: user.city,
      anime: user.anime,
      has_avatar: hasAvatar,
    });

    const photoTag = hasAvatar ? "📷" : "🚫";
    console.log(
      `  ${photoTag}  ${user.first_name} ${user.last_name} [${user.anime}] — ${user.city}, ${user.gender}`
    );
  }

  console.log(`\n  Total: ${createdUsers.length} anime users ready\n`);

  // ── 1b. FIND ADMIN USER AND ADD TO POOL ──
  console.log("━━━ Finding admin user ━━━\n");
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, gender, avatar_url, country_id, city_id")
    .eq("role", "admin")
    .limit(1)
    .single();

  let adminUser: CreatedUser | null = null;
  if (adminProfile) {
    const adminCountry = countries.find((c) => c.id === adminProfile.country_id);
    const adminCity = cities.find((c) => c.id === adminProfile.city_id);
    adminUser = {
      id: adminProfile.id,
      first_name: adminProfile.first_name,
      last_name: adminProfile.last_name,
      gender: adminProfile.gender,
      country: (adminCountry?.code ?? "gb") as string,
      city: adminCity?.name ?? "London",
      anime: "Admin",
      has_avatar: !!adminProfile.avatar_url,
    };
    console.log(
      `  ✓ Found admin: ${adminUser.first_name} ${adminUser.last_name} (${adminUser.gender}, ${adminUser.city})`
    );
    console.log("    Admin will be registered for ALL events\n");
  } else {
    console.log("  ⚠ No admin user found — run pnpm seed:admin first\n");
  }

  // ── 2. CREATE VENUES ──
  console.log("━━━ Creating test venues ━━━\n");
  const venueIds: Record<string, number> = {};

  for (const v of TEST_VENUES) {
    const countryId = countryMap[v.country];
    const cityId = cityLookup(v.country, v.city);

    const { data: existing } = await supabase
      .from("venues")
      .select("id")
      .eq("name", v.name)
      .maybeSingle();

    if (existing) {
      venueIds[v.name] = existing.id;
      console.log(`  SKIP  ${v.name} (exists, id=${existing.id})`);
      continue;
    }

    const { data: newVenue, error } = await supabase
      .from("venues")
      .insert({
        name: v.name,
        address: v.address,
        city_id: cityId!,
        country_id: countryId,
        venue_type: v.venue_type,
        description: v.description,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`  FAIL  ${v.name}: ${error.message}`);
    } else {
      venueIds[v.name] = newVenue.id;
      console.log(`  OK    ${v.name} (id=${newVenue.id})`);
    }
  }

  // ── 3. CREATE EVENTS ──
  console.log("\n━━━ Creating test events ━━━\n");
  const eventRecords: { id: number; event: TestEvent }[] = [];

  for (const evt of TEST_EVENTS) {
    const countryId = countryMap[evt.country];
    const cityId = cityLookup(evt.country, evt.city);
    const venueId = venueIds[evt.venue_label] ?? null;

    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("description", evt.description)
      .maybeSingle();

    if (existing) {
      eventRecords.push({ id: existing.id, event: evt });
      console.log(
        `  SKIP  Event ${evt.label}: ${evt.description} (id=${existing.id})`
      );
      continue;
    }

    const { data: newEvt, error } = await supabase
      .from("events")
      .insert({
        event_date: evt.event_date,
        start_time: evt.start_time,
        event_type: evt.event_type,
        country_id: countryId,
        city_id: cityId!,
        venue_id: venueId,
        description: evt.description,
        age_min: evt.age_min,
        age_max: evt.age_max,
        limit_male: evt.limit_male,
        limit_female: evt.limit_female,
        price: evt.price,
        currency: evt.currency,
        match_submission_open: evt.match_submission_open,
        match_submission_locked: evt.match_submission_locked,
        match_submission_deadline: evt.match_submission_deadline,
        match_results_released: evt.match_results_released,
        is_published: evt.is_published,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`  FAIL  Event ${evt.label}: ${error.message}`);
    } else {
      eventRecords.push({ id: newEvt.id, event: evt });
      console.log(
        `  OK    Event ${evt.label}: ${evt.description} (id=${newEvt.id})`
      );
      console.log(`        Scenario: ${evt.scenario}`);
    }
  }

  // ── 4. GET MATCH QUESTIONS ──
  const { data: matchQuestions } = await supabase
    .from("event_match_questions")
    .select("id, question_type")
    .eq("is_active", true)
    .order("sort_order");

  console.log(
    `\n  Found ${matchQuestions?.length ?? 0} active match questions\n`
  );

  // ── 5. REGISTER USERS TO EVENTS + MARK ATTENDANCE ──
  console.log("━━━ Registering users & marking attendance ━━━\n");
  let regCount = 0;

  // Helper: who goes to which event
  function getEventAttendees(evt: TestEvent): CreatedUser[] {
    const users = createdUsers.filter((u) => u.country === evt.country);
    if (evt.label === "A") {
      // JoJo + One Piece UK users
      return users.filter(
        (u) => u.anime === "JoJo" || u.anime === "One Piece"
      );
    }
    if (evt.label === "B") {
      // Subset of UK users: JoJo UK + some One Piece
      return users.filter(
        (u) =>
          u.anime === "JoJo" ||
          (u.anime === "One Piece" && ["Luffy", "Nami", "Sanji", "Vivi"].includes(u.first_name))
      );
    }
    if (evt.label === "C") {
      // All Bleach Israel users
      return users.filter((u) => u.anime === "Bleach");
    }
    if (evt.label === "D") {
      // Subset of Bleach Israel users (smaller event)
      return users.filter(
        (u) =>
          u.anime === "Bleach" &&
          ["Ichigo", "Renji", "Toshiro", "Rukia", "Orihime", "Rangiku"].includes(u.first_name)
      );
    }
    return [];
  }

  for (const { id: eventId, event: evt } of eventRecords) {
    const attendees = getEventAttendees(evt);

    // Always include admin user in every event
    const allAttendees = adminUser
      ? [...attendees, adminUser]
      : attendees;

    console.log(
      `  Event ${evt.label} (id=${eventId}): ${allAttendees.length} attendees${adminUser ? " (incl. admin)" : ""}`
    );

    for (const user of allAttendees) {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: eventId,
        user_id: user.id,
        status: "confirmed",
        payment_status: "paid",
        amount: evt.price,
        paid_amount: evt.price,
        currency: evt.currency,
        attended: true,
      });

      if (error) {
        if (error.message.includes("duplicate key")) continue;
        console.error(
          `    REG FAIL ${user.first_name}: ${error.message}`
        );
      } else {
        regCount++;
      }
    }
  }
  console.log(`\n  Total registrations: ${regCount}\n`);

  // ── 6. CREATE MATCH SCORES ──
  console.log("━━━ Creating match scores ━━━\n");
  let scoreCount = 0;
  let answerCount = 0;

  // Scenario A: Everyone has submitted, results released
  const eventA = eventRecords.find((e) => e.event.label === "A");
  if (eventA) {
    const attendees = getEventAttendees(eventA.event);
    const males = attendees.filter((u) => u.gender === "male");
    const females = attendees.filter((u) => u.gender === "female");

    console.log(
      `  Event A: ${males.length} males × ${females.length} females — all submitted`
    );

    // Predetermined interesting matches:
    // Jonathan ↔ Nami: mutual date
    // Joseph ↔ Robin: mutual date
    // Jotaro ↔ Jolyne: both say "no" (they'd be related in JoJo lore)
    // Sanji ↔ every female: date (he's Sanji)
    // Luffy ↔ Nami: he picks friend, she picks date (one-sided)
    // Bruno ↔ Trish: mutual friend (protective)

    for (const male of males) {
      for (const female of females) {
        const pair = `${male.first_name}-${female.first_name}`;
        let maleChoice: string;
        let femaleChoice: string;

        // Predetermined matchups
        if (pair === "Jonathan-Nami") {
          maleChoice = "date"; femaleChoice = "date";
        } else if (pair === "Joseph-Robin") {
          maleChoice = "date"; femaleChoice = "date";
        } else if (pair === "Jotaro-Jolyne") {
          maleChoice = "no"; femaleChoice = "no";
        } else if (pair === "Bruno-Trish") {
          maleChoice = "friend"; femaleChoice = "friend";
        } else if (male.first_name === "Sanji") {
          maleChoice = "date";
          femaleChoice = Math.random() > 0.5 ? "date" : "friend";
        } else if (pair === "Luffy-Nami") {
          maleChoice = "friend"; femaleChoice = "date";
        } else if (pair === "Josuke-Vivi") {
          maleChoice = "date"; femaleChoice = "date";
        } else {
          // Random
          const r = Math.random();
          maleChoice = r > 0.5 ? "date" : r > 0.25 ? "friend" : "no";
          const r2 = Math.random();
          femaleChoice = r2 > 0.5 ? "date" : r2 > 0.25 ? "friend" : "no";
        }

        // Male scores female
        const { data: ms, error: msErr } = await supabase
          .from("match_scores")
          .insert({
            event_id: eventA.id,
            scorer_id: male.id,
            scored_id: female.id,
            choice: maleChoice,
            is_draft: false,
            share_email: true,
            share_phone: maleChoice === "date",
            share_whatsapp: maleChoice === "date",
            share_instagram: !!male.has_avatar,
            submitted_at: new Date("2026-01-12T14:00:00Z").toISOString(),
            submitted_by_user_at: new Date("2026-01-12T14:00:00Z").toISOString(),
          })
          .select("id")
          .single();

        if (msErr) {
          if (!msErr.message.includes("duplicate")) {
            console.error(`    SCORE FAIL ${male.first_name}→${female.first_name}: ${msErr.message}`);
          }
          continue;
        }
        scoreCount++;

        // Add question answers
        if (matchQuestions && ms) {
          for (const q of matchQuestions) {
            let answer: string;
            if (q.question_type === "yes_no") {
              answer = maleChoice !== "no" ? "yes" : "no";
            } else if (q.question_type === "rating") {
              answer = maleChoice === "date" ? String(7 + Math.floor(Math.random() * 4)) : String(3 + Math.floor(Math.random() * 4));
            } else {
              answer = "Interesting conversation";
            }

            const { error: aErr } = await supabase.from("match_score_answers").insert({
              match_score_id: ms.id,
              question_id: q.id,
              answer,
            });
            if (!aErr) answerCount++;
          }
        }

        // Female scores male
        const { data: fs, error: fsErr } = await supabase
          .from("match_scores")
          .insert({
            event_id: eventA.id,
            scorer_id: female.id,
            scored_id: male.id,
            choice: femaleChoice,
            is_draft: false,
            share_email: true,
            share_phone: femaleChoice === "date",
            share_whatsapp: femaleChoice !== "no",
            share_instagram: !!female.has_avatar,
            submitted_at: new Date("2026-01-13T10:00:00Z").toISOString(),
            submitted_by_user_at: new Date("2026-01-13T10:00:00Z").toISOString(),
          })
          .select("id")
          .single();

        if (fsErr) {
          if (!fsErr.message.includes("duplicate")) {
            console.error(`    SCORE FAIL ${female.first_name}→${male.first_name}: ${fsErr.message}`);
          }
          continue;
        }
        scoreCount++;

        if (matchQuestions && fs) {
          for (const q of matchQuestions) {
            let answer: string;
            if (q.question_type === "yes_no") {
              answer = femaleChoice !== "no" ? "yes" : "no";
            } else if (q.question_type === "rating") {
              answer = femaleChoice === "date" ? String(7 + Math.floor(Math.random() * 4)) : String(3 + Math.floor(Math.random() * 4));
            } else {
              answer = "Lovely person";
            }

            const { error: aErr } = await supabase.from("match_score_answers").insert({
              match_score_id: fs.id,
              question_id: q.id,
              answer,
            });
            if (!aErr) answerCount++;
          }
        }
      }
    }

    // Admin scores in Event A — scores all females, some pick him back
    if (adminUser) {
      const adminGender = adminUser.gender;
      const opposites = adminGender === "male" ? females : males;
      console.log(`    Admin (${adminUser.first_name}) scoring ${opposites.length} people in Event A...`);

      for (let i = 0; i < opposites.length; i++) {
        const other = opposites[i];
        // Admin picks: first 2 = date, next 2 = friend, rest = no
        const adminChoice = i < 2 ? "date" : i < 4 ? "friend" : "no";

        const { data: adminMs, error: adminMsErr } = await supabase
          .from("match_scores")
          .insert({
            event_id: eventA.id,
            scorer_id: adminUser.id,
            scored_id: other.id,
            choice: adminChoice,
            is_draft: false,
            share_email: true,
            share_phone: adminChoice === "date",
            share_whatsapp: adminChoice === "date",
            submitted_at: new Date("2026-01-12T12:00:00Z").toISOString(),
            submitted_by_user_at: new Date("2026-01-12T12:00:00Z").toISOString(),
          })
          .select("id")
          .single();

        if (adminMsErr && !adminMsErr.message.includes("duplicate")) {
          console.error(`    ADMIN SCORE FAIL → ${other.first_name}: ${adminMsErr.message}`);
        } else if (adminMs) {
          scoreCount++;
          if (matchQuestions) {
            for (const q of matchQuestions) {
              const answer = q.question_type === "rating"
                ? (adminChoice === "date" ? "9" : adminChoice === "friend" ? "6" : "3")
                : (adminChoice !== "no" ? "yes" : "no");
              await supabase.from("match_score_answers").insert({
                match_score_id: adminMs.id, question_id: q.id, answer,
              });
              answerCount++;
            }
          }
        }

        // Other scores admin back: first person = mutual date, second = one-sided, rest random
        const otherChoice = i === 0 ? "date" : i === 1 ? "no" : pick(["date", "friend", "no"]);

        const { data: otherMs, error: otherMsErr } = await supabase
          .from("match_scores")
          .insert({
            event_id: eventA.id,
            scorer_id: other.id,
            scored_id: adminUser.id,
            choice: otherChoice,
            is_draft: false,
            share_email: true,
            share_phone: otherChoice === "date",
            share_whatsapp: otherChoice !== "no",
            submitted_at: new Date("2026-01-13T11:00:00Z").toISOString(),
            submitted_by_user_at: new Date("2026-01-13T11:00:00Z").toISOString(),
          })
          .select("id")
          .single();

        if (otherMsErr && !otherMsErr.message.includes("duplicate")) {
          console.error(`    SCORE FAIL ${other.first_name} → Admin: ${otherMsErr.message}`);
        } else if (otherMs) {
          scoreCount++;
        }
      }
      console.log("    ✓ Admin scored + scored by others in Event A");
    }

    // Compute match results for Event A
    console.log("    Computing match results for Event A...");
    const { error: rpcErr } = await supabase.rpc("compute_matches", {
      p_event_id: eventA.id,
    });
    if (rpcErr) {
      console.error(`    MATCH COMPUTE FAIL: ${rpcErr.message}`);
    } else {
      const { count } = await supabase
        .from("match_results")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventA.id);
      console.log(`    ✓ ${count} match results computed`);
    }
  }

  // Scenario B: Mixed — some submitted, some drafts, some not started
  const eventB = eventRecords.find((e) => e.event.label === "B");
  if (eventB) {
    const attendees = getEventAttendees(eventB.event);
    const males = attendees.filter((u) => u.gender === "male");
    const females = attendees.filter((u) => u.gender === "female");

    console.log(
      `  Event B: ${males.length} males × ${females.length} females — mixed states`
    );

    for (let mi = 0; mi < males.length; mi++) {
      const male = males[mi];
      // First 2 males: fully submitted
      // Next 2 males: draft (in progress)
      // Rest: haven't started
      const maleState = mi < 2 ? "submitted" : mi < 4 ? "draft" : "none";

      if (maleState === "none") {
        console.log(`    ${male.first_name}: not started`);
        continue;
      }

      for (const female of females) {
        const choice = pick(["date", "friend", "no"]);

        const { data: ms, error: msErr } = await supabase
          .from("match_scores")
          .insert({
            event_id: eventB.id,
            scorer_id: male.id,
            scored_id: female.id,
            choice,
            is_draft: maleState === "draft",
            share_email: true,
            share_phone: choice === "date",
            share_whatsapp: choice !== "no",
            submitted_at: maleState === "submitted"
              ? new Date("2026-02-10T18:00:00Z").toISOString()
              : new Date().toISOString(),
            submitted_by_user_at: maleState === "submitted"
              ? new Date("2026-02-10T18:00:00Z").toISOString()
              : null,
          })
          .select("id")
          .single();

        if (msErr) {
          if (!msErr.message.includes("duplicate"))
            console.error(`    SCORE FAIL: ${msErr.message}`);
          continue;
        }
        scoreCount++;

        if (matchQuestions && ms) {
          // Only answer some questions if draft (partial completion edge case)
          const questionsToAnswer = maleState === "draft"
            ? matchQuestions.slice(0, 1)
            : matchQuestions;

          for (const q of questionsToAnswer) {
            const answer = q.question_type === "rating" ? String(5 + Math.floor(Math.random() * 5)) : "yes";
            const { error: aErr } = await supabase.from("match_score_answers").insert({
              match_score_id: ms.id,
              question_id: q.id,
              answer,
            });
            if (!aErr) answerCount++;
          }
        }
      }
      console.log(`    ${male.first_name}: ${maleState} (scored ${females.length} people)`);
    }

    // Some females also submit
    for (let fi = 0; fi < females.length; fi++) {
      const female = females[fi];
      const femaleState = fi < 1 ? "submitted" : fi < 3 ? "draft" : "none";

      if (femaleState === "none") continue;

      for (const male of males) {
        const choice = pick(["date", "friend", "no"]);

        const { data: fs, error: fsErr } = await supabase
          .from("match_scores")
          .insert({
            event_id: eventB.id,
            scorer_id: female.id,
            scored_id: male.id,
            choice,
            is_draft: femaleState === "draft",
            share_email: true,
            share_phone: choice === "date",
            submitted_at: new Date().toISOString(),
            submitted_by_user_at: femaleState === "submitted" ? new Date().toISOString() : null,
          })
          .select("id")
          .single();

        if (fsErr) {
          if (!fsErr.message.includes("duplicate"))
            console.error(`    SCORE FAIL: ${fsErr.message}`);
          continue;
        }
        scoreCount++;
      }
      console.log(`    ${female.first_name}: ${femaleState}`);
    }

    // Females score the admin user in Event B (so VIP banners show when admin scores)
    if (adminUser) {
      const adminOpposites = adminUser.gender === "male" ? females : males;
      const choiceOptions = ["date", "date", "friend", "no", "date"] as const;
      console.log(`    Scoring admin from ${adminOpposites.length} people in Event B...`);
      for (let i = 0; i < adminOpposites.length; i++) {
        const other = adminOpposites[i];
        const choice = choiceOptions[i % choiceOptions.length];
        const { error } = await supabase.from("match_scores").insert({
          event_id: eventB.id,
          scorer_id: other.id,
          scored_id: adminUser.id,
          choice,
          is_draft: false,
          share_email: true,
          share_phone: choice === "date",
          share_whatsapp: choice !== "no",
          submitted_at: new Date("2026-02-10T20:00:00Z").toISOString(),
          submitted_by_user_at: new Date("2026-02-10T20:00:00Z").toISOString(),
        });
        if (error && !error.message.includes("duplicate")) {
          console.error(`    SCORE FAIL ${other.first_name} → Admin: ${error.message}`);
        } else {
          scoreCount++;
        }
      }
      console.log(`    ✓ Admin scored by ${adminOpposites.length} people (VIP data available)`);
    }
  }

  // Scenario C: Bleach Tel Aviv — scoring open, all attending
  const eventC = eventRecords.find((e) => e.event.label === "C");
  if (eventC) {
    const attendees = getEventAttendees(eventC.event);
    const males = attendees.filter((u) => u.gender === "male");
    const females = attendees.filter((u) => u.gender === "female");

    console.log(
      `  Event C: ${males.length} males × ${females.length} females — Bleach Tel Aviv`
    );

    // Ichigo submits everything (main character energy)
    const ichigo = males.find((m) => m.first_name === "Ichigo");
    if (ichigo) {
      for (const female of females) {
        // Ichigo ↔ Orihime: date (canon-adjacent)
        // Ichigo ↔ Rukia: friend (it's complicated)
        let choice: string;
        if (female.first_name === "Orihime") choice = "date";
        else if (female.first_name === "Rukia") choice = "friend";
        else choice = pick(["date", "friend", "no"]);

        const { data: ms, error } = await supabase
          .from("match_scores")
          .insert({
            event_id: eventC.id,
            scorer_id: ichigo.id,
            scored_id: female.id,
            choice,
            is_draft: false,
            share_email: true,
            share_phone: choice === "date",
            share_whatsapp: true,
            submitted_at: new Date("2026-02-07T20:00:00Z").toISOString(),
            submitted_by_user_at: new Date("2026-02-07T20:00:00Z").toISOString(),
          })
          .select("id")
          .single();

        if (error && !error.message.includes("duplicate")) {
          console.error(`    SCORE FAIL: ${error.message}`);
        } else if (ms) {
          scoreCount++;
          if (matchQuestions) {
            for (const q of matchQuestions) {
              const answer = q.question_type === "rating"
                ? (choice === "date" ? "9" : choice === "friend" ? "7" : "4")
                : (choice !== "no" ? "yes" : "no");
              await supabase.from("match_score_answers").insert({
                match_score_id: ms.id,
                question_id: q.id,
                answer,
              });
              answerCount++;
            }
          }
        }
      }
      console.log("    Ichigo: submitted (all scored)");
    }

    // Orihime submits (she also picks Ichigo as date)
    const orihime = females.find((f) => f.first_name === "Orihime");
    if (orihime) {
      for (const male of males) {
        const choice = male.first_name === "Ichigo" ? "date" : pick(["friend", "no"]);

        const { data: fs, error } = await supabase
          .from("match_scores")
          .insert({
            event_id: eventC.id,
            scorer_id: orihime.id,
            scored_id: male.id,
            choice,
            is_draft: false,
            share_email: true,
            share_phone: choice === "date",
            share_whatsapp: true,
            share_instagram: true,
            submitted_at: new Date("2026-02-08T09:00:00Z").toISOString(),
            submitted_by_user_at: new Date("2026-02-08T09:00:00Z").toISOString(),
          })
          .select("id")
          .single();

        if (error && !error.message.includes("duplicate")) {
          console.error(`    SCORE FAIL: ${error.message}`);
        } else if (fs) {
          scoreCount++;
        }
      }
      console.log("    Orihime: submitted");
    }

    // Uryu has drafts (started but not submitted)
    const uryu = males.find((m) => m.first_name === "Uryu");
    if (uryu) {
      // Only scored 2 out of 4 women (partial draft)
      for (const female of females.slice(0, 2)) {
        const choice = pick(["date", "friend"]);

        const { error } = await supabase.from("match_scores").insert({
          event_id: eventC.id,
          scorer_id: uryu.id,
          scored_id: female.id,
          choice,
          is_draft: true,
          share_email: true,
          share_phone: true,
          submitted_at: new Date().toISOString(),
        });

        if (error && !error.message.includes("duplicate")) {
          console.error(`    SCORE FAIL: ${error.message}`);
        } else {
          scoreCount++;
        }
      }
      console.log("    Uryu: draft (2 of 4 scored)");
    }

    // Renji and Toshiro haven't started yet
    console.log("    Renji: not started");
    console.log("    Toshiro: not started");

    // Rukia has drafts
    const rukia = females.find((f) => f.first_name === "Rukia");
    if (rukia) {
      for (const male of males.slice(0, 3)) {
        const choice = male.first_name === "Renji" ? "date" : pick(["friend", "no"]);

        const { error } = await supabase.from("match_scores").insert({
          event_id: eventC.id,
          scorer_id: rukia.id,
          scored_id: male.id,
          choice,
          is_draft: true,
          share_email: true,
          submitted_at: new Date().toISOString(),
        });

        if (!error || error.message.includes("duplicate")) scoreCount++;
      }
      console.log("    Rukia: draft (3 of 4 scored)");
    }

    // Rangiku and Yoruichi haven't started
    console.log("    Rangiku: not started");
    console.log("    Yoruichi: not started");

    // Females score the admin user in Event C (so VIP banners show)
    if (adminUser) {
      const adminOpposites = adminUser.gender === "male" ? females : males;
      const choiceOptions = ["date", "friend", "date", "no"] as const;
      console.log(`    Scoring admin from ${adminOpposites.length} people in Event C...`);
      for (let i = 0; i < adminOpposites.length; i++) {
        const other = adminOpposites[i];
        const choice = choiceOptions[i % choiceOptions.length];
        const { error } = await supabase.from("match_scores").insert({
          event_id: eventC.id,
          scorer_id: other.id,
          scored_id: adminUser.id,
          choice,
          is_draft: false,
          share_email: true,
          share_phone: choice === "date",
          share_whatsapp: choice !== "no",
          submitted_at: new Date("2026-02-08T15:00:00Z").toISOString(),
          submitted_by_user_at: new Date("2026-02-08T15:00:00Z").toISOString(),
        });
        if (error && !error.message.includes("duplicate")) {
          console.error(`    SCORE FAIL ${other.first_name} → Admin: ${error.message}`);
        } else {
          scoreCount++;
        }
      }
      console.log(`    ✓ Admin scored by ${adminOpposites.length} people (VIP data available)`);
    }
  }

  // Scenario D: Jerusalem — deadline passed, locked, some never submitted
  const eventD = eventRecords.find((e) => e.event.label === "D");
  if (eventD) {
    const attendees = getEventAttendees(eventD.event);
    const males = attendees.filter((u) => u.gender === "male");
    const females = attendees.filter((u) => u.gender === "female");

    console.log(
      `  Event D: ${males.length} males × ${females.length} females — deadline passed`
    );

    // Ichigo submitted on time
    const ichigo = males.find((m) => m.first_name === "Ichigo");
    if (ichigo) {
      for (const female of females) {
        const choice = pick(["date", "friend", "no"]);
        const { error } = await supabase.from("match_scores").insert({
          event_id: eventD.id,
          scorer_id: ichigo.id,
          scored_id: female.id,
          choice,
          is_draft: false,
          share_email: true,
          share_phone: choice === "date",
          submitted_at: new Date("2026-01-26T18:00:00Z").toISOString(),
          submitted_by_user_at: new Date("2026-01-26T18:00:00Z").toISOString(),
        });
        if (!error || error.message.includes("duplicate")) scoreCount++;
      }
      console.log("    Ichigo: submitted on time");
    }

    // Renji started draft but never finished (deadline passed with drafts)
    const renji = males.find((m) => m.first_name === "Renji");
    if (renji) {
      for (const female of females.slice(0, 1)) {
        const { error } = await supabase.from("match_scores").insert({
          event_id: eventD.id,
          scorer_id: renji.id,
          scored_id: female.id,
          choice: "date",
          is_draft: true,
          share_email: true,
          submitted_at: new Date("2026-01-27T22:00:00Z").toISOString(),
        });
        if (!error || error.message.includes("duplicate")) scoreCount++;
      }
      console.log("    Renji: draft (1 scored, deadline expired)");
    }

    // Toshiro never started
    console.log("    Toshiro: never started (deadline expired)");

    // Orihime submitted
    const orihime = females.find((f) => f.first_name === "Orihime");
    if (orihime) {
      for (const male of males) {
        const choice = male.first_name === "Ichigo" ? "date" : "friend";
        const { error } = await supabase.from("match_scores").insert({
          event_id: eventD.id,
          scorer_id: orihime.id,
          scored_id: male.id,
          choice,
          is_draft: false,
          share_email: true,
          share_whatsapp: true,
          submitted_at: new Date("2026-01-25T10:00:00Z").toISOString(),
          submitted_by_user_at: new Date("2026-01-25T10:00:00Z").toISOString(),
        });
        if (!error || error.message.includes("duplicate")) scoreCount++;
      }
      console.log("    Orihime: submitted on time");
    }

    // Rukia submitted
    const rukia = females.find((f) => f.first_name === "Rukia");
    if (rukia) {
      for (const male of males) {
        const choice = male.first_name === "Renji" ? "date" : pick(["friend", "no"]);
        const { error } = await supabase.from("match_scores").insert({
          event_id: eventD.id,
          scorer_id: rukia.id,
          scored_id: male.id,
          choice,
          is_draft: false,
          share_email: true,
          submitted_at: new Date("2026-01-27T15:00:00Z").toISOString(),
          submitted_by_user_at: new Date("2026-01-27T15:00:00Z").toISOString(),
        });
        if (!error || error.message.includes("duplicate")) scoreCount++;
      }
      console.log("    Rukia: submitted on time");
    }

    // Rangiku never started
    console.log("    Rangiku: never started (deadline expired)");
  }

  console.log(`\n  Total scores: ${scoreCount}`);
  console.log(`  Total answers: ${answerCount}\n`);

  // ── 7. VIP SUBSCRIPTIONS ──
  console.log("━━━ Creating VIP subscriptions ━━━\n");
  let vipCount = 0;

  const vipUsers = [
    // Active VIP — can see "who chose you"
    { name: "Ichigo", plan: "12_month", status: "active" },
    { name: "Sanji", plan: "3_month", status: "active" },
    { name: "Robin", plan: "6_month", status: "active" },
    // Expired VIP — tests that expired VIP doesn't get perks
    { name: "Joseph", plan: "1_month", status: "expired" },
    // Cancelled VIP — another edge case
    { name: "Rangiku", plan: "3_month", status: "cancelled" },
  ];

  // Also give admin user active VIP
  if (adminUser) {
    const now = new Date();
    const periodStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(periodStart.getTime() + 365 * 24 * 60 * 60 * 1000);

    const { error } = await supabase.from("vip_subscriptions").insert({
      user_id: adminUser.id,
      plan_type: "12_month",
      price_per_month: 9.99,
      currency: "GBP",
      status: "active",
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      stripe_subscription_id: `sub_admin_${adminUser.id.slice(0, 8)}`,
      stripe_customer_id: `cus_admin_${adminUser.id.slice(0, 8)}`,
    });

    if (error) {
      if (error.message.includes("duplicate")) {
        console.log("  SKIP  Admin VIP (already exists)");
      } else {
        console.error(`  VIP FAIL Admin: ${error.message}`);
      }
    } else {
      console.log(`  👑  Admin User → 12_month (active) — full VIP access for testing`);
      vipCount++;
    }
  }

  for (const vip of vipUsers) {
    const user = createdUsers.find((u) => u.first_name === vip.name);
    if (!user) continue;

    const isUk = user.country === "gb";
    const priceMap: Record<string, number> = {
      "1_month": 19.99,
      "3_month": 14.99,
      "6_month": 11.99,
      "12_month": 9.99,
    };

    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    if (vip.status === "active") {
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const months = parseInt(vip.plan);
      periodEnd = new Date(
        periodStart.getTime() + months * 30 * 24 * 60 * 60 * 1000
      );
    } else {
      // Expired/cancelled: ended 2 weeks ago
      periodEnd = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const months = parseInt(vip.plan);
      periodStart = new Date(
        periodEnd.getTime() - months * 30 * 24 * 60 * 60 * 1000
      );
    }

    const { error } = await supabase.from("vip_subscriptions").insert({
      user_id: user.id,
      plan_type: vip.plan,
      price_per_month: priceMap[vip.plan],
      currency: isUk ? "GBP" : "ILS",
      status: vip.status,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancelled_at:
        vip.status === "cancelled"
          ? new Date(
              periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000
            ).toISOString()
          : null,
      stripe_subscription_id: `sub_anime_${user.id.slice(0, 8)}`,
      stripe_customer_id: `cus_anime_${user.id.slice(0, 8)}`,
    });

    if (error) {
      console.error(`  VIP FAIL ${user.first_name}: ${error.message}`);
    } else {
      const icon =
        vip.status === "active" ? "👑" : vip.status === "expired" ? "⏰" : "❌";
      console.log(
        `  ${icon}  ${user.first_name} ${user.last_name} → ${vip.plan} (${vip.status})`
      );
      vipCount++;
    }
  }

  // ── SUMMARY ──
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  Summary                                        ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║  Users:         ${String(createdUsers.length).padStart(3)}                            ║`);
  console.log(`║  Registrations: ${String(regCount).padStart(3)}                            ║`);
  console.log(`║  Match Scores:  ${String(scoreCount).padStart(3)}                            ║`);
  console.log(`║  Answers:       ${String(answerCount).padStart(3)}                            ║`);
  console.log(`║  VIP Subs:      ${String(vipCount).padStart(3)}                            ║`);
  console.log("╠══════════════════════════════════════════════════╣");
  console.log("║  Password: OraOra123!                           ║");
  console.log("║  Marker:   [ANIME_TEST]                         ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("\n━━━ Test Scenarios ━━━\n");
  console.log("  Event A (London, past):     All submitted → results released");
  console.log("    • Jonathan↔Nami: mutual date");
  console.log("    • Joseph↔Robin: mutual date");
  console.log("    • Josuke↔Vivi: mutual date");
  console.log("    • Bruno↔Trish: mutual friend");
  console.log("    • Luffy→Nami: friend (she said date — one-sided)");
  console.log("    • Sanji→everyone: date (he's Sanji)");
  console.log("    • Robin: has VIP (active) — can see who chose her");
  console.log("");
  console.log("  Event B (Manchester, open):  Mixed scoring states");
  console.log("    • 2 males submitted, 2 drafts, rest not started");
  console.log("    • 1 female submitted, 2 drafts, rest not started");
  console.log("    • Deadline: 2026-02-22");
  console.log("");
  console.log("  Event C (Tel Aviv, open):   Bleach characters");
  console.log("    • Ichigo: submitted (VIP active — sees who chose him)");
  console.log("    • Orihime: submitted (Ichigo↔Orihime mutual date)");
  console.log("    • Uryu: draft (2/4 scored)");
  console.log("    • Rukia: draft (3/4 scored, picked Renji as date)");
  console.log("    • Renji, Toshiro: not started (Renji has no photo)");
  console.log("    • Rangiku, Yoruichi: not started");
  console.log("");
  console.log("  Event D (Jerusalem, locked): Deadline expired");
  console.log("    • Ichigo, Orihime, Rukia: submitted on time");
  console.log("    • Renji: draft when deadline hit (stuck)");
  console.log("    • Toshiro, Rangiku: never started");
  console.log("");
  console.log("━━━ Edge Cases Covered ━━━\n");
  console.log("  🚫 No photo: Trish Unas (JoJo), Renji Abarai (Bleach)");
  console.log("  👑 Active VIP: Ichigo, Sanji, Robin");
  console.log("  ⏰ Expired VIP: Joseph");
  console.log("  ❌ Cancelled VIP: Rangiku");
  console.log("  📝 Partial drafts: Uryu (2/4), Rukia (3/4)");
  console.log("  🔒 Locked + expired deadline: Event D");
  console.log("  💔 One-sided match: Luffy→Nami (friend vs date)");
  console.log("  🤝 Mutual friend: Bruno↔Trish");
  console.log("  💕 Mutual dates: Jonathan↔Nami, Joseph↔Robin, Josuke↔Vivi, Ichigo↔Orihime");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
