import Link from "next/link";
import { getMyEvents } from "@/lib/matches/actions";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, CheckCircle } from "lucide-react";

export default async function MatchesPage() {
  const t = await getTranslations();
  const events = await getMyEvents();

  return (
    <div>
      <section className="page-hero">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("matches.title")}</h1>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="section-container max-w-2xl">

      {events.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <p className="text-muted-foreground mb-6">
              {t("matches.no_events_text")}
            </p>
            <Button asChild className="h-11 shadow-sm">
              <Link href="/events">{t("matches.browse_events")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.eventId} className="border-0 shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {event.date} {event.time && `at ${event.time}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.city} - {event.venue} -{" "}
                      {event.type?.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    {event.status === "score" && (
                      <Button asChild size="sm">
                        <Link href={`/matches/${event.eventId}/score`}>
                          <Heart className="h-4 w-4 me-2" />
                          {t("matches.submit_choices")}
                        </Link>
                      </Button>
                    )}
                    {event.status === "waiting" && (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {t("matches.waiting")}
                      </Badge>
                    )}
                    {event.status === "results" && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/matches/${event.eventId}/results`}>
                          <CheckCircle className="h-4 w-4 me-2" />
                          {t("matches.view_matches")}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </div>
      </section>
    </div>
  );
}
