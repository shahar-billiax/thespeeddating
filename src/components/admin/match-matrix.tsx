"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MatchMatrix({ eventId }: { eventId: number }) {
  const [data, setData] = useState<{ males: any[]; females: any[]; scores: any[] } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: regs } = await supabase
        .from("event_registrations")
        .select("user_id, profiles(first_name, last_name, gender)")
        .eq("event_id", eventId);

      const males = (regs || []).filter((r: any) => r.profiles?.gender === "male");
      const females = (regs || []).filter((r: any) => r.profiles?.gender === "female");

      const { data: scores } = await supabase
        .from("match_scores")
        .select("scorer_id, scored_id, score_type")
        .eq("event_id", eventId);

      setData({ males, females, scores: scores || [] });
    }
    load();
  }, [eventId]);

  if (!data) return <p className="text-muted-foreground">Loading match matrix...</p>;
  if (data.males.length === 0 && data.females.length === 0) return <p className="text-muted-foreground">No participants yet</p>;
  if (data.scores.length === 0) return <p className="text-muted-foreground">No scores submitted yet</p>;

  const getScore = (scorerId: string, scoredId: string) => {
    const s = data.scores.find((s: any) => s.scorer_id === scorerId && s.scored_id === scoredId);
    if (!s) return "";
    if (s.score_type === "date") return "❤️";
    if (s.score_type === "friend") return "👋";
    return "✗";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Matrix</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="border p-1 bg-muted">Scorer → Scored</th>
              {data.females.map((f: any) => (
                <th key={f.user_id} className="border p-1 bg-pink-50 text-center whitespace-nowrap">
                  {f.profiles?.first_name?.[0]}{f.profiles?.last_name?.[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.males.map((m: any) => (
              <tr key={m.user_id}>
                <td className="border p-1 bg-blue-50 font-medium whitespace-nowrap">
                  {m.profiles?.first_name} {m.profiles?.last_name?.[0]}.
                </td>
                {data.females.map((f: any) => (
                  <td key={f.user_id} className="border p-1 text-center">
                    {getScore(m.user_id, f.user_id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.females.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground mt-4 font-semibold">Female → Male scores:</p>
            <table className="text-xs border-collapse mt-1">
              <thead>
                <tr>
                  <th className="border p-1 bg-muted">Scorer → Scored</th>
                  {data.males.map((m: any) => (
                    <th key={m.user_id} className="border p-1 bg-blue-50 text-center whitespace-nowrap">
                      {m.profiles?.first_name?.[0]}{m.profiles?.last_name?.[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.females.map((f: any) => (
                  <tr key={f.user_id}>
                    <td className="border p-1 bg-pink-50 font-medium whitespace-nowrap">
                      {f.profiles?.first_name} {f.profiles?.last_name?.[0]}.
                    </td>
                    {data.males.map((m: any) => (
                      <td key={m.user_id} className="border p-1 text-center">
                        {getScore(f.user_id, m.user_id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
