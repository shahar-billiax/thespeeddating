import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { MyEventsList } from "@/components/events/my-events-list";

export default async function MyEventsPage() {
  const supabase = await createClient();
  const { t } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's event registrations with event details
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(
      `
      id,
      event_id,
      status,
      payment_status,
      registered_at,
      events (
        id,
        event_date,
        start_time,
        match_submission_open,
        match_results_released,
        venues (
          name
        ),
        cities (
          name
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("events(event_date)", { ascending: false });

  // Check if user has submitted matches for each event
  const eventIds = registrations?.map((reg) => reg.event_id) || [];
  const { data: submissions } = await supabase
    .from("match_scores")
    .select("event_id")
    .eq("scorer_id", user.id)
    .in("event_id", eventIds.length > 0 ? eventIds : [-1]);

  const submittedEventIds = new Set(
    submissions?.map((sub) => sub.event_id) || []
  );

  // Transform data for easier consumption
  const events =
    registrations?.map((reg: any) => ({
      id: reg.events.id,
      event_date: reg.events.event_date,
      start_time: reg.events.start_time,
      venue_name: reg.events.venues?.name || "TBD",
      city_name: reg.events.cities?.name || "",
      status: reg.status,
      payment_status: reg.payment_status,
      match_submission_open: reg.events.match_submission_open,
      match_results_released: reg.events.match_results_released,
      has_submitted_matches: submittedEventIds.has(reg.events.id),
    })) || [];

  // Separate into upcoming and past
  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter((event) => event.event_date >= today);
  const past = events.filter((event) => event.event_date < today);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("my_events.title")}</h1>
      <MyEventsList upcoming={upcoming} past={past} />
    </div>
  );
}
