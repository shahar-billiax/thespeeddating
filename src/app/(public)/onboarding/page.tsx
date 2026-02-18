import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const t = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch existing data (user may have partially completed onboarding)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: compatProfile } = await supabase
    .from("compatibility_profiles" as any)
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: dealbreakers } = await supabase
    .from("dealbreaker_preferences" as any)
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Check if user already completed onboarding
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
  const lifeComplete = lifeFields.filter((f: any) => f != null && f !== "").length >= 7;
  const assessmentComplete = !!compatProfile;

  // If fully complete, redirect to matches
  if (lifeComplete && assessmentComplete && dealbreakers) {
    redirect("/compatibility?tab=matches");
  }

  return (
    <div>
      <section className="page-hero">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {t("compat.onboarding_title")}
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("compat.onboarding_desc")}
            </p>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="section-container max-w-2xl">
          <OnboardingWizard
            profile={profile}
            compatProfile={compatProfile ?? null}
            dealbreakers={dealbreakers ?? null}
          />
        </div>
      </section>
    </div>
  );
}
