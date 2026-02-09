import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Users, Ticket, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslations();

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
  const { t, locale } = await getTranslations();
  const headerStore = await headers();
  const country = headerStore.get("x-country") || "gb";
  const supabase = await createClient();

  // Get event details
  const { data: event } = await supabase
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
    .eq("id", Number(id))
    .single();

  if (!event || !event.is_published) {
    notFound();
  }

  // Get registration counts
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("user_id, users:user_id(gender)")
    .eq("event_id", Number(id))
    .eq("status", "confirmed");

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

  // Format age range
  const getAgeRange = () => {
    if (event.enable_gendered_age) {
      return (
        <div className="space-y-1">
          <p>{t("events.men")}: {event.age_min_male}-{event.age_max_male}</p>
          <p>{t("events.women")}: {event.age_min_female}-{event.age_max_female}</p>
        </div>
      );
    }
    return <p>{event.age_min}-{event.age_max}</p>;
  };

  // Format price
  const getPriceDisplay = () => {
    if (event.enable_gendered_price && event.price_male && event.price_female) {
      return (
        <div className="space-y-1">
          <p>{t("events.men")}: {currencyFormatter.format(event.price_male)}</p>
          <p>{t("events.women")}: {currencyFormatter.format(event.price_female)}</p>
        </div>
      );
    }
    return <p>{event.price ? currencyFormatter.format(event.price) : t("events.free")}</p>;
  };

  // Format spots remaining
  const getSpotsRemaining = () => {
    if (event.limit_male && event.limit_female) {
      const maleRemaining = event.limit_male - maleCount;
      const femaleRemaining = event.limit_female - femaleCount;
      return (
        <div className="space-y-1">
          <p>{t("events.men")}: {maleRemaining} / {event.limit_male}</p>
          <p>{t("events.women")}: {femaleRemaining} / {event.limit_female}</p>
        </div>
      );
    }
    return <p>{t("events.unlimited")}</p>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            offers: event.price ? {
              "@type": "Offer",
              price: event.price,
              priceCurrency: event.countries?.currency || "GBP",
              availability: "https://schema.org/InStock",
            } : undefined,
          }),
        }}
      />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="text-base">
            {t(`events.type.${event.event_type}`)}
          </Badge>
          {event.is_cancelled && (
            <Badge variant="destructive">{t("events.cancelled")}</Badge>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-2">
          {dateFormatter.format(eventDate)}
        </h1>
        <p className="text-xl text-muted-foreground">
          {event.cities?.name}
        </p>
      </div>

      {/* Event Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("events.date_time")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{dateFormatter.format(eventDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {timeFormatter.format(eventDate)}
                {event.end_time && ` - ${timeFormatter.format(new Date(event.event_date + 'T' + event.end_time))}`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("events.age_range")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getAgeRange()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {t("events.pricing")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("events.standard_price")}</p>
              {getPriceDisplay()}
            </div>
            {event.vip_price && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("events.vip_price")}</p>
                <p>{currencyFormatter.format(event.vip_price)}</p>
              </div>
            )}
            {event.special_offer && event.special_offer_value && (
              <Badge variant="default">{event.special_offer}</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("events.spots_remaining")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getSpotsRemaining()}
          </CardContent>
        </Card>
      </div>

      {/* Venue Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t("events.venue")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{event.venues?.name}</h3>
            <p className="text-muted-foreground">{event.venues?.address}</p>
          </div>

          {event.venues?.description && (
            <>
              <Separator />
              <p>{event.venues.description}</p>
            </>
          )}

          {event.venues?.transport_info && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">{t("events.transport")}</h4>
                <p className="text-sm text-muted-foreground">{event.venues.transport_info}</p>
              </div>
            </>
          )}

          {event.venues?.map_url && (
            <>
              <Separator />
              <a
                href={event.venues.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                {t("events.view_map")}
                <ExternalLink className="h-4 w-4" />
              </a>
            </>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {event.description && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("events.about_event")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{event.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Dress Code */}
      {(event.dress_code || event.venues?.dress_code) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("events.dress_code")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{event.dress_code || event.venues?.dress_code}</p>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <div className="flex justify-center">
        {event.is_cancelled ? (
          <Button disabled size="lg">
            {t("events.cancelled")}
          </Button>
        ) : eventFull ? (
          <Button asChild size="lg" variant="secondary">
            <Link href={`/login?redirect=/events/${id}`}>
              {t("events.join_waitlist")}
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href={`/login?redirect=/events/${id}`}>
              {t("events.book_now")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
