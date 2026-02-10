import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { getPage } from "@/lib/pages";
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
  AlertCircle,
} from "lucide-react";
import { CmsContent } from "@/components/cms/cms-content";
import Link from "next/link";

export default async function VIPPage() {
  const { t, country } = await getTranslations();
  const supabase = await createClient();
  const page = await getPage("vip");

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

  interface PricingTier {
    months: 1 | 3 | 6 | 12;
    planType: "1_month" | "3_months" | "6_months" | "12_months";
    pricePerMonth: number;
    totalPrice: number;
    badge?: "popular" | "best_value";
  }

  const pricingTiers: PricingTier[] =
    country === "gb"
      ? [
          { months: 1, planType: "1_month", pricePerMonth: 18, totalPrice: 18 },
          { months: 3, planType: "3_months", pricePerMonth: 12, totalPrice: 36, badge: "popular" },
          { months: 6, planType: "6_months", pricePerMonth: 8, totalPrice: 48 },
          { months: 12, planType: "12_months", pricePerMonth: 6, totalPrice: 72, badge: "best_value" },
        ]
      : [
          { months: 1, planType: "1_month", pricePerMonth: 69, totalPrice: 69 },
          { months: 3, planType: "3_months", pricePerMonth: 45, totalPrice: 135, badge: "popular" },
          { months: 6, planType: "6_months", pricePerMonth: 30, totalPrice: 180 },
          { months: 12, planType: "12_months", pricePerMonth: 22, totalPrice: 264, badge: "best_value" },
        ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(country === "gb" ? "en-GB" : "he-IL", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const benefits = [
    {
      icon: Percent,
      title: "Discounted Event Tickets",
      description: "Speed Dating event tickets at a special price",
    },
    {
      icon: Heart,
      title: "15% Off Matchmaking",
      description: "15% off our Match-Making service",
    },
    {
      icon: Eye,
      title: "See Who Chose You",
      description: "We reveal to you who chose you at the Speed Dating event you participated",
    },
    {
      icon: Gift,
      title: "Special Offers & Discounts",
      description: "MORE special offers and discounts!",
    },
  ];

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
              Become our VIP member and get Discounts!
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
                      ? `Expires ${new Date(activeSubscription.current_period_end).toLocaleDateString()}`
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
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-4">
            VIP Benefits
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join our exclusive VIP membership today
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

        {/* Pricing Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">
            Select Your VIP Membership Plan
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Choose the plan that works best for you
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.planType}
                className={`p-6 relative hover:shadow-xl transition-all ${
                  tier.badge === "best_value"
                    ? "border-yellow-500 shadow-lg ring-2 ring-yellow-500/20 scale-[1.02]"
                    : "hover:-translate-y-1"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge
                      className={
                        tier.badge === "best_value"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-primary"
                      }
                    >
                      {tier.badge === "best_value" ? "Best Value" : "Popular"}
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-semibold mb-2">
                    {tier.months}{" "}
                    {tier.months === 1 ? "Month" : "Months"}
                  </h3>
                  <div className="mb-1">
                    <span className="text-4xl font-bold">
                      {formatPrice(tier.pricePerMonth)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /month
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
                      <CheckCircle2 className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span>{benefit.title}</span>
                    </div>
                  ))}
                </div>

                {user ? (
                  <Button
                    className={`w-full ${
                      tier.badge === "best_value"
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : ""
                    }`}
                    disabled={!!activeSubscription}
                  >
                    {activeSubscription ? "Current Plan" : "Buy VIP Membership"}
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${
                      tier.badge === "best_value"
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : ""
                    }`}
                    asChild
                  >
                    <Link href="/login">Buy VIP Membership</Link>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Auto-Renewal Notice */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Important Notice</p>
                <p>
                  All memberships will renew automaticly after duration expired. To cancel
                  please write an email to{" "}
                  <a
                    href="mailto:Cancel@TheSpeedDating.co.uk"
                    className="text-primary hover:underline font-medium"
                  >
                    Cancel@TheSpeedDating.co.uk
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
