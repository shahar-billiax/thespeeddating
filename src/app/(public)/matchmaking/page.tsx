import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchmakingForm } from "@/components/matchmaking/matchmaking-form";
import { Heart, UserSearch, Calendar, CheckCircle2 } from "lucide-react";

export default async function MatchmakingPage() {
  const { t, country } = await getTranslations();
  const supabase = await createClient();

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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(country === "gb" ? "en-GB" : "he-IL", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const steps = [
    {
      icon: UserSearch,
      titleKey: "matchmaking.step1",
    },
    {
      icon: Heart,
      titleKey: "matchmaking.step2",
    },
    {
      icon: Calendar,
      titleKey: "matchmaking.step3",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-4">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">{t("matchmaking.title")}</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("matchmaking.subtitle")}
        </p>
      </div>

      {/* Service Description */}
      <Card className="p-8 mb-16 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="text-lg">
            {country === "gb"
              ? "Our personal matchmaking service connects serious daters with compatible partners. A professional matchmaker reviews your profile, understands your preferences, and introduces you to hand-picked matches who share your values and lifestyle."
              : "שירות השידוכים האישי שלנו מחבר בין מחפשי זוגיות רציניים לבני זוג מתאימים. שדכן מקצועי בוחן את הפרופיל שלך, מבין את ההעדפות שלך, ומציג לך התאמות נבחרות בקפידה החולקות את הערכים ואורח החיים שלך."}
          </p>
        </div>
      </Card>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t("matchmaking.how_title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="p-4 rounded-full bg-primary/10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <Badge className="absolute -top-2 -right-2">{index + 1}</Badge>
                </div>
                <h3 className="font-semibold text-lg">{t(step.titleKey)}</h3>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Packages Section */}
      {packages.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            {t("matchmaking.packages_title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-4">
                    {formatPrice(pkg.price, pkg.currency)}
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {pkg.num_dates}{" "}
                        {country === "gb" ? "dates" : "דייטים"}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {pkg.duration_months}{" "}
                        {country === "gb" ? "months" : "חודשים"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Application Form */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t("matchmaking.apply")}
        </h2>
        {user ? (
          <MatchmakingForm />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {country === "gb"
                ? "Please log in to apply for matchmaking services."
                : "אנא התחבר כדי להגיש בקשה לשירותי שידוכים."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
