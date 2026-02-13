import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { getPage } from "@/lib/pages";
import { getPageFallbackHtml } from "@/lib/i18n/page-fallbacks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchmakingForm } from "@/components/matchmaking/matchmaking-form";
import { CmsContent } from "@/components/cms/cms-content";
import { Heart, CheckCircle2 } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const page = await getPage("matchmaking");
  return {
    title: page?.meta_title || t("meta.matchmaking_title"),
    description: page?.meta_description || t("meta.matchmaking_description"),
  };
}

export default async function MatchmakingPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const headerStore = await headers();
  const country = headerStore.get("x-country") || "gb";
  const supabase = await createClient();
  const page = await getPage("matchmaking");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: countryData } = await supabase
    .from("countries")
    .select("id, currency")
    .eq("code", country)
    .single();

  let packages: any[] = [];
  if (countryData) {
    const { data } = await supabase
      .from("matchmaking_packages")
      .select("*")
      .eq("country_id", countryData.id)
      .eq("is_active", true)
      .order("price", { ascending: true });
    packages = data || [];
  }

  const displayPackages = packages;

  function formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat(country === "gb" ? "en-GB" : "he-IL", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {page?.title || t("matchmaking.title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("matchmaking.subtitle")}
        </p>
      </div>

      {/* CMS Content */}
      {(page?.content_html || getPageFallbackHtml("matchmaking", locale)) && (
        <div className="max-w-4xl mx-auto mb-16">
          <CmsContent html={(page?.content_html || getPageFallbackHtml("matchmaking", locale))!} />
        </div>
      )}

      {/* Packages / Pricing Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          {t("matchmaking.packages_title")}
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          {t("matchmaking.packages_subtext")}
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayPackages.map((pkg) => {
            const isPopular =
              "popular" in pkg ? pkg.popular : pkg.duration_months === 6;
            return (
              <Card
                key={pkg.id}
                className={`relative ${isPopular ? "border-primary shadow-md" : ""}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {t("matchmaking.most_popular")}
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-primary mb-6">
                    {formatPrice(
                      pkg.price,
                      pkg.currency || countryData?.currency || "GBP"
                    )}
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>
                        {pkg.num_dates === 1
                          ? t("matchmaking.including_date", { count: String(pkg.num_dates) })
                          : t("matchmaking.including_dates", { count: String(pkg.num_dates) })}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>
                        {pkg.duration_months === 1
                          ? t("matchmaking.month_membership", { count: String(pkg.duration_months) })
                          : t("matchmaking.months_membership", { count: String(pkg.duration_months) })}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{t("matchmaking.personal_interview")}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{t("matchmaking.dedicated_matchmaker")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Application Form / CTA */}
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">
            {t("matchmaking.register_title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("matchmaking.register_subtext")}
          </p>
        </div>

        {user ? (
          <MatchmakingForm />
        ) : (
          <Card>
            <CardContent className="text-center py-4">
              <Heart className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                {t("matchmaking.login_prompt")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/register">{t("nav.register")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
