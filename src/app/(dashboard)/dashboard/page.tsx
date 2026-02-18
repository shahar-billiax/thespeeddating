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
    stats,
    upcomingEvents,
    pendingActions,
    recentMatches,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "first_name, last_name, avatar_url, bio, occupation, faith, date_of_birth, gender, city_id"
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("compatibility_profiles" as any)
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    getDashboardStats(),
    getUpcomingRegisteredEvents(),
    getPendingActions(),
    getRecentMatches(),
  ]);

  // Calculate completion for welcome card
  const profileFields = [
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
  const filledFields = profileFields.filter(Boolean).length;
  const baseCompletion = Math.round((filledFields / profileFields.length) * 70);
  const compatCompletion = compatProfile ? 30 : 0;
  const profileCompletion = Math.min(baseCompletion + compatCompletion, 100);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <WelcomeCard
        firstName={profile?.first_name || ""}
        profileCompletion={profileCompletion}
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
          subtitle={t("dashboard.profile_completion")}
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

      {/* Quick Actions */}
      <QuickActionsGrid />

      {/* Two-column: Upcoming Events + Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <UpcomingEventsWidget events={upcomingEvents} />
        <RecentMatchesWidget matches={recentMatches} />
      </div>
    </div>
  );
}
