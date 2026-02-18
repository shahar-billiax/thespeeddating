import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/matches/compatibility?page=1&per_page=20
 *
 * Returns paginated compatibility matches for the current user.
 * Includes match explanation. Premium users get detailed breakdown.
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const perPage = Math.min(Number(request.nextUrl.searchParams.get("per_page") ?? "20"), 50);
  const offset = (page - 1) * perPage;

  // Fetch cached scores for this user
  const { data: scores, count } = await supabase
    .from("compatibility_scores" as any)
    .select("*", { count: "exact" })
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .gt("final_score", 0)
    .order("final_score", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (!scores || scores.length === 0) {
    return NextResponse.json({
      matches: [],
      total: 0,
      page,
      per_page: perPage,
      has_more: false,
    });
  }

  // Get partner IDs
  const partnerIds = scores.map((s: any) =>
    s.user_a === user.id ? s.user_b : s.user_a
  );

  // Fetch partner profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, date_of_birth, avatar_url, city_id, cities(name)")
    .in("id", partnerIds);

  // Check VIP status
  const { data: vipSub } = await supabase
    .from("vip_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const isVip = !!vipSub;

  const profileMap = new Map<string, any>();
  for (const p of profiles ?? []) {
    profileMap.set(p.id, p);
  }

  const matches = scores.map((s: any) => {
    const partnerId = s.user_a === user.id ? s.user_b : s.user_a;
    const profile = profileMap.get(partnerId);
    const breakdown = s.breakdown;

    const age = profile?.date_of_birth
      ? Math.floor(
          (Date.now() - new Date(profile.date_of_birth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;

    const match: any = {
      user_id: partnerId,
      first_name: profile?.first_name ?? "Unknown",
      last_name: profile?.last_name ?? "",
      age,
      avatar_url: profile?.avatar_url ?? null,
      city: (profile?.cities as any)?.name ?? null,
      final_score: s.final_score,
      explanation: breakdown?.explanation ?? null,
    };

    // Premium breakdown for VIP users (read from cached computation)
    if (isVip && breakdown?.premium_breakdown) {
      match.premium_breakdown = breakdown.premium_breakdown;
    }

    return match;
  });

  return NextResponse.json({
    matches,
    total: count ?? 0,
    page,
    per_page: perPage,
    has_more: (count ?? 0) > offset + perPage,
  });
}
