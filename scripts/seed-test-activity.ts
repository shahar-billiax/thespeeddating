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
  // 1. Get all test users
  const { data: testUsers, error: usersError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, gender, country_id, city_id")
    .eq("admin_comments", TEST_MARKER);

  if (usersError || !testUsers?.length) {
    console.error("No test users found. Run 'pnpm seed:test-users' first.");
    process.exit(1);
  }

  console.log(`Found ${testUsers.length} test users.\n`);

  // 2. Create past test events if none exist
  console.log("Ensuring past events exist for match testing...");
  const pastTestEvents = [
    { event_date: "2026-01-15", start_time: "19:30", event_type: "jewish_general", country_id: 1, city_id: 1, venue_id: 1, is_published: true, match_submission_open: false, match_results_released: true, description: "[TEST_EVENT] January Speed Dating", age_min: 25, age_max: 40, limit_male: 15, limit_female: 15, price: 25, currency: "GBP" },
    { event_date: "2026-02-01", start_time: "20:00", event_type: "singles", country_id: 1, city_id: 2, venue_id: 3, is_published: true, match_submission_open: false, match_results_released: true, description: "[TEST_EVENT] February Manchester Dating", age_min: 28, age_max: 45, limit_male: 12, limit_female: 12, price: 22, currency: "GBP" },
    { event_date: "2026-01-25", start_time: "19:00", event_type: "jewish_general", country_id: 2, city_id: 5, venue_id: 4, is_published: true, match_submission_open: false, match_results_released: true, description: "[TEST_EVENT] January Tel Aviv Dating", age_min: 25, age_max: 40, limit_male: 15, limit_female: 15, price: 80, currency: "ILS" },
  ];

  const createdPastEvents: { id: number; event_date: string; country_id: number; city_id: number }[] = [];

  for (const evt of pastTestEvents) {
    // Check if this test event already exists
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("event_date", evt.event_date)
      .eq("description", evt.description)
      .maybeSingle();

    if (existing) {
      createdPastEvents.push({ id: existing.id, event_date: evt.event_date, country_id: evt.country_id, city_id: evt.city_id });
      console.log(`  SKIP  Past event ${evt.event_date} already exists (id=${existing.id})`);
      continue;
    }

    const { data: newEvt, error: evtErr } = await supabase
      .from("events")
      .insert(evt)
      .select("id")
      .single();

    if (evtErr) {
      console.error(`  FAIL  Past event ${evt.event_date}: ${evtErr.message}`);
    } else {
      createdPastEvents.push({ id: newEvt.id, event_date: evt.event_date, country_id: evt.country_id, city_id: evt.city_id });
      console.log(`  OK    Past event ${evt.event_date} created (id=${newEvt.id})`);
    }
  }

  // 3. Get all events (including newly created past ones)
  const { data: events } = await supabase
    .from("events")
    .select("id, event_date, country_id, city_id")
    .order("event_date", { ascending: true });

  if (!events?.length) {
    console.error("No events found.");
    process.exit(1);
  }

  console.log(`\nTotal ${events.length} events available.\n`);

  // Split users by country
  const ukUsers = testUsers.filter((u) => u.country_id === 1);
  const ilUsers = testUsers.filter((u) => u.country_id === 2);
  const ukMales = ukUsers.filter((u) => u.gender === "male");
  const ukFemales = ukUsers.filter((u) => u.gender === "female");
  const ilMales = ilUsers.filter((u) => u.gender === "male");
  const ilFemales = ilUsers.filter((u) => u.gender === "female");

  // Split events by country
  const ukEvents = events.filter((e) => e.country_id === 1);
  const ilEvents = events.filter((e) => e.country_id === 2);

  const today = new Date().toISOString().split("T")[0];

  // ─── EVENT REGISTRATIONS ─────────────────────────────────
  console.log("Creating event registrations...");
  let regCount = 0;

  // Register UK users for UK events
  for (const event of ukEvents) {
    const isPast = event.event_date < today;
    // Register most males and females for each event (some skip to be realistic)
    const eventMales = ukMales.filter(() => Math.random() > 0.2);
    const eventFemales = ukFemales.filter(() => Math.random() > 0.15);

    for (const user of [...eventMales, ...eventFemales]) {
      const status = Math.random() > 0.9 ? "cancelled" : "confirmed";
      const paymentStatus = status === "cancelled" ? "refunded" : (Math.random() > 0.1 ? "paid" : "pending");
      const attended = isPast && status === "confirmed" ? (Math.random() > 0.15 ? true : false) : null;

      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        user_id: user.id,
        status,
        payment_status: paymentStatus,
        amount: 25.00,
        paid_amount: paymentStatus === "paid" ? 25.00 : null,
        currency: "GBP",
        attended,
      });

      if (error) {
        if (error.message.includes("duplicate key")) continue;
        console.error(`  REG FAIL: ${user.first_name} → event ${event.id}: ${error.message}`);
      } else {
        regCount++;
      }
    }
  }

  // Register IL users for IL events
  for (const event of ilEvents) {
    const isPast = event.event_date < today;
    const eventMales = ilMales.filter(() => Math.random() > 0.15);
    const eventFemales = ilFemales.filter(() => Math.random() > 0.1);

    for (const user of [...eventMales, ...eventFemales]) {
      const status = Math.random() > 0.92 ? "cancelled" : "confirmed";
      const paymentStatus = status === "cancelled" ? "refunded" : (Math.random() > 0.1 ? "paid" : "pending");
      const attended = isPast && status === "confirmed" ? (Math.random() > 0.15 ? true : false) : null;

      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        user_id: user.id,
        status,
        payment_status: paymentStatus,
        amount: 80.00,
        paid_amount: paymentStatus === "paid" ? 80.00 : null,
        currency: "ILS",
        attended,
      });

      if (error) {
        if (error.message.includes("duplicate key")) continue;
        console.error(`  REG FAIL: ${user.first_name} → event ${event.id}: ${error.message}`);
      } else {
        regCount++;
      }
    }
  }
  console.log(`  ${regCount} registrations created.\n`);

  // ─── MATCH RESULTS ───────────────────────────────────────
  console.log("Creating match results...");
  let matchCount = 0;

  // Create matches for past events only
  const pastUkEvents = ukEvents.filter((e) => e.event_date < today);
  const pastIlEvents = ilEvents.filter((e) => e.event_date < today);

  // UK matches
  for (const event of pastUkEvents) {
    // Get confirmed attendees for this event
    const { data: regs } = await supabase
      .from("event_registrations")
      .select("user_id, profiles!inner(gender)")
      .eq("event_id", event.id)
      .eq("status", "confirmed")
      .eq("attended", true);

    if (!regs?.length) continue;

    const males = regs.filter((r: any) => r.profiles?.gender === "male");
    const females = regs.filter((r: any) => r.profiles?.gender === "female");

    // Create some mutual matches and some no-matches
    for (const male of males) {
      for (const female of females) {
        const rand = Math.random();
        const resultType = rand > 0.6 ? "mutual_date" : rand > 0.35 ? "mutual_friend" : "no_match";

        const { error } = await supabase.from("match_results").insert({
          event_id: event.id,
          user_a_id: male.user_id,
          user_b_id: female.user_id,
          result_type: resultType,
        });

        if (error) {
          if (error.message.includes("duplicate key")) continue;
          console.error(`  MATCH FAIL: ${error.message}`);
        } else {
          matchCount++;
        }
      }
    }
  }

  // IL matches
  for (const event of pastIlEvents) {
    const { data: regs } = await supabase
      .from("event_registrations")
      .select("user_id, profiles!inner(gender)")
      .eq("event_id", event.id)
      .eq("status", "confirmed")
      .eq("attended", true);

    if (!regs?.length) continue;

    const males = regs.filter((r: any) => r.profiles?.gender === "male");
    const females = regs.filter((r: any) => r.profiles?.gender === "female");

    for (const male of males) {
      for (const female of females) {
        const rand = Math.random();
        const resultType = rand > 0.55 ? "mutual_date" : rand > 0.3 ? "mutual_friend" : "no_match";

        const { error } = await supabase.from("match_results").insert({
          event_id: event.id,
          user_a_id: male.user_id,
          user_b_id: female.user_id,
          result_type: resultType,
        });

        if (error) {
          if (error.message.includes("duplicate key")) continue;
          console.error(`  MATCH FAIL: ${error.message}`);
        } else {
          matchCount++;
        }
      }
    }
  }
  console.log(`  ${matchCount} match results created.\n`);

  // ─── VIP SUBSCRIPTIONS ───────────────────────────────────
  console.log("Creating VIP subscriptions...");
  let vipCount = 0;

  // Give ~30% of users a VIP subscription
  const vipCandidates = testUsers.filter(() => Math.random() > 0.7);

  for (const user of vipCandidates) {
    const isUk = user.country_id === 1;
    const plans = ["1_month", "3_month", "6_month", "12_month"] as const;
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const priceMap = { "1_month": 19.99, "3_month": 14.99, "6_month": 11.99, "12_month": 9.99 };
    const now = new Date();
    const periodStart = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000); // up to 60 days ago
    const months = parseInt(plan);
    const periodEnd = new Date(periodStart.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    const isExpired = periodEnd < now;
    const status = isExpired ? (Math.random() > 0.5 ? "expired" : "cancelled") : "active";

    const { error } = await supabase.from("vip_subscriptions").insert({
      user_id: user.id,
      plan_type: plan,
      price_per_month: priceMap[plan],
      currency: isUk ? "GBP" : "ILS",
      status,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancelled_at: status === "cancelled" ? new Date(periodEnd.getTime() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : null,
      stripe_subscription_id: `sub_test_${user.id.slice(0, 8)}`,
      stripe_customer_id: `cus_test_${user.id.slice(0, 8)}`,
    });

    if (error) {
      console.error(`  VIP FAIL ${user.first_name}: ${error.message}`);
    } else {
      console.log(`  VIP   ${user.first_name} ${user.last_name} → ${plan} (${status})`);
      vipCount++;
    }
  }
  console.log(`  ${vipCount} VIP subscriptions created.\n`);

  // ─── SUMMARY ─────────────────────────────────────────────
  console.log("=== Summary ===");
  console.log(`  Registrations: ${regCount}`);
  console.log(`  Match results: ${matchCount}`);
  console.log(`  VIP subs:      ${vipCount}`);
  console.log(`\nAll test activity is linked to users tagged with "${TEST_MARKER}".`);
  console.log("Run 'pnpm cleanup:test-users' to remove everything (cascades via FK).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
