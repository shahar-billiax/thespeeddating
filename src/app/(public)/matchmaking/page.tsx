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
    <div>
      {/* Hero */}
      <section className="page-hero">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {page?.title || t("matchmaking.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("matchmaking.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* CMS Content */}
      {(page?.content_html || getPageFallbackHtml("matchmaking", locale)) && (
        <section className="py-16 sm:py-20">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <CmsContent html={(page?.content_html || getPageFallbackHtml("matchmaking", locale))!} />
            </div>
          </div>
        </section>
      )}

      {/* Packages / Pricing Section */}
      <section className="py-16 sm:py-20 bg-muted/40">
        <div className="section-container">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("matchmaking.packages_title")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            {t("matchmaking.packages_subtext")}
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {displayPackages.map((pkg) => {
              const isPopular =
                "popular" in pkg ? pkg.popular : pkg.duration_months === 6;
              return (
                <Card
                  key={pkg.id}
                  className={`relative border-0 shadow-sm transition-all ${
                    isPopular
                      ? "shadow-md ring-2 ring-primary/20 scale-[1.02]"
                      : "hover:shadow-md hover:-translate-y-1"
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      {t("matchmaking.most_popular")}
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-4xl font-bold text-primary mb-8">
                      {formatPrice(
                        pkg.price,
                        pkg.currency || countryData?.currency || "GBP"
                      )}
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>
                          {pkg.num_dates === 1
                            ? t("matchmaking.including_date", { count: String(pkg.num_dates) })
                            : t("matchmaking.including_dates", { count: String(pkg.num_dates) })}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>
                          {pkg.duration_months === 1
                            ? t("matchmaking.month_membership", { count: String(pkg.duration_months) })
                            : t("matchmaking.months_membership", { count: String(pkg.duration_months) })}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{t("matchmaking.personal_interview")}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{t("matchmaking.dedicated_matchmaker")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Form / CTA */}
      <section className="py-16 sm:py-20">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">
                {t("matchmaking.register_title")}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("matchmaking.register_subtext")}
              </p>
            </div>

            {user ? (
              <MatchmakingForm />
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-10">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Heart className="h-7 w-7 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                    {t("matchmaking.login_prompt")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="h-12 shadow-sm">
                      <Link href="/login">{t("nav.login")}</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-12">
                      <Link href="/register">{t("nav.register")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
