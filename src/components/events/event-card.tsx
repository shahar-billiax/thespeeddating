import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, ArrowRight } from "lucide-react";
import type { PricingTierInfo } from "@/lib/pricing";

interface EventCardProps {
  event: {
    id: number | string;
    event_date: string;
    start_time: string | null;
    event_type: string | null;
    image_url?: string | null;
    city_name: string;
    venue_name: string;
    age_min: number | null;
    age_max: number | null;
    age_min_male?: number | null;
    age_max_male?: number | null;
    age_min_female?: number | null;
    age_max_female?: number | null;
    enable_gendered_age: boolean;
    price: number | null;
    price_male?: number | null;
    price_female?: number | null;
    enable_gendered_price: boolean;
    currency: string | null;
    limit_male?: number | null;
    limit_female?: number | null;
    registrations_count: number;
    male_registrations: number;
    female_registrations: number;
    activeTier?: PricingTierInfo;
  };
  locale: string;
  translations: {
    type: string;
    age_range: string;
    price_from: string;
    free: string;
    spots_remaining: string;
    men: string;
    women: string;
    view_event?: string;
    early_bird?: string;
    last_minute?: string;
  };
}

export function EventCard({ event, locale, translations }: EventCardProps) {
  // Format date
  const eventDate = new Date(event.event_date + 'T' + event.start_time);
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dayFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric' });
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });
  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

  // Format currency
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: event.currency ?? "GBP",
  });

  // Calculate spots remaining
  const getTotalLimit = () => {
    if (event.limit_male && event.limit_female) {
      return event.limit_male + event.limit_female;
    }
    return null;
  };

  const totalLimit = getTotalLimit();
  const spotsRemaining = totalLimit ? totalLimit - event.registrations_count : null;

  // Format age range
  const getAgeRange = () => {
    if (event.enable_gendered_age) {
      return `${translations.men}: ${event.age_min_male}-${event.age_max_male} / ${translations.women}: ${event.age_min_female}-${event.age_max_female}`;
    }
    return `${event.age_min}-${event.age_max}`;
  };

  // Format price
  const getPrice = () => {
    if (event.enable_gendered_price && event.price_male && event.price_female) {
      return `${translations.men}: ${currencyFormatter.format(event.price_male)} / ${translations.women}: ${currencyFormatter.format(event.price_female)}`;
    }
    if (!event.price) return translations.free;
    return currencyFormatter.format(event.price);
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group flex h-full flex-col border-0 p-0 gap-0 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-border/50 hover:ring-primary/20 transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1">
        {/* Image area */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/40">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={`${event.venue_name} - ${event.city_name}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-muted/60 to-accent/30 flex items-center justify-center">
              <MapPin className="h-10 w-10 text-primary/20" />
            </div>
          )}
          {/* Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Badges overlaid on image */}
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-wrap items-center gap-1.5">
            <Badge className="text-xs font-semibold tracking-wide bg-white/90 text-primary border-0 backdrop-blur-sm shadow-sm">
              {translations.type}
            </Badge>
            {spotsRemaining !== null && spotsRemaining <= 10 && (
              <Badge variant="destructive" className="text-xs shadow-sm">
                {spotsRemaining} {translations.spots_remaining}
              </Badge>
            )}
          </div>

          {/* Date pill overlaid on image bottom */}
          <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 backdrop-blur-sm shadow-sm px-3 py-1.5 text-sm font-bold text-foreground">
              <span className="uppercase">{weekdayFormatter.format(eventDate)}</span>
              <span className="text-muted-foreground/40">,</span>
              <span>{dayFormatter.format(eventDate)} {monthFormatter.format(eventDate)}</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 flex-col p-4 pt-3.5 gap-3">
          {/* Venue & location */}
          <div>
            <h3 className="font-semibold text-foreground text-[15px] leading-snug line-clamp-1">
              {event.venue_name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {event.city_name}
            </p>
          </div>

          {/* Details row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0 text-primary/60" />
              <span className="tabular-nums">{timeFormatter.format(eventDate)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0 text-primary/60" />
              <span>{getAgeRange()}</span>
            </span>
          </div>

          {/* Price & CTA */}
          <div className="mt-auto pt-3 border-t border-border/30 flex items-center justify-between gap-2">
            <div className="min-w-0">
              {event.activeTier && event.activeTier.tier !== "standard" ? (
                event.activeTier.isGendered && event.activeTier.priceMale != null && event.activeTier.priceFemale != null ? (
                  <div className="text-sm font-bold text-foreground tracking-tight space-y-0.5">
                    <p>{translations.men}: {currencyFormatter.format(event.activeTier.priceMale)}{" "}
                      {event.activeTier.standardPriceMale != null && (
                        <span className="text-xs font-normal text-muted-foreground line-through">{currencyFormatter.format(event.activeTier.standardPriceMale)}</span>
                      )}
                    </p>
                    <p>{translations.women}: {currencyFormatter.format(event.activeTier.priceFemale)}{" "}
                      {event.activeTier.standardPriceFemale != null && (
                        <span className="text-xs font-normal text-muted-foreground line-through">{currencyFormatter.format(event.activeTier.standardPriceFemale)}</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-foreground tracking-tight">
                      {currencyFormatter.format(event.activeTier.price)}
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      {currencyFormatter.format(event.activeTier.standardPrice)}
                    </p>
                  </div>
                )
              ) : (
                <p className="text-base font-bold text-foreground tracking-tight">
                  {getPrice()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {event.activeTier?.tier === "early_bird" && (
                <Badge className="text-[10px] px-1.5 py-0 h-5 bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                  {translations.early_bird || "Early Bird"}
                </Badge>
              )}
              {event.activeTier?.tier === "last_minute" && (
                <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-50 text-amber-700 border-amber-200 font-semibold">
                  {translations.last_minute || "Last Minute"}
                </Badge>
              )}
              <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">
                {translations.view_event || "View Event"}
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
