import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getPage } from "@/lib/pages";
import { getPageFallbackHtml } from "@/lib/i18n/page-fallbacks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { CmsContent } from "@/components/cms/cms-content";
import { UserPlus, Calendar, Heart, Crown, Users, Sparkles, ArrowRight, MapPin } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const page = await getPage("home");
  return {
    title: page?.meta_title || t("meta.home_title"),
    description: page?.meta_description || t("meta.home_description"),
  };
}

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const headerStore = await headers();
  const countryCode = headerStore.get("x-country") || "gb";
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
      <section className="hero-bg relative overflow-hidden py-10 sm:py-20 lg:py-24">
        <div className="hero-gradient-layer-2" aria-hidden="true" />
        <div className="hero-gradient-layer-3" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, oklch(0.35 0.14 12 / 0.4) 100%)",
          }}
        />
        <div className="section-container relative z-10">
          <div className="hero-glass mx-auto max-w-6xl px-5 py-7 sm:px-12 sm:py-12 lg:px-20 lg:py-16 rtl:lg:py-20">
            <div className="text-center space-y-7 rtl:space-y-9 text-white">
              <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-white/50 font-semibold rtl:normal-case rtl:tracking-[0.08em] rtl:font-semibold">
                {t("home.hero_subtitle")}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.08] rtl:font-[800] rtl:leading-[1.18] rtl:tracking-[-0.01em]">
                {t("home.hero_heading")}{" "}
                <span className="text-hero-accent">{t("home.hero_heading_highlight")}</span>
              </h1>
              <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed font-light rtl:font-normal rtl:leading-[1.75]">
                {t("home.hero_description")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <Button size="lg" variant="secondary" className="text-base px-8 h-12 shadow-lg hover:shadow-xl transition-shadow" asChild>
                  <Link href="/events">
                    <Calendar className="me-2 h-5 w-5" />
                    {t("home.browse_events")}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-base px-8 h-12 backdrop-blur-sm transition-colors"
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
          <section className="py-10 sm:py-12 bg-white border-b">
            <div className="section-container">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto text-center">
                {stats.map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* CMS Welcome Content */}
      {(page?.content_html || getPageFallbackHtml("home", locale)) && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <CmsContent html={(page?.content_html || getPageFallbackHtml("home", locale))!} />
            </div>
          </div>
        </section>
      )}

      {/* Quick Links + Upcoming Events — single unified section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-white from-0% via-gray-50 via-20% to-gray-50">
        {/* Quick Links Grid */}
        <div className="section-container mb-16 sm:mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            <Link href="/vip" className="group">
              <Card className="h-full border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.05)] group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-1 ring-border/60 group-hover:ring-primary/20 transition-all duration-200 group-hover:-translate-y-0.5">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Crown className="h-7 w-7 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">{t("home.card_vip_title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("home.card_vip_desc")}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/matchmaking" className="group">
              <Card className="h-full border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.05)] group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-1 ring-border/60 group-hover:ring-primary/20 transition-all duration-200 group-hover:-translate-y-0.5">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-pink-50 flex items-center justify-center">
                    <Heart className="h-7 w-7 text-pink-500" />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">{t("home.card_matches_title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("home.card_matches_desc")}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/success-stories" className="group">
              <Card className="h-full border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.05)] group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-1 ring-border/60 group-hover:ring-primary/20 transition-all duration-200 group-hover:-translate-y-0.5">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">{t("home.card_stories_title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("home.card_stories_desc")}</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/what-is-speed-dating" className="group">
              <Card className="h-full border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.05)] group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-1 ring-border/60 group-hover:ring-primary/20 transition-all duration-200 group-hover:-translate-y-0.5">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Users className="h-7 w-7 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">{t("home.card_speed_dating_title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("home.card_speed_dating_desc")}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="section-container">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {t("home.upcoming_title")}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t("home.advance_bookings_note")}
            </p>
          </div>

          {events && events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {events.map((event) => {
                  const eventDate = new Date(event.event_date + "T" + (event.start_time || "00:00"));
                  const dayFormatter = new Intl.DateTimeFormat(locale, { day: "numeric" });
                  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short" });
                  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
                  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

                  return (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <Card className="group flex h-full flex-col border-0 p-0 gap-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-border/60 hover:ring-primary/20 transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1">
                        {/* Top section with date & type badge */}
                        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5 text-sm font-bold text-foreground">
                            <span className="uppercase">{weekdayFormatter.format(eventDate)}</span>
                            <span className="text-muted-foreground/40">,</span>
                            <span>{dayFormatter.format(eventDate)} {monthFormatter.format(eventDate)}</span>
                          </div>
                          {event.event_type && (
                            <span className="text-xs font-semibold tracking-wide bg-primary/8 text-primary px-2.5 py-1 rounded-full">
                              {event.event_type.replace(/_/g, " ").toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Venue & location */}
                        <div className="px-4 pb-1">
                          {event.venues?.name && (
                            <h3 className="font-semibold text-foreground text-[15px] leading-snug line-clamp-1">
                              {event.venues.name}
                            </h3>
                          )}
                          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {event.cities?.name}
                          </p>
                        </div>

                        {/* Details row */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground px-4 pb-3">
                          {event.start_time && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0 text-primary/60" />
                              <span className="tabular-nums">{timeFormatter.format(eventDate)}</span>
                            </span>
                          )}
                          {event.age_min && event.age_max && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 shrink-0 text-primary/60" />
                              <span>{t("events.ages", { min: String(event.age_min), max: String(event.age_max) })}</span>
                            </span>
                          )}
                        </div>

                        {/* Price & CTA */}
                        <div className="mt-auto px-4 py-3 border-t border-border/30 flex items-center justify-between gap-2">
                          <p className="text-base font-bold text-foreground tracking-tight">
                            {event.price ? priceFormatter.format(event.price) : t("events.free")}
                          </p>
                          <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">
                            {t("home.view_event")}
                            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="text-center">
                <Button size="lg" className="px-8 h-12 shadow-sm" asChild>
                  <Link href="/events">
                    {t("home.see_all_events")}
                    <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-6">
                {t("home.no_events")}
              </p>
              <Button size="lg" asChild>
                <Link href="/register">{t("home.get_notified")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Recent Weddings Banner */}
      <section className="py-10 sm:py-12 bg-primary/5 border-y border-primary/10">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-start">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary fill-primary/20" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">{t("home.mazal_tov")}</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              {t("home.recent_weddings_text")}
            </p>
            <Button variant="outline" className="shrink-0" asChild>
              <Link href="/success-stories">{t("home.read_stories")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary via-primary to-primary/85">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center space-y-5 text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              {t("home.cta_heading")}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              {t("home.cta_subtext")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" variant="secondary" className="text-base px-8 h-12 shadow-lg" asChild>
                <Link href="/register">{t("home.sign_up_now")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/25 text-base px-8 h-12 backdrop-blur-sm"
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
