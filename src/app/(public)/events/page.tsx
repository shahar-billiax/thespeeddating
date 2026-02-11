import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { EventFilters } from "@/components/events/event-filters";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("meta.events_title"),
    description: t("meta.events_description"),
  };
}

interface PageProps {
  searchParams: Promise<{
    city?: string;
    type?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

const EVENTS_PER_PAGE = 12;

async function EventsList({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const { t, locale } = await getTranslations();
  const headerStore = await headers();
  const country = headerStore.get("x-country") || "gb";
  const supabase = await createClient();

  // Get country ID
  const { data: countryData } = await supabase
    .from("countries")
    .select("id, currency")
    .eq("code", country)
    .single();

  if (!countryData) {
    return <div className="text-center py-12">{t("events.no_events")}</div>;
  }

  // Build query
  let query = supabase
    .from("events")
    .select(`
      id,
      event_date,
      start_time,
      end_time,
      event_type,
      age_min,
      age_max,
      age_min_male,
      age_max_male,
      age_min_female,
      age_max_female,
      enable_gendered_age,
      price,
      price_male,
      price_female,
      enable_gendered_price,
      limit_male,
      limit_female,
      cities:city_id (
        id,
        name
      ),
      venues:venue_id (
        id,
        name
      )
    `, { count: 'exact' })
    .eq("country_id", countryData.id)
    .eq("is_published", true)
    .eq("is_cancelled", false)
    .gte("event_date", new Date().toISOString().split('T')[0]);

  // Apply filters
  if (searchParams.city) {
    query = query.eq("city_id", Number(searchParams.city));
  }

  if (searchParams.type) {
    query = query.eq("event_type", searchParams.type);
  }

  if (searchParams.from) {
    query = query.gte("event_date", searchParams.from);
  }

  if (searchParams.to) {
    query = query.lte("event_date", searchParams.to);
  }

  // Pagination
  const page = parseInt(searchParams.page || "1");
  const from = (page - 1) * EVENTS_PER_PAGE;
  const to = from + EVENTS_PER_PAGE - 1;

  query = query
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true })
    .range(from, to);

  const { data: events, count } = await query;

  if (!events || events.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">{t("events.no_events")}</div>;
  }

  // Get registration counts for each event
  const eventIds = events.map((e) => e.id);
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("event_id, user_id, users:user_id(gender)")
    .in("event_id", eventIds)
    .eq("status", "confirmed");

  // Count registrations by event and gender
  const registrationCounts = registrations?.reduce((acc, reg) => {
    if (!acc[reg.event_id]) {
      acc[reg.event_id] = { total: 0, male: 0, female: 0 };
    }
    acc[reg.event_id].total++;
    if (reg.users?.gender === "male") {
      acc[reg.event_id].male++;
    } else if (reg.users?.gender === "female") {
      acc[reg.event_id].female++;
    }
    return acc;
  }, {} as Record<string, { total: number; male: number; female: number }>) || {};

  // Format events for cards
  const formattedEvents = events.map((event) => ({
    id: event.id,
    event_date: event.event_date,
    start_time: event.start_time,
    event_type: event.event_type,
    city_name: event.cities?.name || "",
    venue_name: event.venues?.name || "",
    age_min: event.age_min,
    age_max: event.age_max,
    age_min_male: event.age_min_male,
    age_max_male: event.age_max_male,
    age_min_female: event.age_min_female,
    age_max_female: event.age_max_female,
    enable_gendered_age: event.enable_gendered_age,
    price: event.price,
    price_male: event.price_male,
    price_female: event.price_female,
    enable_gendered_price: event.enable_gendered_price,
    currency: countryData.currency,
    limit_male: event.limit_male,
    limit_female: event.limit_female,
    registrations_count: registrationCounts[event.id]?.total || 0,
    male_registrations: registrationCounts[event.id]?.male || 0,
    female_registrations: registrationCounts[event.id]?.female || 0,
  }));

  const translations = {
    type: t(`events.type.${formattedEvents[0].event_type}`),
    age_range: t("events.age_range"),
    price_from: t("events.price_from"),
    free: t("events.free"),
    spots_remaining: t("events.spots_remaining"),
    men: t("events.men"),
    women: t("events.women"),
  };

  const totalPages = count ? Math.ceil(count / EVENTS_PER_PAGE) : 1;

  function buildPageUrl(targetPage: number): string {
    const params = new URLSearchParams(
      searchParams as Record<string, string>
    );
    params.set("page", String(targetPage));
    return `/events?${params.toString()}`;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formattedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            locale={locale}
            translations={{
              ...translations,
              type: t(`events.type.${event.event_type}`),
            }}
          />
        ))}
      </div>

      {count && count > EVENTS_PER_PAGE && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPageUrl(page - 1)}>
                {t("common.previous")}
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground px-4">
            {t("common.page")} {page} {t("common.of")} {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPageUrl(page + 1)}>
                {t("common.next")}
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default async function EventsPage({ searchParams }: PageProps) {
  const { t } = await getTranslations();
  const headerStore = await headers();
  const country = headerStore.get("x-country") || "gb";
  const supabase = await createClient();

  // Get country ID
  const { data: countryData } = await supabase
    .from("countries")
    .select("id")
    .eq("code", country)
    .single();

  if (!countryData) {
    return <div>{t("events.country_not_found")}</div>;
  }

  // Get cities for filter
  const { data: cities } = await supabase
    .from("cities")
    .select("id, name")
    .eq("country_id", countryData.id)
    .eq("is_active", true)
    .order("name");

  const resolvedSearchParams = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t("events.title")}</h1>

      <EventFilters cities={cities || []} />

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      }>
        <EventsList searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
