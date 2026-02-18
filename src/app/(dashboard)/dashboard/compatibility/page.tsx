import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { CompatibilityPageClient } from "@/components/compatibility/compatibility-page-client";
import { Sparkles } from "lucide-react";

export default async function DashboardCompatibilityPage() {
  const supabase = await createClient();
  const t = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/compatibility");

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("dashboard.compatibility_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.compatibility_subtitle")}
          </p>
        </div>
      </div>

      <CompatibilityPageClient
        profile={profile}
        compatProfile={compatProfile ?? null}
        dealbreakers={dealbreakers ?? null}
      />
    </div>
  );
}
