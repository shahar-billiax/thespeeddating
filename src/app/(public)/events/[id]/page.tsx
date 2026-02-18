import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Calendar, Clock, MapPin, Users, Ticket, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { getActivePricingTier } from "@/lib/pricing";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations();

  const { data: event } = await supabase
    .from("events")
    .select(`
      event_date,
      event_type,
      cities:city_id (name),
      venues:venue_id (name)
    `)
    .eq("id", Number(id))
    .single();

  if (!event) {
    return {
      title: t("events.not_found"),
    };
  }

  const eventDate = new Date(event.event_date);
  const dateStr = eventDate.toLocaleDateString();

  return {
    title: `${t(`events.type.${event.event_type}`)} - ${event.cities?.name} - ${dateStr}`,
    description: `${t(`events.type.${event.event_type}`)} in ${event.cities?.name} at ${event.venues?.name} on ${dateStr}`,
    alternates: {
      canonical: `/events/${id}`,
    },
    openGraph: {
      title: `${t(`events.type.${event.event_type}`)} - ${event.cities?.name} - ${dateStr}`,
      description: `${t(`events.type.${event.event_type}`)} in ${event.cities?.name} at ${event.venues?.name} on ${dateStr}`,
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations();
  const locale = await getLocale();
  const headerStore = await headers();
  const country = headerStore.get("x-country") || "gb";
  const supabase = await createClient();

  // Get event details, registration counts, and user auth in parallel
  const eventId = Number(id);
  const [{ data: event }, { data: registrations }, { data: { user } }] = await Promise.all([
    supabase
      .from("events")
      .select(`
        *,
        cities:city_id (
          id,
          name,
          timezone
        ),
        venues:venue_id (
          id,
          name,
          address,
          description,
          dress_code,
          transport_info,
          map_url,
          phone,
          website
        ),
        countries:country_id (
          currency
        )
      `)
      .eq("id", eventId)
      .single(),
    supabase
      .from("event_registrations")
      .select("user_id, users:user_id(gender)")
      .eq("event_id", eventId)
      .eq("status", "confirmed"),
    supabase.auth.getUser(),
  ]);

  if (!event || !event.is_published) {
    notFound();
  }

  const maleCount = registrations?.filter((r) => r.users?.gender === "male").length || 0;
  const femaleCount = registrations?.filter((r) => r.users?.gender === "female").length || 0;
  const totalCount = maleCount + femaleCount;

  // Check if event is full
  const isFull = () => {
    if (event.limit_male && event.limit_female) {
      return maleCount >= event.limit_male && femaleCount >= event.limit_female;
    }
    return false;
  };

  const eventFull = isFull();

  // Format date and time
  const eventDate = new Date(event.event_date + 'T' + event.start_time);
  const endDate = event.end_time ? new Date(event.event_date + 'T' + event.end_time) : null;
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Format currency
  const currency = event.countries?.currency || "GBP";
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  });

  // Compute active pricing tier
  const activeTier = getActivePricingTier({
    price: event.price,
    price_male: event.price_male,
    price_female: event.price_female,
    enable_gendered_price: event.enable_gendered_price,
    vip_price: event.vip_price,
    vip_price_male: event.vip_price_male,
    vip_price_female: event.vip_price_female,
    currency: currency,
    early_bird_enabled: event.early_bird_enabled,
    early_bird_price: event.early_bird_price,
    early_bird_price_male: event.early_bird_price_male,
    early_bird_price_female: event.early_bird_price_female,
    early_bird_deadline: event.early_bird_deadline,
    last_minute_enabled: event.last_minute_enabled,
    last_minute_price: event.last_minute_price,
    last_minute_price_male: event.last_minute_price_male,
    last_minute_price_female: event.last_minute_price_female,
    last_minute_activation: event.last_minute_activation,
    last_minute_days_before: event.last_minute_days_before,
    last_minute_mode: event.last_minute_mode,
    event_date: event.event_date,
    start_time: event.start_time,
  });

  // Format age range
  const getAgeRange = () => {
    if (event.enable_gendered_age) {
      return (
        <div className="space-y-0.5">
          <p>{t("events.men")}: {event.age_min_male}-{event.age_max_male}</p>
          <p>{t("events.women")}: {event.age_min_female}-{event.age_max_female}</p>
        </div>
      );
    }
    return <p>{event.age_min}-{event.age_max}</p>;
  };

  // Inline age range text for hero badges
  const getAgeRangeText = () => {
    if (event.enable_gendered_age) {
      return `${t("events.men")}: ${event.age_min_male}-${event.age_max_male} / ${t("events.women")}: ${event.age_min_female}-${event.age_max_female}`;
    }
    return `${event.age_min}-${event.age_max}`;
  };

  // Calculate availability
  const totalLimit = (event.limit_male && event.limit_female) ? event.limit_male + event.limit_female : null;
  const spotsRemaining = totalLimit ? totalLimit - totalCount : null;
  const bookedPercent = totalLimit ? Math.min(100, Math.round((totalCount / totalLimit) * 100)) : 0;

  // CTA button component (shared between sidebar and mobile bar)
  const CTAButton = ({ className = "" }: { className?: string }) => {
    if (event.is_cancelled) {
      return (
        <Button disabled size="lg" className={`w-full h-12 text-base font-semibold ${className}`}>
          {t("events.cancelled")}
        </Button>
      );
    }
    if (eventFull) {
      return user ? (
        <Button size="lg" variant="secondary" className={`w-full h-12 text-base font-semibold ${className}`} disabled>
          {t("events.join_waitlist")}
        </Button>
      ) : (
        <Button asChild size="lg" variant="secondary" className={`w-full h-12 text-base font-semibold ${className}`}>
          <Link href={`/login?redirect=/events/${id}`}>
            {t("events.join_waitlist")}
          </Link>
        </Button>
      );
    }
    return user ? (
      <Button size="lg" className={`w-full h-12 shadow-md text-base font-semibold hover:shadow-lg hover:scale-[1.01] transition-all ${className}`} disabled>
        {t("events.book_now")} — {t("vip.coming_soon")}
      </Button>
    ) : (
      <Button asChild size="lg" className={`w-full h-12 shadow-md text-base font-semibold hover:shadow-lg hover:scale-[1.01] transition-all ${className}`}>
        <Link href={`/login?redirect=/events/${id}`}>
          {t("events.book_now")}
        </Link>
      </Button>
    );
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: `${t(`events.type.${event.event_type}`)} - ${event.cities?.name}`,
            startDate: `${event.event_date}T${event.start_time}`,
            endDate: event.end_time ? `${event.event_date}T${event.end_time}` : undefined,
            location: event.venues ? {
              "@type": "Place",
              name: event.venues.name,
              address: event.venues.address,
            } : undefined,
            organizer: {
              "@type": "Organization",
              name: "The Speed Dating",
              url: "https://thespeeddating.co.uk",
            },
            description: event.description || undefined,
            eventStatus: event.is_cancelled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
            offers: activeTier.price > 0 ? {
              "@type": "Offer",
              price: activeTier.price,
              priceCurrency: event.countries?.currency || "GBP",
              availability: "https://schema.org/InStock",
            } : undefined,
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-secondary/40 to-accent/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.48_0.16_12_/_0.08),transparent_60%)]" />

        <div className="section-container relative max-w-6xl py-10 sm:py-14">
          {/* Back link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {t("events.back_to_events")}
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge className="bg-primary/[0.08] text-primary border-0 text-sm font-semibold tracking-wide">
              {t(`events.type.${event.event_type}`)}
            </Badge>
            {event.is_cancelled && (
              <Badge variant="destructive">{t("events.cancelled")}</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl mb-2">
            {dateFormatter.format(eventDate)}
          </h1>

          {/* City subtitle */}
          <p className="text-lg text-muted-foreground mb-6 font-medium">
            {event.cities?.name}
          </p>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-sm ring-1 ring-border/40 px-4 py-2 text-sm text-foreground font-medium">
              <Users className="h-4 w-4 text-primary" />
              <span>{t("events.age_range")}: {getAgeRangeText()}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-sm ring-1 ring-border/40 px-4 py-2 text-sm text-foreground font-medium">
              <Clock className="h-4 w-4 text-primary" />
              <span>{timeFormatter.format(eventDate)}{endDate && ` - ${timeFormatter.format(endDate)}`}</span>
            </div>
            {spotsRemaining !== null && !eventFull && (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 shadow-sm ring-1 ring-emerald-200/60 px-4 py-2 text-sm text-emerald-700 font-medium">
                <Ticket className="h-4 w-4" />
                <span>{spotsRemaining} {t("events.spots_remaining")}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Two-column content area */}
      <section className="py-10 sm:py-14 bg-gradient-to-b from-muted/20 to-background">
        <div className="section-container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left content column */}
            <div className="lg:col-span-7 space-y-8">
              {/* About This Event */}
              <Card className="border-0 shadow-sm ring-1 ring-border/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold tracking-tight">{t("events.about_event")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {event.description ? (
                    <p className="text-muted-foreground whitespace-pre-wrap text-[15px] leading-[1.8]">
                      {event.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {t(`events.type.${event.event_type}`)} {t("events.venue").toLowerCase()} {event.cities?.name}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Venue Information */}
              {event.venues && (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20 ring-1 ring-border/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07]">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      {t("events.venue")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{event.venues.name}</h3>
                      <p className="text-muted-foreground">{event.venues.address}</p>
                    </div>

                    {event.venues.description && (
                      <>
                        <div className="border-t border-border/30" />
                        <p className="text-muted-foreground leading-relaxed">
                          {event.venues.description}
                        </p>
                      </>
                    )}

                    {event.venues.transport_info && (
                      <>
                        <div className="border-t border-border/30" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1.5">{t("events.transport")}</h4>
                          <p className="text-sm text-muted-foreground">{event.venues.transport_info}</p>
                        </div>
                      </>
                    )}

                    {event.venues.map_url && (
                      <>
                        <div className="border-t border-border/30" />
                        <a
                          href={event.venues.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {t("events.view_map")}
                        </a>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Dress Code */}
              {(event.dress_code || event.venues?.dress_code) && (
                <Card className="border-0 shadow-sm overflow-hidden bg-muted/20 ring-1 ring-border/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">{t("events.dress_code")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-[15px]">{event.dress_code || event.venues?.dress_code}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right booking sidebar */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-border/40 overflow-hidden p-0 gap-0">
                  {/* Price header */}
                  <div className="p-6 pb-5 bg-gradient-to-b from-primary/[0.04] via-primary/[0.02] to-transparent">
                    {/* Tier badge */}
                    {activeTier.tier !== "standard" && (
                      <Badge
                        className={`mb-2 text-xs font-semibold ${
                          activeTier.tier === "early_bird"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {t(activeTier.labelKey)}
                        {activeTier.savingsPercent > 0 &&
                          ` — ${t("events.save_percent", { percent: activeTier.savingsPercent })}`}
                      </Badge>
                    )}

                    {/* Current price */}
                    {activeTier.isGendered && activeTier.priceMale != null && activeTier.priceFemale != null ? (
                      <div className="space-y-1 mb-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-foreground tracking-tight">
                            {t("events.men")}: {currencyFormatter.format(activeTier.priceMale)}
                          </span>
                          {activeTier.tier !== "standard" && activeTier.standardPriceMale != null && (
                            <span className="text-sm text-muted-foreground line-through">
                              {currencyFormatter.format(activeTier.standardPriceMale)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-foreground tracking-tight">
                            {t("events.women")}: {currencyFormatter.format(activeTier.priceFemale)}
                          </span>
                          {activeTier.tier !== "standard" && activeTier.standardPriceFemale != null && (
                            <span className="text-sm text-muted-foreground line-through">
                              {currencyFormatter.format(activeTier.standardPriceFemale)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-extrabold text-foreground tracking-tight">
                          {activeTier.price > 0
                            ? currencyFormatter.format(activeTier.price)
                            : t("events.free")}
                        </span>
                        {activeTier.price > 0 && (
                          <span className="text-sm text-muted-foreground font-medium">
                            {t("events.per_person")}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Strikethrough original price (flat only) */}
                    {activeTier.tier !== "standard" && !activeTier.isGendered && activeTier.standardPrice > 0 && (
                      <p className="text-sm text-muted-foreground line-through">
                        {t("events.standard_price")}: {currencyFormatter.format(activeTier.standardPrice)}
                      </p>
                    )}

                    {/* Early bird deadline countdown */}
                    {activeTier.tier === "early_bird" && activeTier.tierBoundary && (
                      <p className="text-xs text-emerald-600 mt-2 font-medium">
                        {t("events.early_bird_ends")}{" "}
                        {new Intl.DateTimeFormat(locale, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(activeTier.tierBoundary)}
                      </p>
                    )}

                    {/* Last minute label */}
                    {activeTier.tier === "last_minute" && (
                      <p className="text-xs text-amber-600 mt-2 font-medium">
                        {t("events.last_minute_active")}
                      </p>
                    )}

                    {/* VIP pricing */}
                    {activeTier.isGendered && activeTier.vipPriceMale != null && activeTier.vipPriceFemale != null ? (
                      <div className="text-sm text-amber-600 font-medium mt-1 space-y-0.5">
                        <p>VIP {t("events.men")}: {currencyFormatter.format(activeTier.vipPriceMale)}</p>
                        <p>VIP {t("events.women")}: {currencyFormatter.format(activeTier.vipPriceFemale)}</p>
                      </div>
                    ) : activeTier.vipPrice != null && activeTier.vipPrice > 0 ? (
                      <p className="text-sm text-amber-600 font-medium mt-1">
                        VIP: {currencyFormatter.format(activeTier.vipPrice)}
                      </p>
                    ) : null}
                    {event.special_offer && event.special_offer_value && (
                      <Badge variant="default" className="mt-2">
                        {event.special_offer}
                      </Badge>
                    )}
                  </div>

                  {/* Key details list */}
                  <div className="px-6 py-5 space-y-4 border-t border-border/20">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{dateFormatter.format(eventDate)}</p>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {timeFormatter.format(eventDate)}
                        {endDate && ` - ${timeFormatter.format(endDate)}`}
                      </p>
                    </div>
                    {event.venues && (
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06] mt-0.5">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-foreground">{event.venues.name}</p>
                          <p className="text-muted-foreground mt-0.5">{event.venues.address}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {getAgeRange()}
                      </div>
                    </div>
                  </div>

                  {/* Availability section */}
                  <div className="px-6 py-5 space-y-3 border-t border-border/20 bg-muted/15">
                    {totalLimit ? (
                      <>
                        {!eventFull ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-semibold">
                            {t("events.tickets_available")}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="font-semibold">{t("events.sold_out")}</Badge>
                        )}

                        {/* Progress bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground font-medium">
                            <span>{bookedPercent}% {t("events.booked")}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-border/40 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                              style={{ width: `${bookedPercent}%` }}
                            />
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-primary/40" />
                              {(event.limit_male ?? 0) - maleCount} {t("events.male_spots")}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-primary/60" />
                              {(event.limit_female ?? 0) - femaleCount} {t("events.female_spots")}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("events.unlimited")}</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="p-6">
                    <CTAButton />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl p-4 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <div className="section-container flex items-center justify-between gap-4">
          <div>
            {activeTier.isGendered && activeTier.priceMale != null && activeTier.priceFemale != null ? (
              <div className="text-sm font-bold tracking-tight leading-tight">
                <span>{t("events.men")}: {currencyFormatter.format(activeTier.priceMale)}</span>
                <span className="text-muted-foreground/40 mx-1">/</span>
                <span>{t("events.women")}: {currencyFormatter.format(activeTier.priceFemale)}</span>
              </div>
            ) : (
              <>
                <span className="text-xl font-bold tracking-tight">
                  {activeTier.price > 0
                    ? currencyFormatter.format(activeTier.price)
                    : t("events.free")}
                </span>
                {activeTier.tier !== "standard" && activeTier.standardPrice > 0 && (
                  <span className="text-xs text-muted-foreground line-through ms-1.5">
                    {currencyFormatter.format(activeTier.standardPrice)}
                  </span>
                )}
                {activeTier.price > 0 && activeTier.tier === "standard" && (
                  <span className="text-xs text-muted-foreground ms-1.5 font-medium">
                    {t("events.per_person")}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex-1 max-w-[220px]">
            <CTAButton />
          </div>
        </div>
      </div>

      {/* Bottom spacer for mobile sticky CTA */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
