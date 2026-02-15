import Link from "next/link";
import { getMyEvents, getSubmissionProgress } from "@/lib/matches/actions";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  AlertTriangle,
  Eye,
} from "lucide-react";

export default async function MatchesPage() {
  const t = await getTranslations();
  const events = await getMyEvents();

  return (
    <div className="section-container max-w-3xl py-10 sm:py-16 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        {t("matches.title")}
      </h1>

      <div>
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
                <EventCard key={event.eventId} event={event} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

async function EventCard({ event }: { event: any }) {
  const t = await getTranslations();
  let progress = null;
  if (event.status === "score" && event.hasDraft) {
    progress = await getSubmissionProgress(event.eventId);
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base">
              {event.type?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
                {event.time && ` at ${event.time.slice(0, 5)}`}
              </span>
              {event.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.city}
                  {event.venue && ` · ${event.venue}`}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0">
            {event.status === "score" && (
              <Button asChild size="sm">
                <Link href={`/matches/${event.eventId}/score`}>
                  <Heart className="h-4 w-4 me-2" />
                  {event.hasDraft
                    ? t("matches.continue_scoring")
                    : t("matches.submit_choices")}
                </Link>
              </Button>
            )}
            {event.status === "waiting" && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/matches/${event.eventId}/review`}>
                  <Eye className="h-4 w-4 me-2" />
                  {t("matches.review_choices")}
                </Link>
              </Button>
            )}
            {event.status === "results" && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/matches/${event.eventId}/results`}>
                  <CheckCircle className="h-4 w-4 me-2" />
                  {t("matches.view_matches")}
                </Link>
              </Button>
            )}
            {event.status === "expired" && (
              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
                <AlertTriangle className="h-3 w-3" />
                {t("matches.deadline_passed")}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress bar for in-progress submissions */}
        {progress && progress.total > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("matches.progress")}</span>
              <span>
                {progress.completed} {t("matches.of")} {progress.total}
              </span>
            </div>
            <Progress
              value={(progress.completed / progress.total) * 100}
              className="h-1.5"
            />
          </div>
        )}

        {/* Deadline warning */}
        {event.status === "score" && event.deadline && (
          <DeadlineInfo deadline={event.deadline} />
        )}
      </CardContent>
    </Card>
  );
}

async function DeadlineInfo({ deadline }: { deadline: string }) {
  const t = await getTranslations();
  const deadlineDate = new Date(deadline);
  const hoursLeft = (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursLeft <= 0) return null;

  const isSoon = hoursLeft < 48;

  return (
    <p
      className={`text-xs mt-2 inline-flex items-center gap-1 ${
        isSoon ? "text-amber-600 font-medium" : "text-muted-foreground"
      }`}
    >
      <Clock className="h-3 w-3" />
      {t("matches.deadline")}:{" "}
      {deadlineDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </p>
  );
}
