import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Crown,
  Eye,
  Calendar,
  Percent,
} from "lucide-react";
import Link from "next/link";

interface PricingTier {
  months: 1 | 3 | 6 | 12;
  planType: "1_month" | "3_months" | "6_months" | "12_months";
  pricePerMonth: number;
  totalPrice: number;
  badge?: "popular" | "best_value";
}

export default async function VIPPage() {
  const { t, country } = await getTranslations();
  const supabase = await createClient();

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

  const currency = country === "gb" ? "GBP" : "ILS";
  const currencySymbol = country === "gb" ? "£" : "₪";

  const pricingTiers: PricingTier[] =
    country === "gb"
      ? [
          {
            months: 1,
            planType: "1_month",
            pricePerMonth: 29.99,
            totalPrice: 29.99,
          },
          {
            months: 3,
            planType: "3_months",
            pricePerMonth: 24.99,
            totalPrice: 74.97,
            badge: "popular",
          },
          {
            months: 6,
            planType: "6_months",
            pricePerMonth: 19.99,
            totalPrice: 119.94,
          },
          {
            months: 12,
            planType: "12_months",
            pricePerMonth: 14.99,
            totalPrice: 179.88,
            badge: "best_value",
          },
        ]
      : [
          {
            months: 1,
            planType: "1_month",
            pricePerMonth: 109,
            totalPrice: 109,
          },
          {
            months: 3,
            planType: "3_months",
            pricePerMonth: 89,
            totalPrice: 267,
            badge: "popular",
          },
          {
            months: 6,
            planType: "6_months",
            pricePerMonth: 69,
            totalPrice: 414,
          },
          {
            months: 12,
            planType: "12_months",
            pricePerMonth: 49,
            totalPrice: 588,
            badge: "best_value",
          },
        ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(country === "gb" ? "en-GB" : "he-IL", {
      style: "currency",
      currency,
      minimumFractionDigits: country === "gb" ? 2 : 0,
      maximumFractionDigits: country === "gb" ? 2 : 0,
    }).format(price);
  };

  const benefits = [
    {
      icon: Percent,
      titleKey: "vip.benefit_1",
    },
    {
      icon: Eye,
      titleKey: "vip.benefit_2",
    },
    {
      icon: Calendar,
      titleKey: "vip.benefit_3",
    },
    {
      icon: Crown,
      titleKey: "vip.benefit_4",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">{t("vip.title")}</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("vip.subtitle")}
        </p>
      </div>

      {/* Active Subscription Notice */}
      {activeSubscription && (
        <div className="mb-12 max-w-2xl mx-auto">
          <Card className="p-6 border-yellow-500/50 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <Crown className="h-6 w-6 text-yellow-500 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{t("vip.current_plan")}</h3>
                <p className="text-sm text-muted-foreground">
                  {activeSubscription.plan_type.replace("_", " ")} •{" "}
                  {activeSubscription.current_period_end
                    ? new Date(activeSubscription.current_period_end).toLocaleDateString()
                    : ""}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t("vip.benefits_title")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t(benefit.titleKey)}</h3>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">
          {t("vip.pricing_title")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.planType}
              className={`p-6 relative ${
                tier.badge === "best_value"
                  ? "border-primary shadow-lg scale-105"
                  : ""
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    variant={
                      tier.badge === "best_value" ? "default" : "secondary"
                    }
                  >
                    {tier.badge === "best_value"
                      ? t("vip.best_value")
                      : t("vip.popular")}
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {tier.months}{" "}
                  {tier.months === 1
                    ? country === "gb"
                      ? "Month"
                      : "חודש"
                    : country === "gb"
                    ? "Months"
                    : "חודשים"}
                </h3>
                <div className="mb-1">
                  <span className="text-3xl font-bold">
                    {formatPrice(tier.pricePerMonth)}
                  </span>
                  <span className="text-muted-foreground">
                    /{t("vip.per_month")}
                  </span>
                </div>
                {tier.months > 1 && (
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(tier.totalPrice)} total
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{t(benefit.titleKey)}</span>
                  </div>
                ))}
              </div>

              {user ? (
                <Button className="w-full" disabled={!!activeSubscription}>
                  {activeSubscription
                    ? "Current Plan"
                    : t("vip.subscribe")}
                </Button>
              ) : (
                <Button className="w-full" asChild>
                  <Link href="/login">{t("vip.subscribe")}</Link>
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
