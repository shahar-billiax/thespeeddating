import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import { Shield, Heart, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const supabase = await createClient();
  const t = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  // Fetch all countries
  const { data: countries } = await supabase
    .from("countries")
    .select("id, name")
    .order("name");

  // Fetch all cities
  const { data: cities } = await supabase
    .from("cities")
    .select("id, name, country_id")
    .order("name");

  // Check compatibility profile completion
  // Cast to any — compatibility fields exist in DB but not in generated types
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

  const isAdmin = profile.role === "admin";

  return (
    <div>
      <section className="page-hero">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("profile.title")}</h1>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-20">
        <div className="section-container max-w-5xl">
          {isAdmin && (
            <div className="mb-8">
              <Button asChild variant="outline">
                <Link href="/admin">
                  <Shield className="me-2 h-4 w-4" />
                  {t("profile.go_to_admin")}
                </Link>
              </Button>
            </div>
          )}

          {/* Deep Compatibility CTA */}
          <Card className="mb-8">
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Heart className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Deep Compatibility</h3>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {allComplete
                      ? "Your compatibility profile is complete. View your matches!"
                      : "Complete your compatibility profile to get matched based on values, personality, and life goals."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <StepStatus label="Life Alignment" complete={lifeComplete} />
                    <StepStatus label="Assessment" complete={assessmentComplete} />
                    <StepStatus label="Dealbreakers" complete={prefsComplete} />
                  </div>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link href={allComplete ? "/compatibility?tab=matches" : stepsCompleted === 0 ? "/onboarding" : "/compatibility"}>
                  {allComplete ? "View Matches" : stepsCompleted === 0 ? "Get Started" : "Continue"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <ProfileForm
            profile={profile}
            countries={countries || []}
            cities={cities || []}
          />
        </div>
      </section>
    </div>
  );
}

function StepStatus({ label, complete }: { label: string; complete: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 ${complete ? "text-green-600" : "text-muted-foreground"}`}>
      {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
