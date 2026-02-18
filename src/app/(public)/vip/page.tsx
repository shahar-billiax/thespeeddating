import type { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { getPage } from "@/lib/pages";
import { getVipData } from "@/lib/vip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Crown,
  Eye,
  Percent,
  Gift,
  Heart,
  Star,
  Shield,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CmsContent } from "@/components/cms/cms-content";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const page = await getPage("vip");
  return {
    title: page?.meta_title || t("meta.vip_title"),
    description: page?.meta_description || t("meta.vip_description"),
  };
}

const ICON_MAP: Record<string, LucideIcon> = {
  Percent, Heart, Eye, Gift, Star, Shield, Crown, Zap,
};

export default async function VIPPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const headerStore = await headers();
  const country = headerStore.get("x-country") || "gb";
  const supabase = await createClient();
  const [page, vipData] = await Promise.all([
    getPage("vip"),
    getVipData(country, locale),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let activeSubscription = null;
  if (user) {
    const { data } = await supabase
      .from("vip_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();
    activeSubscription = data;
  }

  const { plans, benefits: benefitsData, currency } = vipData;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const benefits = benefitsData.map((b) => ({
    icon: ICON_MAP[b.icon] ?? Gift,
    title: b.title,
    description: b.description,
  }));

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-500 to-amber-400 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="section-container relative">
          <div className="mx-auto max-w-3xl text-center text-white space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <Crown className="h-9 w-9" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {page?.title || t("vip.title")}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              {t("vip.hero_subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20">
        <div className="section-container max-w-7xl">
          {/* Active Subscription Notice */}
          {activeSubscription && (
            <div className="mb-14 max-w-2xl mx-auto">
              <Card className="border-0 shadow-sm bg-amber-50 dark:bg-amber-950/20 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                    <Crown className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("vip.current_plan")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeSubscription.plan_type.replace("_", " ")} &bull;{" "}
                      {activeSubscription.current_period_end
                        ? t("vip.expires", { date: new Date(activeSubscription.current_period_end).toLocaleDateString() })
                        : ""}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* CMS Content */}
          {page?.content_html && (
            <div className="max-w-4xl mx-auto mb-16">
              <CmsContent html={page.content_html} />
            </div>
          )}

          {/* Benefits Section */}
          {benefits.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-center mb-4">
                {t("vip.benefits_heading")}
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                {t("vip.benefits_subtext")}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                        <benefit.icon className="h-7 w-7 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-lg">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Section */}
          {plans.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-center mb-4">
                {t("vip.plans_heading")}
              </h2>
              <p className="text-center text-muted-foreground mb-12 leading-relaxed">
                {t("vip.plans_subtext")}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative border-0 shadow-sm transition-all p-6 ${
                      plan.badge === "best_value"
                        ? "shadow-lg ring-2 ring-amber-500/20 scale-[1.02]"
                        : "hover:shadow-md hover:-translate-y-1"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge
                          className={
                            plan.badge === "best_value"
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-primary"
                          }
                        >
                          {plan.badge === "best_value" ? t("vip.best_value") : t("vip.popular")}
                        </Badge>
                      </div>
                    )}

                    <div className="text-center mb-8 pt-2">
                      <h3 className="text-lg font-semibold mb-3">
                        {plan.months}{" "}
                        {plan.months === 1 ? t("vip.month") : t("vip.months")}
                      </h3>
                      <div className="mb-1">
                        <span className="text-4xl font-bold">
                          {formatPrice(plan.price_per_month)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {t("vip.per_month")}
                        </span>
                      </div>
                      <p className={`text-sm text-muted-foreground mt-1${plan.months <= 1 ? " invisible" : ""}`}>
                        {formatPrice(plan.total_price)} {t("vip.total")}
                      </p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span>{benefit.title}</span>
                        </div>
                      ))}
                    </div>

                    {user ? (
                      <Button
                        className={`w-full h-12 shadow-sm ${
                          plan.badge === "best_value"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : ""
                        }`}
                        disabled
                      >
                        {activeSubscription ? t("vip.current_plan") : t("vip.coming_soon")}
                      </Button>
                    ) : (
                      <Button
                        className={`w-full h-12 shadow-sm ${
                          plan.badge === "best_value"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : ""
                        }`}
                        asChild
                      >
                        <Link href="/login">{t("vip.buy_membership")}</Link>
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
