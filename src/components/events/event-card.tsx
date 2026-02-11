import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

interface EventCardProps {
  event: {
    id: number | string;
    event_date: string;
    start_time: string | null;
    event_type: string | null;
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
  };
}

export function EventCard({ event, locale, translations }: EventCardProps) {
  // Format date
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
    return `${translations.price_from} ${currencyFormatter.format(event.price)}`;
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary">{translations.type}</Badge>
            {spotsRemaining !== null && (
              <Badge variant={spotsRemaining > 10 ? "default" : "destructive"}>
                {spotsRemaining} {translations.spots_remaining}
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl">
            {dateFormatter.format(eventDate)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{timeFormatter.format(eventDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.city_name} - {event.venue_name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{getAgeRange()}</span>
          </div>

          <div className="pt-2 border-t">
            <p className="font-semibold text-lg">{getPrice()}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
