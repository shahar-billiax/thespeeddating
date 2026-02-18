import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { CompatibilityPageClient } from "@/components/compatibility/compatibility-page-client";

export default async function CompatibilityPage() {
  const supabase = await createClient();
  const t = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile with life alignment fields
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Fetch compatibility profile
  const { data: compatProfile } = await supabase
    .from("compatibility_profiles" as any)
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch dealbreaker preferences
  const { data: dealbreakers } = await supabase
    .from("dealbreaker_preferences" as any)
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div>
      <section className="page-hero">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Deep Compatibility
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Build your compatibility profile for smarter, more meaningful matches.
            </p>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-20">
        <div className="section-container max-w-4xl">
          <CompatibilityPageClient
            profile={profile}
            compatProfile={compatProfile ?? null}
            dealbreakers={dealbreakers ?? null}
          />
        </div>
      </section>
    </div>
  );
}
