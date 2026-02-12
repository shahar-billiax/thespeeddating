import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { getPage } from "@/lib/pages";
import { getPageFallbackHtml } from "@/lib/i18n/page-fallbacks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CmsContent } from "@/components/cms/cms-content";
import { UserPlus, Calendar, Heart, Crown, Users, Sparkles, ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  const page = await getPage("home");
  return {
    title: page?.meta_title || t("meta.home_title"),
    description: page?.meta_description || t("meta.home_description"),
  };
}

export default async function HomePage() {
  const { t, locale, country: countryCode } = await getTranslations();
  const supabase = await createClient();
  const page = await getPage("home");

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
      event_type,
      age_min,
      age_max,
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

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-accent py-24 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-4xl text-center space-y-8 text-white">
            <p className="text-sm sm:text-base uppercase tracking-widest text-white/70 font-medium">
              {t("home.hero_subtitle")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              {t("home.hero_heading")}{" "}
              <span className="text-yellow-300">{t("home.hero_heading_highlight")}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              {t("home.hero_description")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary" className="text-base px-8" asChild>
                <Link href="/events">
                  <Calendar className="me-2 h-5 w-5" />
                  {t("home.browse_events")}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-base px-8"
                asChild
              >
                <Link href="/register">
                  <UserPlus className="me-2 h-5 w-5" />
                  {t("home.sign_up_now")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {(() => {
        const FALLBACK_STATS = [
          { value: "120+", label: t("home.stat_weddings") },
          { value: "20+", label: t("home.stat_experience") },
          { value: "5,000+", label: t("home.stat_singles") },
          { value: "7", label: t("home.stat_minutes") },
        ];
        const cmsHome = page?.content_json as { stats?: { value: string; label: string }[] } | null;
        const stats = (cmsHome?.stats && cmsHome.stats.length > 0) ? cmsHome.stats : FALLBACK_STATS;
        return (
          <section className="py-12 bg-background border-b">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto text-center">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* CMS Welcome Content */}
      {(page?.content_html || getPageFallbackHtml("home", locale)) && (
        <section className="py-16 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <CmsContent html={(page?.content_html || getPageFallbackHtml("home", locale))!} />
            </div>
          </div>
        </section>
      )}

      {/* Quick Links Grid */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <Link href="/vip" className="group">
              <Card className="h-full hover:shadow-lg transition-all hover:border-yellow-500/50 group-hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <Crown className="h-10 w-10 mx-auto mb-3 text-yellow-500" />
                  <h3 className="font-semibold text-lg">{t("home.card_vip_title")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("home.card_vip_desc")}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/matchmaking" className="group">
              <Card className="h-full hover:shadow-lg transition-all group-hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <Heart className="h-10 w-10 mx-auto mb-3 text-pink-500" />
                  <h3 className="font-semibold text-lg">{t("home.card_matches_title")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("home.card_matches_desc")}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/success-stories" className="group">
              <Card className="h-full hover:shadow-lg transition-all group-hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold text-lg">{t("home.card_stories_title")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("home.card_stories_desc")}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/what-is-speed-dating" className="group">
              <Card className="h-full hover:shadow-lg transition-all group-hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold text-lg">{t("home.card_speed_dating_title")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("home.card_speed_dating_desc")}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              {t("home.upcoming_title")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.advance_bookings_note")}
            </p>
          </div>

          {events && events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {events.map((event) => {
                  const eventDate = new Date(event.event_date);

                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-all hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">
                            {dateFormatter.format(eventDate)}
                          </CardTitle>
                          {event.event_type && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                              {event.event_type.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <div className="font-medium text-foreground">
                            {event.cities?.name}
                          </div>
                          <div>{event.venues?.name}</div>
                          {event.age_min && event.age_max && (
                            <div className="mt-1">{t("events.ages", { min: String(event.age_min), max: String(event.age_max) })}</div>
                          )}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {event.price ? priceFormatter.format(event.price) : t("events.free")}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/events/${event.id}`}>
                            {t("home.view_event")}
                            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              <div className="text-center">
                <Button variant="default" size="lg" asChild>
                  <Link href="/events">
                    {t("home.see_all_events")}
                    <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg mb-4">
                {t("home.no_events")}
              </p>
              <Button asChild>
                <Link href="/register">{t("home.get_notified")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Recent Weddings Banner */}
      <section className="py-12 bg-pink-50 dark:bg-pink-950/20 border-y">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-start">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              <span className="text-2xl font-bold">{t("home.mazal_tov")}</span>
            </div>
            <p className="text-muted-foreground">
              {t("home.recent_weddings_text")}
            </p>
            <Button variant="outline" asChild>
              <Link href="/success-stories">{t("home.read_stories")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
            <h2 className="text-2xl sm:text-4xl font-bold">
              {t("home.cta_heading")}
            </h2>
            <p className="text-white/80 text-lg">
              {t("home.cta_subtext")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-base px-8" asChild>
                <Link href="/register">{t("home.sign_up_now")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-base px-8"
                asChild
              >
                <Link href="/events">{t("home.view_upcoming")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
