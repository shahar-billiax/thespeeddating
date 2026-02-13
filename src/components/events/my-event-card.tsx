import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface MyEventCardProps {
  event: {
    id: string;
    event_date: string;
    start_time: string;
    venue_name: string;
    city_name: string;
    status: string;
    payment_status: string;
    match_submission_open: boolean;
    match_results_released: boolean;
    has_submitted_matches?: boolean;
  };
  isPast: boolean;
}

export function MyEventCard({ event, isPast }: MyEventCardProps) {
  const t = useTranslations();

  const statusColor =
    event.status === "confirmed"
      ? "bg-green-500"
      : event.status === "waitlisted"
      ? "bg-yellow-500"
      : "bg-gray-500";

  const paymentColor =
    event.payment_status === "paid"
      ? "bg-green-500"
      : event.payment_status === "pending"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">
            {format(new Date(event.event_date), "MMMM d, yyyy")}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={statusColor}>
              {t(`my_events.${event.status}`)}
            </Badge>
            <Badge className={paymentColor}>{event.payment_status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {event.start_time} • {event.venue_name}
          </p>
          <p className="text-sm text-muted-foreground">{event.city_name}</p>
        </div>

        {isPast && (
          <div className="flex gap-2">
            {event.match_submission_open && !event.has_submitted_matches && (
              <Button asChild size="sm">
                <Link href={`/matches/${event.id}/score`}>
                  {t("my_events.submit_choices")}
                </Link>
              </Button>
            )}
            {event.match_results_released && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/matches/${event.id}/results`}>
                  {t("my_events.view_results")}
                </Link>
              </Button>
            )}
            {!event.match_submission_open && !event.match_results_released && (
              <p className="text-sm text-muted-foreground">
                {t("my_events.results_pending")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
