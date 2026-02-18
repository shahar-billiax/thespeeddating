import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { SettingsClient } from "@/components/dashboard/settings-client";
import { Settings } from "lucide-react";

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const t = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscribed_email, subscribed_phone, subscribed_sms")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("dashboard.settings")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.settings_subtitle")}
          </p>
        </div>
      </div>

      <SettingsClient
        notificationPrefs={{
          subscribed_email: profile.subscribed_email,
          subscribed_phone: profile.subscribed_phone,
          subscribed_sms: profile.subscribed_sms,
        }}
      />
    </div>
  );
}
