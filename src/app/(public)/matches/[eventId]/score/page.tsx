import { getScoreData } from "@/lib/matches/actions";
import { ScoreForm } from "@/components/matches/score-form";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function ScorePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const data = await getScoreData(Number(eventId));

  if ("error" in data) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{data.error}</p>
            <Link href="/matches" className="text-primary hover:underline text-sm mt-4 block">
              Back to My Matches
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Submit Your Choices</h1>
      <p className="text-muted-foreground mb-6">
        For each person, choose Date, Friend, or No. You must submit choices for
        everyone before saving. This cannot be changed after submission.
      </p>
      <ScoreForm
        eventId={Number(eventId)}
        participants={data.participants!}
        defaults={data.defaults!}
      />
    </div>
  );
}
