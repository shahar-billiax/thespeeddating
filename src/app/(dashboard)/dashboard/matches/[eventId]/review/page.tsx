import { getSubmittedChoices } from "@/lib/matches/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Users,
  X,
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";

export default async function DashboardReviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const t = await getTranslations();
  const locale = await getLocale();
  const data = await getSubmittedChoices(Number(eventId));

  if ("error" in data) {
    return (
      <div className="max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-muted-foreground mb-4">{data.error}</p>
            <Link
              href="/dashboard/matches"
              className="text-primary hover:underline text-sm"
            >
              {t("matches.back_to_matches")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dateChoices = data.choices!.filter((c) => c.choice === "date");
  const friendChoices = data.choices!.filter((c) => c.choice === "friend");
  const noChoices = data.choices!.filter((c) => c.choice === "no");

  const formattedDate = data.event
    ? new Date(data.event.date).toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/matches"
          className="text-sm text-muted-foreground hover:text-primary mb-3 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("matches.back_to_matches")}
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          {t("matches.review_choices")}
        </h1>
        {data.event && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {formattedDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
            )}
            {data.event.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {data.event.city}
                {data.event.venue && ` \u00b7 ${data.event.venue}`}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {t("matches.review_submitted_note")}
      </p>

      {/* Date choices */}
      {dateChoices.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Heart className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-lg font-semibold">
              {t("matches.date_matches")}
            </h2>
            <Badge className="bg-pink-100 text-pink-700 border-pink-200 ms-auto text-xs">
              {dateChoices.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {dateChoices.map((choice) => (
              <ChoiceCard key={choice.id} choice={choice} />
            ))}
          </div>
        </div>
      )}

      {/* Friend choices */}
      {friendChoices.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-lg font-semibold">
              {t("matches.friend_matches")}
            </h2>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 ms-auto text-xs">
              {friendChoices.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {friendChoices.map((choice) => (
              <ChoiceCard key={choice.id} choice={choice} />
            ))}
          </div>
        </div>
      )}

      {/* No choices */}
      {noChoices.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-muted-foreground">
              {t("matches.no_connection")}
            </h2>
            <Badge variant="outline" className="ms-auto text-xs">
              {noChoices.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {noChoices.map((choice) => (
              <ChoiceCard key={choice.id} choice={choice} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChoiceCard({
  choice,
}: {
  choice: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    age?: number | null;
    city?: string | null;
    choice: "date" | "friend" | "no";
  };
}) {
  const initials =
    `${choice.firstName[0] ?? ""}${choice.lastName?.[0] ?? ""}`.toUpperCase();

  let borderClass = "";
  if (choice.choice === "date") {
    borderClass = "border-s-4 border-s-pink-400";
  } else if (choice.choice === "friend") {
    borderClass = "border-s-4 border-s-blue-400";
  }

  return (
    <Card className={`border-0 shadow-sm overflow-hidden ${borderClass}`}>
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage
              src={choice.avatarUrl ?? undefined}
              className="object-cover"
            />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              {choice.firstName} {choice.lastName}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {choice.age && <span>{choice.age}</span>}
              {choice.age && choice.city && <span>&middot;</span>}
              {choice.city && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {choice.city}
                </span>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              choice.choice === "date"
                ? "border-pink-300 text-pink-700 bg-pink-50"
                : choice.choice === "friend"
                  ? "border-blue-300 text-blue-700 bg-blue-50"
                  : "text-muted-foreground"
            }
          >
            {choice.choice === "date" && <Heart className="h-3 w-3 me-1" />}
            {choice.choice === "friend" && <Users className="h-3 w-3 me-1" />}
            {choice.choice === "no" && <X className="h-3 w-3 me-1" />}
            {choice.choice === "date"
              ? "Date"
              : choice.choice === "friend"
                ? "Friend"
                : "No"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
