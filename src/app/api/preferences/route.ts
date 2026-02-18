import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/preferences — Save dealbreaker preferences
 * GET  /api/preferences — Get current user's dealbreaker preferences
 */

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("dealbreaker_preferences" as any)
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

  // Validate
  if (body.preferred_age_min != null && (body.preferred_age_min < 18 || body.preferred_age_min > 99)) {
    return NextResponse.json({ error: "preferred_age_min must be 18-99" }, { status: 400 });
  }
  if (body.preferred_age_max != null && (body.preferred_age_max < 18 || body.preferred_age_max > 99)) {
    return NextResponse.json({ error: "preferred_age_max must be 18-99" }, { status: 400 });
  }
  if (body.min_education_level != null && (body.min_education_level < 1 || body.min_education_level > 5)) {
    return NextResponse.json({ error: "min_education_level must be 1-5" }, { status: 400 });
  }

  const { error } = await supabase.from("dealbreaker_preferences" as any).upsert(
    {
      user_id: user.id,
      preferred_age_min: body.preferred_age_min ?? null,
      preferred_age_max: body.preferred_age_max ?? null,
      religion_must_match: body.religion_must_match ?? false,
      acceptable_religions: body.acceptable_religions ?? null,
      must_want_children: body.must_want_children ?? false,
      min_education_level: body.min_education_level ?? null,
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
