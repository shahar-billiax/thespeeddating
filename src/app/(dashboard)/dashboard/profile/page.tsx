import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import { Shield, Heart, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const t = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/profile");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) redirect("/login");

  const { data: countries } = await supabase
    .from("countries")
    .select("id, name")
    .order("name");

  const { data: cities } = await supabase
    .from("cities")
    .select("id, name, country_id")
    .order("name");

  // Check compatibility profile completion
  const p = profile as any;
  const lifeFields = [
    p.faith,
    p.religion_importance,
    p.practice_frequency,
    p.wants_children,
    p.career_ambition,
    p.work_life_philosophy,
    p.education_level,
  ];
  const lifeComplete =
    lifeFields.filter((f: any) => f != null && f !== "").length >= 7;

  const { data: compatProfile } = await supabase
    .from("compatibility_profiles" as any)
    .select("user_id")
    .eq("user_id", user.id)
    .single();
  const assessmentComplete = !!compatProfile;

  const { data: dealbreakerData } = await supabase
    .from("dealbreaker_preferences" as any)
    .select("user_id")
    .eq("user_id", user.id)
    .single();
  const prefsComplete = !!dealbreakerData;

  const stepsCompleted = [lifeComplete, assessmentComplete, prefsComplete].filter(Boolean).length;
  const allComplete = stepsCompleted === 3;
  const completionPercent = Math.round((stepsCompleted / 3) * 100);

  const isAdmin = profile.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.profile_desc")}
          </p>
        </div>
        {isAdmin && (
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <Shield className="me-2 h-3.5 w-3.5" />
              {t("profile.go_to_admin")}
            </Link>
          </Button>
        )}
      </div>

      {/* Deep Compatibility CTA */}
      <Card className={allComplete
        ? "border-green-200/60 bg-green-50/30"
        : "border-primary/20 bg-gradient-to-r from-primary/[0.04] to-transparent"
      }>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                allComplete ? "bg-green-100" : "bg-primary/10"
              }`}>
                <Heart className={`h-5 w-5 ${allComplete ? "text-green-600" : "text-primary"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[15px]">
                  {t("dashboard.compatibility_title")}
                </h3>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {allComplete
                    ? t("dashboard.compatibility_complete_msg")
                    : t("dashboard.compatibility_incomplete_msg")}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <StepStatus
                    label={t("dashboard.compatibility_step_life")}
                    complete={lifeComplete}
                  />
                  <StepStatus
                    label={t("dashboard.compatibility_step_assessment")}
                    complete={assessmentComplete}
                  />
                  <StepStatus
                    label={t("dashboard.compatibility_step_dealbreakers")}
                    complete={prefsComplete}
                  />
                </div>
                {!allComplete && (
                  <div className="mt-3 max-w-[200px]">
                    <Progress value={completionPercent} className="h-1.5" />
                  </div>
                )}
              </div>
            </div>
            <Button
              asChild
              className="shrink-0 gap-1.5"
              variant={allComplete ? "outline" : "default"}
            >
              <Link
                href={
                  allComplete
                    ? "/dashboard/compatibility?tab=matches"
                    : stepsCompleted === 0
                      ? "/onboarding"
                      : "/dashboard/compatibility"
                }
              >
                {allComplete
                  ? t("dashboard.compatibility_view_matches")
                  : stepsCompleted === 0
                    ? t("dashboard.compatibility_get_started")
                    : t("dashboard.compatibility_continue")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileForm
        profile={profile}
        countries={countries || []}
        cities={cities || []}
      />
    </div>
  );
}

function StepStatus({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[13px] ${
        complete ? "text-green-600 font-medium" : "text-muted-foreground"
      }`}
    >
      {complete ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      {label}
    </span>
  );
}
