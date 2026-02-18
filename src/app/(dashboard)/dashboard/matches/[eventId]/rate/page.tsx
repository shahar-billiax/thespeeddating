import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventRatingForm } from "@/components/compatibility/event-rating-form";
import { getTranslations, getLocale } from "next-intl/server";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function DashboardRatePage({ params }: Props) {
  const { eventId } = await params;
  const eventIdNum = Number(eventId);
  const t = await getTranslations();
  const locale = await getLocale();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify user attended this event
  const { data: registration } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventIdNum)
    .eq("user_id", user.id)
    .in("status", ["confirmed", "attended"])
    .single();

  if (!registration) redirect("/dashboard/matches");

  // Get user's profile for gender filtering
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("gender, sexual_preference")
    .eq("id", user.id)
    .single();

  // Get all participants (opposite gender, confirmed/attended)
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(
      `user_id, profiles!inner(id, first_name, last_name, date_of_birth, avatar_url, gender)`
    )
    .eq("event_id", eventIdNum)
    .in("status", ["confirmed", "attended"])
    .neq("user_id", user.id);

  // Filter by gender preference
  const participants = (registrations ?? [])
    .filter((r: any) => {
      if (!myProfile) return true;
      const partnerGender = r.profiles?.gender;
      if (myProfile.sexual_preference === "both") return true;
      if (myProfile.sexual_preference === "men")
        return partnerGender === "male";
      if (myProfile.sexual_preference === "women")
        return partnerGender === "female";
      // Default: opposite gender
      return partnerGender !== myProfile.gender;
    })
    .map((r: any) => {
      const age = r.profiles?.date_of_birth
        ? Math.floor(
            (Date.now() - new Date(r.profiles.date_of_birth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null;

      return {
        id: r.profiles.id,
        firstName: r.profiles.first_name,
        lastName: r.profiles.last_name,
        age,
        avatarUrl: r.profiles.avatar_url,
      };
    });

  // Get existing feedback and ratings
  const { data: existingFeedback } = await supabase
    .from("event_feedback" as any)
    .select("*")
    .eq("event_id", eventIdNum)
    .eq("user_id", user.id)
    .single();

  const { data: existingRatings } = await supabase
    .from("date_ratings" as any)
    .select("*")
    .eq("event_id", eventIdNum)
    .eq("from_user_id", user.id);

  // Get event info
  const { data: event } = await supabase
    .from("events")
    .select("event_date, event_type, cities(name)")
    .eq("id", eventIdNum)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard.rate_title")}</h1>
        {event && (
          <p className="text-muted-foreground mt-1 text-sm">
            {(event.cities as any)?.name} &middot;{" "}
            {new Date(event.event_date).toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {participants.length === 0 ? (
        <p className="text-muted-foreground text-center">
          {t("dashboard.no_participants")}
        </p>
      ) : (
        <EventRatingForm
          eventId={eventIdNum}
          participants={participants}
          existingFeedback={existingFeedback ?? null}
          existingRatings={existingRatings ?? []}
        />
      )}
    </div>
  );
}
