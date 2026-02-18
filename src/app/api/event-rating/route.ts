import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/event-rating — Submit event feedback + per-person date ratings
 * GET  /api/event-rating?eventId=123 — Get user's ratings for an event
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  // Get event feedback
  const { data: feedback } = await supabase
    .from("event_feedback" as any)
    .select("*")
    .eq("event_id", Number(eventId))
    .eq("user_id", user.id)
    .single();

  // Get date ratings
  const { data: ratings } = await supabase
    .from("date_ratings" as any)
    .select("*")
    .eq("event_id", Number(eventId))
    .eq("from_user_id", user.id);

  return NextResponse.json({ feedback: feedback ?? null, ratings: ratings ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, event_id } = body;

  if (!event_id) {
    return NextResponse.json({ error: "event_id required" }, { status: 400 });
  }

  // Verify user attended the event
  const { data: registration } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", event_id)
    .eq("user_id", user.id)
    .in("status", ["confirmed", "attended"])
    .single();

  if (!registration) {
    return NextResponse.json({ error: "You did not attend this event" }, { status: 403 });
  }

  if (type === "feedback") {
    // Event-level feedback
    const { overall_satisfaction, met_aligned_people, would_attend_again } = body;

    if (typeof overall_satisfaction !== "number" || overall_satisfaction < 1 || overall_satisfaction > 5) {
      return NextResponse.json({ error: "overall_satisfaction must be 1-5" }, { status: 400 });
    }

    const { error } = await supabase.from("event_feedback" as any).upsert(
      {
        event_id,
        user_id: user.id,
        overall_satisfaction,
        met_aligned_people: !!met_aligned_people,
        would_attend_again: !!would_attend_again,
      },
      { onConflict: "event_id,user_id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  if (type === "date_rating") {
    // Per-person rating
    const {
      to_user_id,
      would_meet_again,
      conversation_quality,
      long_term_potential,
      physical_chemistry,
      comfort_level,
      values_alignment,
      energy_compatibility,
    } = body;

    if (!to_user_id) {
      return NextResponse.json({ error: "to_user_id required" }, { status: 400 });
    }

    // Validate all rating fields are 1-5
    const ratingFields = {
      conversation_quality,
      long_term_potential,
      physical_chemistry,
      comfort_level,
      values_alignment,
      energy_compatibility,
    };

    for (const [field, val] of Object.entries(ratingFields)) {
      if (typeof val !== "number" || val < 1 || val > 5) {
        return NextResponse.json({ error: `${field} must be 1-5` }, { status: 400 });
      }
    }

    const { error } = await supabase.from("date_ratings" as any).upsert(
      {
        event_id,
        from_user_id: user.id,
        to_user_id,
        would_meet_again: !!would_meet_again,
        conversation_quality,
        long_term_potential,
        physical_chemistry,
        comfort_level,
        values_alignment,
        energy_compatibility,
      },
      { onConflict: "event_id,from_user_id,to_user_id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Invalidate cached scores for both users since chemistry is directional
    await supabase
      .from("compatibility_scores" as any)
      .delete()
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
    await supabase
      .from("compatibility_scores" as any)
      .delete()
      .or(`user_a.eq.${to_user_id},user_b.eq.${to_user_id}`);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type. Use 'feedback' or 'date_rating'" }, { status: 400 });
}
