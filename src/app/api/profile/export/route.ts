import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("*, events(event_date, event_type, cities(name))")
    .eq("user_id", user.id);

  const { data: matchScores } = await supabase
    .from("match_scores")
    .select("event_id, score_type, created_at")
    .eq("scorer_id", user.id);

  const { data: matchResults } = await supabase
    .from("match_results")
    .select("event_id, match_type, created_at")
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profile ? { ...profile, id: undefined } : null,
    event_registrations: registrations || [],
    match_scores_submitted: matchScores || [],
    match_results: matchResults || [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="my-data-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
