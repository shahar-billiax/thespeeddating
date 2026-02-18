import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { EventCountdown } from "./event-countdown";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

interface UpcomingEvent {
  eventId: number;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  city: string;
  venue: string;
  status: string;
}

interface UpcomingEventsWidgetProps {
  events: UpcomingEvent[];
}

function formatEventType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function UpcomingEventsWidget({
  events,
}: UpcomingEventsWidgetProps) {
  const t = await getTranslations();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Calendar className="h-4 w-4 text-primary" />
            {t("dashboard.upcoming_events")}
          </CardTitle>
          {events.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="group gap-1 text-xs"
              asChild
            >
              <Link href="/dashboard/events">
                {t("admin.view_all")}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("dashboard.no_upcoming")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {t("dashboard.find_your_next_event")}
              </p>
            </div>
            <Button size="sm" className="mt-1" asChild>
              <Link href="/events">{t("dashboard.browse_events")}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const eventDate = new Date(event.date);
              const monthShort = eventDate.toLocaleDateString("en", {
                month: "short",
              });
              const dayNum = eventDate.getDate();

              return (
                <Link
                  key={event.eventId}
                  href={`/events/${event.eventId}`}
                  className={cn(
                    "group flex items-start gap-4 rounded-xl border p-3.5",
                    "transition-all duration-200 hover:shadow-sm hover:border-primary/20 hover:bg-primary/[0.02]"
                  )}
                >
                  {/* Calendar-style date badge */}
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <span className="text-[10px] font-semibold uppercase leading-none text-primary/70">
                      {monthShort}
                    </span>
                    <span className="mt-0.5 text-xl font-bold leading-none text-primary">
                      {dayNum}
                    </span>
                  </div>

                  {/* Event details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {formatEventType(event.type)}
                      </p>
                      <Badge
                        variant="secondary"
                        className="shrink-0 px-1.5 py-0 text-[10px]"
                      >
                        {event.status}
                      </Badge>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {event.venue || event.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        {event.startTime?.slice(0, 5)}
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <EventCountdown eventDate={event.date} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
