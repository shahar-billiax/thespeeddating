import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/layouts/public-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const [{ data: profile }, { data: compatProfile }, { data: vipSub }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url, role, bio, occupation, faith, date_of_birth, gender, city_id, country_id")
        .eq("id", user.id)
        .single(),
      supabase
        .from("compatibility_profiles" as any)
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("vip_subscriptions" as any)
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
    ]);

  const compatIncomplete = !compatProfile;

  // Calculate profile completion
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
    <div className="flex h-screen flex-col overflow-hidden">
      <PublicHeader
        user={
          user
            ? {
                email: user.email!,
                role: profile?.role ?? undefined,
                compatIncomplete,
              }
            : null
        }
      />
      <div className="flex flex-1 min-h-0 flex-col md:flex-row overflow-hidden">
        <DashboardSidebar
          user={{
            firstName: profile?.first_name || "",
            lastName: profile?.last_name || "",
            avatarUrl: profile?.avatar_url,
            isVip: !!vipSub,
            profileCompletion,
          }}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
