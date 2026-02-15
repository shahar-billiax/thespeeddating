import { getEnhancedScoreData } from "@/lib/matches/actions";
import { MatchingFlow } from "@/components/matches/matching-flow";
import type { MatchQuestion } from "@/components/matches/match-questions";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default async function ScorePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const t = await getTranslations();
  const data = await getEnhancedScoreData(Number(eventId));

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

  if (!data.participants || data.participants.length === 0) {
    return (
      <div className="section-container max-w-2xl py-16 sm:py-20 min-h-screen">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-muted-foreground mb-4">
              {t("matches.no_participants")}
            </p>
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

  return (
    <div className="section-container max-w-4xl py-10 sm:py-16 min-h-screen">
      <div className="mb-8">
        <Link
          href="/matches"
          className="text-sm text-muted-foreground hover:text-primary mb-3 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("matches.back_to_matches")}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{t("matches.submit_choices")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("matches.score_instruction")}
        </p>
      </div>

      <MatchingFlow
        eventId={Number(eventId)}
        participants={data.participants}
        questions={(data.questions ?? []) as MatchQuestion[]}
        defaults={data.defaults!}
        draftScores={data.draftScores ?? null}
        deadline={data.deadline ?? null}
        vipChoices={data.vipChoices ?? null}
      />
    </div>
  );
}
