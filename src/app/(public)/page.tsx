import { getTranslations } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UserPlus, Calendar, Heart } from "lucide-react";

export default async function HomePage() {
  const { t, locale, country: countryCode } = await getTranslations();
  const supabase = await createClient();

  // Get country record
  const { data: countryData } = await supabase
    .from("countries")
    .select("id, currency")
    .eq("code", countryCode)
    .single();

  // Fetch upcoming events for the current country
  const { data: events } = await supabase
    .from("events")
    .select(`
      id,
      event_date,
      start_time,
      price,
      cities (name),
      venues (name)
    `)
    .eq("country_id", countryData?.id ?? 0)
    .eq("is_published", true)
    .eq("is_cancelled", false)
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(6);

  // Date and currency formatting
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const priceFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: countryData?.currency ?? "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const currencySymbol = countryCode === "gb" ? "£" : "₪";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-accent py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-6 text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("home.hero_title")}
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              {t("home.hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/events">{t("home.browse_events")}</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30" asChild>
                <Link href="/how-it-works">{t("home.how_it_works")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.upcoming_title")}
          </h2>

          {events && events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {events.map((event) => {
                  const eventDate = new Date(event.event_date);

                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {dateFormatter.format(eventDate)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <div className="font-medium text-foreground">
                            {event.cities?.name}
                          </div>
                          <div>{event.venues?.name}</div>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {event.price ? priceFormatter.format(event.price) : t("events.free")}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/events/${event.id}`}>
                            {t("home.view_event")}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              <div className="text-center">
                <Button variant="link" asChild>
                  <Link href="/events" className="text-lg">
                    {t("home.see_all_events")} →
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground text-lg">
              {t("home.no_events")}
            </p>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.how_it_works")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t("home.step1_title")}</h3>
              <p className="text-muted-foreground">{t("home.step1_desc")}</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t("home.step2_title")}</h3>
              <p className="text-muted-foreground">{t("home.step2_desc")}</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t("home.step3_title")}</h3>
              <p className="text-muted-foreground">{t("home.step3_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.testimonials_title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-4xl text-primary/30">"</div>
                  <p className="text-muted-foreground italic">
                    {t("home.testimonial1_quote")}
                  </p>
                  <p className="font-semibold text-sm">
                    — {t("home.testimonial1_name")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-4xl text-primary/30">"</div>
                  <p className="text-muted-foreground italic">
                    {t("home.testimonial2_quote")}
                  </p>
                  <p className="font-semibold text-sm">
                    — {t("home.testimonial2_name")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-4xl text-primary/30">"</div>
                  <p className="text-muted-foreground italic">
                    {t("home.testimonial3_quote")}
                  </p>
                  <p className="font-semibold text-sm">
                    — {t("home.testimonial3_name")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold">
              {t("home.cta_title")}
            </h2>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">{t("home.cta_button")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
