import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

interface RecentMatch {
  id: number;
  eventId: number;
  matchName: string;
  matchAvatar: string | null;
  eventDate: string;
  eventType: string;
  city: string;
}

interface RecentMatchesWidgetProps {
  matches: RecentMatch[];
}

function formatEventType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function RecentMatchesWidget({
  matches,
}: RecentMatchesWidgetProps) {
  const t = await getTranslations();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Heart className="h-4 w-4 text-pink-500" />
            {t("dashboard.recent_matches")}
          </CardTitle>
          {matches.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="group gap-1 text-xs"
              asChild
            >
              <Link href="/dashboard/matches">
                {t("dashboard.view_all_matches")}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-50">
                <Heart className="h-7 w-7 text-pink-300" />
              </div>
              <div className="absolute -end-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                <Sparkles className="h-3 w-3 text-amber-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("dashboard.no_matches_yet")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {t("dashboard.matches_will_appear")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/dashboard/matches/${match.eventId}/results`}
                className={cn(
                  "group flex items-center gap-3.5 rounded-xl border p-3.5",
                  "transition-all duration-200 hover:shadow-sm hover:border-pink-200 hover:bg-pink-50/30"
                )}
              >
                {/* Avatar with colored ring */}
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 ring-2 ring-pink-200 ring-offset-2 ring-offset-background transition-all group-hover:ring-pink-400">
                    <AvatarImage
                      src={match.matchAvatar || undefined}
                      alt={match.matchName}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 text-sm font-semibold">
                      {match.matchName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {/* Heart indicator */}
                  <div className="absolute -bottom-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 ring-2 ring-background">
                    <Heart className="h-2 w-2 fill-white text-white" />
                  </div>
                </div>

                {/* Match info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {match.matchName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {formatEventType(match.eventType)} &middot; {match.city}
                  </p>
                </div>

                {/* Decorative heart */}
                <Heart className="h-4 w-4 shrink-0 fill-pink-200 text-pink-300 transition-colors group-hover:fill-pink-400 group-hover:text-pink-400" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
