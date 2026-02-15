import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

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
