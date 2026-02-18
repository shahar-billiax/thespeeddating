import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/compatibility — Save compatibility profile (20-question assessment)
 * GET  /api/compatibility — Get current user's compatibility profile
 */

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("compatibility_profiles" as any)
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? null });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Validate all 20 fields are present and 1-5
  const requiredFields = [
    "emotional_expressiveness",
    "conflict_approach",
    "need_for_reassurance",
    "stress_reaction",
    "lifestyle_pace",
    "social_energy",
    "weekend_preference",
    "structure_spontaneity",
    "career_ambition_compat",
    "financial_goals",
    "personal_growth_drive",
    "work_life_compat",
    "parenting_style",
    "family_involvement",
    "relationship_timeline",
    "living_preference",
    "conversation_depth",
    "affection_style",
    "decision_making_style",
    "need_for_novelty",
  ];

  for (const field of requiredFields) {
    const val = body[field];
    if (typeof val !== "number" || val < 1 || val > 5) {
      return NextResponse.json(
        { error: `Invalid value for ${field}: must be integer 1-5` },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase.from("compatibility_profiles" as any).upsert(
    {
      user_id: user.id,
      ...Object.fromEntries(requiredFields.map((f) => [f, body[f]])),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Invalidate cached scores
  await supabase
    .from("compatibility_scores" as any)
    .delete()
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  return NextResponse.json({ success: true });
}
