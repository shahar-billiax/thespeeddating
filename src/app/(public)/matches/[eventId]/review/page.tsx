import { getSubmittedChoices } from "@/lib/matches/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import {
  AlertCircle,
  ArrowLeft,
  Heart,
  Users,
  X,
  MapPin,
  Calendar,
} from "lucide-react";

export default async function ReviewPage({
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
      <div className="section-container max-w-2xl py-16 sm:py-20 min-h-screen">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-muted-foreground mb-4">{data.error}</p>
            <Link
              href="/matches"
              className="text-primary hover:underline text-sm"
            >
              {t("matches.back_to_matches")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dateCount = data.choices!.filter((c) => c.choice === "date").length;
  const friendCount = data.choices!.filter((c) => c.choice === "friend").length;
  const passCount = data.choices!.filter((c) => c.choice === "no").length;

  const eventDate = new Date(data.event!.date);
  const formattedDate = eventDate.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="section-container max-w-3xl py-10 sm:py-16 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/matches"
          className="text-sm text-muted-foreground hover:text-primary mb-3 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("matches.back_to_matches")}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{t("matches.your_choices")}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          {data.event!.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {data.event!.city}
            </span>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex flex-wrap gap-2 mb-6">
        {dateCount > 0 && (
          <Badge className="bg-pink-100 text-pink-700 border-pink-200 gap-1">
            <Heart className="h-3 w-3" />
            {t("matches.choices_summary_date", { count: dateCount })}
          </Badge>
        )}
        {friendCount > 0 && (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
            <Users className="h-3 w-3" />
            {t("matches.choices_summary_friend", { count: friendCount })}
          </Badge>
        )}
        {passCount > 0 && (
          <Badge className="bg-gray-100 text-gray-600 border-gray-200 gap-1">
            <X className="h-3 w-3" />
            {t("matches.choices_summary_pass", { count: passCount })}
          </Badge>
        )}
      </div>

      {/* Choices grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.choices!.map((choice) => {
          const initials = `${choice.firstName[0] ?? ""}${choice.lastName?.[0] ?? ""}`.toUpperCase();
          return (
            <Card
              key={choice.id}
              className={`border overflow-hidden ${
                choice.choice === "date"
                  ? "ring-2 ring-pink-300 border-pink-200"
                  : choice.choice === "friend"
                    ? "ring-2 ring-blue-300 border-blue-200"
                    : "ring-2 ring-gray-300 border-gray-200"
              }`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-background shadow-md">
                    <AvatarImage
                      src={choice.avatarUrl ?? undefined}
                      alt={choice.firstName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 w-full">
                    <p className="font-semibold text-sm truncate">
                      {choice.firstName} {choice.lastName}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
                      {choice.age && <span>{choice.age}</span>}
                      {choice.age && choice.city && <span>·</span>}
                      {choice.city && (
                        <span className="inline-flex items-center gap-0.5 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{choice.city}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className={`text-xs gap-1 ${
                      choice.choice === "date"
                        ? "bg-pink-100 text-pink-700 border-pink-200"
                        : choice.choice === "friend"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {choice.choice === "date" && <Heart className="h-3 w-3" />}
                    {choice.choice === "friend" && <Users className="h-3 w-3" />}
                    {choice.choice === "no" && <X className="h-3 w-3" />}
                    {choice.choice === "date" && t("matches.date")}
                    {choice.choice === "friend" && t("matches.friend")}
                    {choice.choice === "no" && t("matches.pass")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending note */}
      <p className="text-sm text-muted-foreground text-center mt-8">
        {t("matches.results_pending_note")}
      </p>
    </div>
  );
}
