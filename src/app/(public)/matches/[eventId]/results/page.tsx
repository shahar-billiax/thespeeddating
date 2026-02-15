import {
  getMatchResults,
  getVipBonusData,
  checkVipStatus,
} from "@/lib/matches/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Users,
  Crown,
  Mail,
  Phone,
  MessageCircle,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const t = await getTranslations();
  const data = await getMatchResults(Number(eventId));

  if ("error" in data) {
    return (
      <div className="section-container max-w-2xl py-16 sm:py-20">
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

  const dateMatches = data.matches!.filter((m) => m.type === "mutual_date");
  const friendMatches = data.matches!.filter(
    (m) => m.type === "mutual_friend"
  );

  const vipData = await getVipBonusData(Number(eventId));
  const isVip = await checkVipStatus();

  return (
    <div className="section-container max-w-2xl py-10 sm:py-16">
      <div className="mb-8">
        <Link
          href="/matches"
          className="text-sm text-muted-foreground hover:text-primary mb-3 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("matches.back_to_matches")}
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          {t("matches.results_title")}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {(data.event as any)?.date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date((data.event as any).date).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {(data.event as any)?.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {(data.event as any).city}
            </span>
          )}
        </div>
      </div>

      {data.pendingSubmissions! > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-6 text-sm text-amber-800">
          {data.pendingSubmissions} {t("matches.pending_submissions")}
        </div>
      )}

      {/* Date Matches */}
      {dateMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold">
              {t("matches.date_matches")}
            </h2>
            <Badge className="bg-pink-100 text-pink-700 border-pink-200 ms-auto">
              {dateMatches.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {dateMatches.map((match) => (
              <MatchCard key={match.id} match={match} type="date" />
            ))}
          </div>
        </div>
      )}

      {/* Friend Matches */}
      {friendMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold">
              {t("matches.friend_matches")}
            </h2>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 ms-auto">
              {friendMatches.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {friendMatches.map((match) => (
              <MatchCard key={match.id} match={match} type="friend" />
            ))}
          </div>
        </div>
      )}

      {/* No matches */}
      {dateMatches.length === 0 && friendMatches.length === 0 && (
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="pt-8 pb-8 text-center">
            <Heart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {t("matches.no_matches")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* VIP Section: Who Chose You */}
      {vipData && vipData.length > 0 && (
        <Card className="border-2 border-amber-300 shadow-md bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Crown className="h-5 w-5 fill-amber-500" />
              {t("matches.vip_who_chose_you")}
            </CardTitle>
            <p className="text-xs text-amber-700/80">
              {t("matches.vip_exclusive_note")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vipData.map((p: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white/80 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={p.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                        {p.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{p.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      p.choice === "date"
                        ? "border-pink-400 text-pink-700 bg-pink-50"
                        : "border-blue-400 text-blue-700 bg-blue-50"
                    }
                  >
                    {p.choice === "date" ? (
                      <Heart className="h-3 w-3 me-1" />
                    ) : (
                      <Users className="h-3 w-3 me-1" />
                    )}
                    {p.choice === "date" ? "Date" : "Friend"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Non-VIP Teaser */}
      {!isVip && (
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-yellow-50/80">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-amber-900">
              {t("matches.vip_upgrade_title")}
            </h3>
            <p className="text-sm text-amber-800/70 mb-4 max-w-sm mx-auto">
              {t("matches.vip_upgrade_text")}
            </p>
            <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-md">
              <Link href="/vip">{t("matches.vip_upgrade_cta")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MatchCard({
  match,
  type,
}: {
  match: {
    id: number;
    type: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    age?: number | null;
    city?: string | null;
    bio?: string | null;
    sharedContacts: Record<string, string | null | undefined>;
  };
  type: "date" | "friend";
}) {
  const contacts = match.sharedContacts;
  const hasContacts = Object.values(contacts).some((v) => v);
  const initials = `${match.firstName[0] ?? ""}${match.lastName?.[0] ?? ""}`.toUpperCase();
  const borderClass = type === "date" ? "border-s-4 border-s-pink-400" : "border-s-4 border-s-blue-400";

  return (
    <Card className={`border-0 shadow-sm overflow-hidden ${borderClass}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-background shadow-md shrink-0">
            <AvatarImage src={match.avatarUrl ?? undefined} className="object-cover" />
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {match.firstName} {match.lastName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  {match.age && <span>{match.age}</span>}
                  {match.age && match.city && <span>·</span>}
                  {match.city && (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {match.city}
                    </span>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  type === "date"
                    ? "border-pink-300 text-pink-700 bg-pink-50 shrink-0"
                    : "border-blue-300 text-blue-700 bg-blue-50 shrink-0"
                }
              >
                {type === "date" ? (
                  <Heart className="h-3 w-3 me-1" />
                ) : (
                  <Users className="h-3 w-3 me-1" />
                )}
                {type === "date" ? "Date" : "Friend"}
              </Badge>
            </div>

            {match.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {match.bio}
              </p>
            )}

            {/* Contact details */}
            {hasContacts ? (
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm mt-3">
                {contacts.email && (
                  <a href={`mailto:${contacts.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-3.5 w-3.5" />
                    {contacts.email}
                  </a>
                )}
                {contacts.phone && (
                  <a href={`tel:${contacts.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                    {contacts.phone}
                  </a>
                )}
                {contacts.whatsapp && (
                  <a href={`https://wa.me/${contacts.whatsapp.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-green-600 transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                )}
                {contacts.instagram && (
                  <a href={`https://instagram.com/${contacts.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-pink-600 transition-colors">
                    @{contacts.instagram.replace("@", "")}
                  </a>
                )}
                {contacts.facebook && (
                  <span className="text-sm text-muted-foreground">
                    FB: {contacts.facebook}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 mt-2">
                No shared contact details
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
