import Link from "next/link";
import { getMyEvents } from "@/lib/matches/actions";
import { getTranslations } from "@/lib/i18n/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, CheckCircle } from "lucide-react";

export default async function MatchesPage() {
  const { t } = await getTranslations();
  const events = await getMyEvents();

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">{t("matches.title")}</h1>

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("matches.no_events_text")}
            </p>
            <Button asChild className="mt-4">
              <Link href="/events">{t("matches.browse_events")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.eventId}>
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
  );
}
