import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { getPage } from "@/lib/pages";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchmakingForm } from "@/components/matchmaking/matchmaking-form";
import { CmsContent } from "@/components/cms/cms-content";
import { Heart, CheckCircle2 } from "lucide-react";

const FALLBACK_PACKAGES = [
  {
    id: "fallback-3m",
    name: "3 Months",
    price: 700,
    currency: "GBP",
    num_dates: 5,
    duration_months: 3,
    popular: false,
  },
  {
    id: "fallback-6m",
    name: "6 Months",
    price: 950,
    currency: "GBP",
    num_dates: 10,
    duration_months: 6,
    popular: true,
  },
  {
    id: "fallback-1y",
    name: "1 Year",
    price: 1450,
    currency: "GBP",
    num_dates: 20,
    duration_months: 12,
    popular: false,
  },
];

export default async function MatchmakingPage() {
  const { t, country } = await getTranslations();
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

  const displayPackages =
    packages.length > 0 ? packages : FALLBACK_PACKAGES;

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
      {page?.content_html && (
        <div className="max-w-4xl mx-auto mb-16">
          <CmsContent html={page.content_html} />
        </div>
      )}

      {/* Packages / Pricing Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          {t("matchmaking.packages_title")}
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Choose the package that suits your needs. All packages include a
          personal interview and dedicated matchmaker.
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
                    Most Popular
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
                        Including {pkg.num_dates}{" "}
                        {pkg.num_dates === 1 ? "date" : "dates"}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>
                        {pkg.duration_months}{" "}
                        {pkg.duration_months === 1 ? "month" : "months"}{" "}
                        membership
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Personal interview</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Dedicated matchmaker</span>
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
            Register With Us Today
          </h2>
          <p className="text-lg text-muted-foreground">
            It&apos;s easy: Just give it a chance.
          </p>
        </div>

        {user ? (
          <MatchmakingForm />
        ) : (
          <Card>
            <CardContent className="text-center py-4">
              <Heart className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                {country === "gb"
                  ? "Please log in or create an account to apply for our matchmaking service."
                  : "אנא התחבר או צור חשבון כדי להגיש בקשה לשירותי שידוכים."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                  Log In
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Create Account
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
