import { getMatchResults, getVipBonusData } from "@/lib/matches/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Crown, Mail, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const data = await getMatchResults(Number(eventId));

  if ("error" in data) {
    return (
      <div className="section-container max-w-2xl py-16 sm:py-20">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{data.error}</p>
            <Link
              href="/matches"
              className="text-primary hover:underline text-sm mt-4 block"
            >
              Back to My Matches
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

  return (
    <div className="section-container max-w-2xl py-16 sm:py-20">
      <h1 className="text-3xl font-bold mb-2">Match Results</h1>
      <p className="text-muted-foreground mb-6">
        {(data.event as any)?.date} - {(data.event as any)?.city}
      </p>

      {data.pendingSubmissions! > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded mb-6 text-sm text-amber-800">
          {data.pendingSubmissions} people haven&apos;t submitted their choices
          yet. More matches may appear later.
        </div>
      )}

      {dateMatches.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Date Matches
          </h2>
          <div className="space-y-3">
            {dateMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {friendMatches.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Friend Matches
          </h2>
          <div className="space-y-3">
            {friendMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {dateMatches.length === 0 && friendMatches.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 text-center text-muted-foreground">
            No mutual matches for this event. Keep attending events!
          </CardContent>
        </Card>
      )}

      {vipData && vipData.length > 0 && (
        <Card className="mt-6 border-0 shadow-sm ring-1 ring-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Crown className="h-5 w-5" />
              VIP: People Who Chose You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vipData.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      p.choice === "date"
                        ? "border-pink-300 text-pink-700"
                        : "border-blue-300 text-blue-700"
                    }
                  >
                    {p.choice}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This is a VIP-only feature. Contact details are only shared for
              mutual matches.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MatchCard({
  match,
}: {
  match: {
    id: number;
    type: string;
    name: string;
    sharedContacts: Record<string, string | null | undefined>;
  };
}) {
  const contacts = match.sharedContacts;
  const hasContacts = Object.values(contacts).some((v) => v);

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium text-lg">{match.name}</p>
          <Badge
            variant="outline"
            className={
              match.type === "mutual_date"
                ? "border-pink-300 text-pink-700"
                : "border-blue-300 text-blue-700"
            }
          >
            {match.type === "mutual_date" ? "Date" : "Friend"}
          </Badge>
        </div>
        {hasContacts && (
          <div className="flex flex-wrap gap-3 text-sm">
            {contacts.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {contacts.email}
              </span>
            )}
            {contacts.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {contacts.phone}
              </span>
            )}
            {contacts.whatsapp && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {contacts.whatsapp}
              </span>
            )}
            {contacts.instagram && (
              <span className="text-sm">IG: {contacts.instagram}</span>
            )}
            {contacts.facebook && (
              <span className="text-sm">FB: {contacts.facebook}</span>
            )}
          </div>
        )}
        {!hasContacts && (
          <p className="text-sm text-muted-foreground">
            No shared contact details
          </p>
        )}
      </CardContent>
    </Card>
  );
}
