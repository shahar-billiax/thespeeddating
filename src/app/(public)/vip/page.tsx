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
  AlertCircle,
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

  const { plans, benefits: benefitsData, notice, currency } = vipData;

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
      <section className="relative bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-500 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center text-white space-y-6 max-w-3xl mx-auto">
            <Crown className="h-16 w-16 mx-auto text-white/90" />
            <h1 className="text-4xl sm:text-5xl font-bold">
              {page?.title || t("vip.title")}
            </h1>
            <p className="text-xl text-white/90">
              {t("vip.hero_subtitle")}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Active Subscription Notice */}
        {activeSubscription && (
          <div className="mb-12 max-w-2xl mx-auto">
            <Card className="p-6 border-yellow-500/50 bg-yellow-500/5">
              <div className="flex items-start gap-3">
                <Crown className="h-6 w-6 text-yellow-500 mt-1" />
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
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t("vip.benefits_subtext")}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-full bg-yellow-500/10">
                      <benefit.icon className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Section */}
        {plans.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-4">
              {t("vip.plans_heading")}
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              {t("vip.plans_subtext")}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`p-6 relative hover:shadow-xl transition-all ${
                    plan.badge === "best_value"
                      ? "border-yellow-500 shadow-lg ring-2 ring-yellow-500/20 scale-[1.02]"
                      : "hover:-translate-y-1"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        className={
                          plan.badge === "best_value"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-primary"
                        }
                      >
                        {plan.badge === "best_value" ? t("vip.best_value") : t("vip.popular")}
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-lg font-semibold mb-2">
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
                    {plan.months > 1 && (
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(plan.total_price)} {t("vip.total")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <span>{benefit.title}</span>
                      </div>
                    ))}
                  </div>

                  {user ? (
                    <Button
                      className={`w-full ${
                        plan.badge === "best_value"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : ""
                      }`}
                      disabled
                    >
                      {activeSubscription ? t("vip.current_plan") : t("vip.coming_soon")}
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        plan.badge === "best_value"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
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

        {/* Auto-Renewal Notice */}
        {notice && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">{t("vip.notice_title")}</p>
                  <p>{notice}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
