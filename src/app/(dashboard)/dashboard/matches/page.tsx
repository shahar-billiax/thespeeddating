import Link from "next/link";
import { getMyEvents, getSubmissionProgress } from "@/lib/matches/actions";
import { getTranslations, getLocale } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowRight,
} from "lucide-react";

export default async function DashboardMatchesPage() {
  const t = await getTranslations();
  const events = await getMyEvents();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
          <Heart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("matches.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.matches_desc")}
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50">
              <Heart className="h-8 w-8 text-pink-400" />
            </div>
            <p className="text-lg font-medium">No matches yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("matches.no_events_text")}
            </p>
            <Button asChild className="mt-5 gap-2 shadow-sm">
              <Link href="/events">
                {t("matches.browse_events")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventMatchCard key={event.eventId} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

async function EventMatchCard({ event }: { event: any }) {
  const t = await getTranslations();
  const locale = await getLocale();
  let progress = null;
  if (event.status === "score" && event.hasDraft) {
    progress = await getSubmissionProgress(event.eventId);
  }

  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleDateString(
    locale === "he" ? "he-IL" : "en-GB",
    { month: "short" }
  );
  const day = eventDate.getDate();

  const statusConfig = getMatchStatusConfig(event.status);

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Date badge */}
          <div className="flex w-[72px] shrink-0 flex-col items-center justify-center py-4">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {month}
            </span>
            <span className="text-2xl font-bold leading-tight text-foreground">{day}</span>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-2.5 border-s border-border/50 p-4">
            {/* Top row: title + action */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-base leading-snug">
                    {event.type
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${statusConfig.badgeClassName}`}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {eventDate.toLocaleDateString(
                      locale === "he" ? "he-IL" : "en-GB",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }
                    )}
                    {event.time &&
                      ` ${t("matches.at_time", { time: event.time.slice(0, 5) })}`}
                  </span>
                  {event.city && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.city}
                      {event.venue && ` \u00b7 ${event.venue}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Action button */}
              <div className="shrink-0">
                {event.status === "score" && (
                  <Button asChild size="sm" className="gap-1.5 shadow-sm">
                    <Link href={`/dashboard/matches/${event.eventId}/score`}>
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {event.hasDraft
                          ? t("matches.continue_scoring")
                          : t("matches.submit_choices")}
                      </span>
                    </Link>
                  </Button>
                )}
                {event.status === "waiting" && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                  >
                    <Link href={`/dashboard/matches/${event.eventId}/review`}>
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {t("matches.review_choices")}
                      </span>
                    </Link>
                  </Button>
                )}
                {event.status === "results" && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                  >
                    <Link href={`/dashboard/matches/${event.eventId}/results`}>
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {t("matches.view_matches")}
                      </span>
                    </Link>
                  </Button>
                )}
                {event.status === "expired" && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {t("matches.deadline_passed")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {progress && progress.total > 0 && (
              <div className="space-y-1.5 rounded-lg bg-muted/40 p-3">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{t("matches.progress")}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {progress.completed} {t("matches.of")} {progress.total}
                  </span>
                </div>
                <Progress
                  value={(progress.completed / progress.total) * 100}
                  className="h-2"
                />
              </div>
            )}

            {/* Deadline warning */}
            {event.status === "score" && event.deadline && (
              <DeadlineInfo deadline={event.deadline} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function DeadlineInfo({ deadline }: { deadline: string }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const deadlineDate = new Date(deadline);
  const hoursLeft = (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursLeft <= 0) return null;

  const isSoon = hoursLeft < 48;

  if (isSoon) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>
          {t("matches.deadline")}:{" "}
          {deadlineDate.toLocaleDateString(
            locale === "he" ? "he-IL" : "en-GB",
            {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </span>
      </div>
    );
  }

  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      {t("matches.deadline")}:{" "}
      {deadlineDate.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </p>
  );
}

function getMatchStatusConfig(status: string): {
  label: string;
  badgeClassName: string;
} {
  switch (status) {
    case "score":
      return {
        label: "Action needed",
        badgeClassName: "border-amber-200 text-amber-700 bg-amber-50",
      };
    case "waiting":
      return {
        label: "Submitted",
        badgeClassName: "border-blue-200 text-blue-600 bg-blue-50",
      };
    case "results":
      return {
        label: "Results ready",
        badgeClassName: "border-green-200 text-green-600 bg-green-50",
      };
    case "expired":
      return {
        label: "Expired",
        badgeClassName: "border-amber-200 text-amber-600 bg-amber-50",
      };
    default:
      return {
        label: status,
        badgeClassName: "",
      };
  }
}
