import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { getVipData } from "@/lib/vip";
import { getSubscriptionDetails } from "@/lib/dashboard/actions";
import { SubscriptionClient } from "@/components/dashboard/subscription-client";
import { Crown } from "lucide-react";

export default async function DashboardSubscriptionPage() {
  const supabase = await createClient();
  const t = await getTranslations();
  const locale = await getLocale();
  const headerStore = await headers();
  const country = headerStore.get("x-country") || "gb";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/subscription");

  const [subscription, vipData] = await Promise.all([
    getSubscriptionDetails(),
    getVipData(country, locale),
  ]);

  const sub = subscription as any;
  const { plans, benefits: benefitsData, notice, currency } = vipData;

  // Serialize benefits (pass icon as string, not component)
  const benefits = benefitsData.map((b: any) => ({
    icon: b.icon as string,
    title: b.title as string,
    description: b.description as string,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("dashboard.subscription")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.subscription_manage")}
          </p>
        </div>
      </div>

      <SubscriptionClient
        subscription={
          sub
            ? {
                id: sub.id,
                plan_type: sub.plan_type,
                price_per_month: sub.price_per_month,
                currency: sub.currency || currency,
                status: sub.status,
                auto_renew: sub.auto_renew ?? true,
                current_period_start: sub.current_period_start,
                current_period_end: sub.current_period_end,
                cancelled_at: sub.cancelled_at,
                created_at: sub.created_at,
              }
            : null
        }
        plans={plans}
        benefits={benefits}
        notice={notice}
        currency={currency}
        locale={locale}
      />
    </div>
  );
}
