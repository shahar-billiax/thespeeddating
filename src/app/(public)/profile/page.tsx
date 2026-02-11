import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { t } = await getTranslations();

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
    <div className="container mx-auto px-4 py-8">
      {isAdmin && (
        <div className="mb-6">
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
  );
}
