import { Suspense } from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { EventFilters } from "@/components/events/event-filters";
import { EventCard } from "@/components/events/event-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
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

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);
  return pages;
}

async function EventsList({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const t = await getTranslations();
  const locale = await getLocale();
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
      cover_image,
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
        name,
        cover_image
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
    return (
      <div className="text-center py-20">
        <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/[0.06] to-accent/50 flex items-center justify-center">
          <Calendar className="h-10 w-10 text-primary/40" />
        </div>
        <p className="text-lg font-medium text-muted-foreground max-w-md mx-auto leading-relaxed">
          {t("events.no_events")}
        </p>
      </div>
    );
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

  // Build image URL helper
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const getImageUrl = (event: typeof events[number]) => {
    const path = event.cover_image || event.venues?.cover_image;
    return path ? `${supabaseUrl}/storage/v1/object/public/media/${path}` : null;
  };

  // Format events for cards
  const formattedEvents = events.map((event) => ({
    id: event.id,
    event_date: event.event_date,
    start_time: event.start_time,
    event_type: event.event_type,
    image_url: getImageUrl(event),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {formattedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            locale={locale}
            translations={{
              type: t(`events.type.${event.event_type}`),
              age_range: t("events.age_range"),
              price_from: t("events.price_from"),
              free: t("events.free"),
              spots_remaining: t("events.spots_remaining"),
              men: t("events.men"),
              women: t("events.women"),
              view_event: t("events.view_event"),
            }}
          />
        ))}
      </div>

      {count && count > EVENTS_PER_PAGE && (
        <Pagination className="mt-14 pt-8 border-t border-border/30">
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={buildPageUrl(page - 1)} />
              </PaginationItem>
            )}
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink href={buildPageUrl(p)} isActive={p === page}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={buildPageUrl(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}

export default async function EventsPage({ searchParams }: PageProps) {
  const t = await getTranslations();
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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.04] via-secondary/50 to-background py-14 sm:py-18 border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.48_0.16_12_/_0.06),transparent_70%)]" />

        <div className="section-container relative">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("events.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t("events.hero_subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-40 border-b border-border/40 bg-background/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="section-container py-4">
          <EventFilters cities={cities || []} />
        </div>
      </div>

      {/* Events listing */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-muted/30 via-background to-background">
        <div className="section-container">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden ring-1 ring-border/30 bg-card">
                  <Skeleton className="aspect-[16/10] w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          }>
            <EventsList searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
