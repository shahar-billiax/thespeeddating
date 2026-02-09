import Link from "next/link";
import { getMyEvents } from "@/lib/matches/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, CheckCircle } from "lucide-react";

export default async function MatchesPage() {
  const events = await getMyEvents();

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Matches</h1>

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No past events yet. Attend an event to start matching!
            </p>
            <Button asChild className="mt-4">
              <Link href="/events">Browse Events</Link>
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
                          <Heart className="h-4 w-4 mr-2" />
                          Submit Choices
                        </Link>
                      </Button>
                    )}
                    {event.status === "waiting" && (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Waiting for results
                      </Badge>
                    )}
                    {event.status === "results" && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/matches/${event.eventId}/results`}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          View Matches
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
