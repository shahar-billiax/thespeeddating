import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Calendar, Heart, Crown, TrendingUp } from "lucide-react";
import {
  getDashboardStats,
  getUpcomingRegisteredEvents,
  getPendingActions,
  getRecentMatches,
} from "@/lib/dashboard/actions";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { UpcomingEventsWidget } from "@/components/dashboard/upcoming-events-widget";
import { PendingActionsWidget } from "@/components/dashboard/pending-actions-widget";
import { RecentMatchesWidget } from "@/components/dashboard/recent-matches-widget";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";

export default async function DashboardHomePage() {
  const t = await getTranslations();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard");

  // Fetch profile + all dashboard data in parallel
  const [
    { data: profile },
    { data: compatProfile },
    { data: dealbreakers },
    stats,
    upcomingEvents,
    pendingActions,
    recentMatches,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "first_name, last_name, avatar_url, bio, occupation, faith, religion_importance, practice_frequency, wants_children, career_ambition, work_life_philosophy, education_level, date_of_birth, gender, city_id"
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("compatibility_profiles" as any)
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("dealbreaker_preferences" as any)
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    getDashboardStats(),
    getUpcomingRegisteredEvents(),
    getPendingActions(),
    getRecentMatches(),
  ]);

  // Calculate completion for welcome card.
  // Base profile fields = 70%; compatibility broken into 3×10%:
  //   10% life alignment (all 7 life alignment fields set)
  //   10% personality assessment (compatibility_profiles row exists)
  //   10% dealbreaker preferences (dealbreaker_preferences row exists)
  const coreProfileFields = [
    profile?.first_name,
    profile?.last_name,
    profile?.date_of_birth,
    profile?.gender,
    profile?.bio,
    profile?.occupation,
    profile?.faith,
    profile?.city_id,
    profile?.avatar_url,
  ];
  const filledFields = coreProfileFields.filter(Boolean).length;
  const baseCompletion = Math.round((filledFields / coreProfileFields.length) * 70);

  const p = profile as any;
  const lifeAlignmentDone = !!(
    p?.faith &&
    p?.religion_importance != null && p?.religion_importance !== "" &&
    p?.practice_frequency &&
    p?.wants_children &&
    p?.career_ambition != null && p?.career_ambition !== "" &&
    p?.work_life_philosophy != null && p?.work_life_philosophy !== "" &&
    p?.education_level != null && p?.education_level !== ""
  );
  const compatCompletion =
    (lifeAlignmentDone ? 10 : 0) +
    (compatProfile ? 10 : 0) +
    (dealbreakers ? 10 : 0);

  const profileCompletion = Math.min(baseCompletion + compatCompletion, 100);

  // Direct "Complete Now" to the right place:
  // if compat questionnaire is incomplete → onboarding; otherwise → profile page
  const compatIncomplete = !lifeAlignmentDone || !compatProfile;
  const completeNowHref = compatIncomplete ? "/onboarding" : "/dashboard/profile";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <WelcomeCard
        firstName={profile?.first_name || ""}
        profileCompletion={profileCompletion}
        completeHref={completeNowHref}
      />

      {/* Pending Actions — show prominently at top when they exist */}
      {pendingActions.length > 0 && (
        <PendingActionsWidget actions={pendingActions} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Calendar}
          label={t("dashboard.stats.events_attended")}
          value={stats.eventsAttended}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Heart}
          label={t("dashboard.stats.mutual_matches")}
          value={stats.mutualMatches}
          iconClassName="bg-pink-50 text-pink-600"
        />
        <StatCard
          icon={TrendingUp}
          label={t("dashboard.stats.compatibility_score")}
          value={`${profileCompletion}%`}
          iconClassName="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={Crown}
          label={t("dashboard.stats.vip_status")}
          value={
            stats.isVip
              ? t("dashboard.stats.active")
              : t("dashboard.stats.inactive")
          }
          iconClassName={
            stats.isVip
              ? "bg-amber-50 text-amber-600"
              : "bg-gray-50 text-gray-400"
          }
        />
      </div>

      {/* Two-column: Upcoming Events + Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <UpcomingEventsWidget events={upcomingEvents} />
        <RecentMatchesWidget matches={recentMatches} />
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid />
    </div>
  );
}
