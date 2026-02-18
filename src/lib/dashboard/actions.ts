"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// ─── Dashboard Stats ─────────────────────────────────────────

export async function getDashboardStats() {
  const { supabase, user } = await requireUser();

  const [
    { count: eventsAttended },
    { count: mutualMatches },
    { data: vipSub },
  ] = await Promise.all([
    supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["confirmed", "attended"]),
    supabase
      .from("match_results" as any)
      .select("*", { count: "exact", head: true })
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .eq("result_type", "mutual_date"),
    supabase
      .from("vip_subscriptions" as any)
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
  ]);

  return {
    eventsAttended: eventsAttended ?? 0,
    mutualMatches: mutualMatches ?? 0,
    isVip: !!vipSub,
    vipExpiresAt: (vipSub as any)?.current_period_end ?? null,
  };
}

// ─── Upcoming Registered Events ──────────────────────────────

export async function getUpcomingRegisteredEvents() {
  const { supabase, user } = await requireUser();

  const today = new Date().toISOString().split("T")[0];

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(
      `event_id, status,
       events(id, event_date, start_time, end_time, event_type,
              cities(name), venues(name))`
    )
    .eq("user_id", user.id)
    .in("status", ["confirmed", "pending"])
    .order("registered_at", { ascending: false });

  if (!registrations) return [];

  return registrations
    .filter((r: any) => r.events?.event_date >= today)
    .map((r: any) => ({
      eventId: r.events.id,
      date: r.events.event_date,
      startTime: r.events.start_time,
      endTime: r.events.end_time,
      type: r.events.event_type,
      city: r.events.cities?.name,
      venue: r.events.venues?.name,
      status: r.status as string,
    }))
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .slice(0, 5);
}

// ─── Pending Actions ─────────────────────────────────────────

export async function getPendingActions() {
  const { supabase, user } = await requireUser();

  const actions: {
    type: "score" | "complete_profile" | "vip_expiring";
    label: string;
    href: string;
    eventId?: number;
  }[] = [];

  // Check for events that need scoring
  const today = new Date().toISOString().split("T")[0];
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(
      `event_id,
       events(id, event_date, event_type, match_submission_open,
              match_submission_locked, match_submission_deadline,
              match_results_released, cities(name))`
    )
    .eq("user_id", user.id)
    .in("status", ["confirmed", "attended"]);

  const pastEvents = (registrations ?? []).filter(
    (r: any) => r.events?.event_date < today
  );

  const eventIds = pastEvents.map((r: any) => r.events?.id).filter(Boolean);

  // Check which events have been submitted (not drafts)
  const { data: submittedScores } = await supabase
    .from("match_scores")
    .select("event_id")
    .eq("scorer_id", user.id)
    .eq("is_draft", false)
    .in("event_id", eventIds.length > 0 ? eventIds : [-1]);

  const submittedEventIds = new Set(
    (submittedScores ?? []).map((s) => s.event_id)
  );

  for (const r of pastEvents) {
    const event = (r as any).events;
    if (
      event.match_submission_open &&
      !event.match_submission_locked &&
      !event.match_results_released &&
      !submittedEventIds.has(event.id)
    ) {
      // Check deadline hasn't passed
      if (
        !event.match_submission_deadline ||
        new Date(event.match_submission_deadline) > new Date()
      ) {
        actions.push({
          type: "score",
          label: `${event.event_type} - ${event.cities?.name}`,
          href: `/dashboard/matches/${event.id}/score`,
          eventId: event.id,
        });
      }
    }
  }

  // Check if compatibility profile is incomplete
  const { data: compatProfile } = await supabase
    .from("compatibility_profiles" as any)
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!compatProfile) {
    actions.push({
      type: "complete_profile",
      label: "compatibility",
      href: "/onboarding",
    });
  }

  // Check VIP expiring soon
  const { data: vipSub } = await supabase
    .from("vip_subscriptions" as any)
    .select("current_period_end")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const vipData = vipSub as any;
  if (vipData?.current_period_end) {
    const daysUntilExpiry = Math.ceil(
      (new Date(vipData.current_period_end).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= 14 && daysUntilExpiry > 0) {
      actions.push({
        type: "vip_expiring",
        label: String(daysUntilExpiry),
        href: "/dashboard/subscription",
      });
    }
  }

  return actions;
}

// ─── Recent Matches ──────────────────────────────────────────

export async function getRecentMatches() {
  const { supabase, user } = await requireUser();

  const { data: matches } = await supabase
    .from("match_results" as any)
    .select(
      `id, result_type, event_id, user_a_id, user_b_id,
       events(event_date, event_type, cities(name))`
    )
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .eq("result_type", "mutual_date")
    .order("created_at", { ascending: false })
    .limit(3);

  if (!matches || matches.length === 0) return [];

  // Get profile info for matched users
  const matchedUserIds = matches.map((m: any) =>
    m.user_a_id === user.id ? m.user_b_id : m.user_a_id
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, avatar_url")
    .in("id", matchedUserIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  return matches.map((m: any) => {
    const matchedUserId =
      m.user_a_id === user.id ? m.user_b_id : m.user_a_id;
    const matchedProfile = profileMap.get(matchedUserId);
    return {
      id: m.id,
      eventId: m.event_id,
      matchName: matchedProfile?.first_name || "Someone",
      matchAvatar: matchedProfile?.avatar_url ?? null,
      eventDate: m.events?.event_date ?? "",
      eventType: m.events?.event_type ?? "",
      city: m.events?.cities?.name ?? "",
    };
  });
}

// ─── Cancel Registration ─────────────────────────────────────

export async function cancelEventRegistration(eventId: number) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("event_registrations")
    .update({ status: "cancelled" })
    .eq("user_id", user.id)
    .eq("event_id", eventId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// ─── Subscription Details ────────────────────────────────────

export async function getSubscriptionDetails() {
  const { supabase, user } = await requireUser();

  const { data: sub } = await supabase
    .from("vip_subscriptions" as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return sub;
}

// ─── Subscription Management ─────────────────────────────────

export async function toggleAutoRenewal(
  subscriptionId: number,
  autoRenew: boolean
) {
  const { user } = await requireUser();
  const adminClient = createAdminClient();

  const { data: sub } = await adminClient
    .from("vip_subscriptions" as any)
    .select("id, user_id, status")
    .eq("id", subscriptionId)
    .single();

  if (!sub || (sub as any).user_id !== user.id) {
    return { error: "Subscription not found" };
  }

  if ((sub as any).status !== "active") {
    return { error: "Can only toggle auto-renewal on active subscriptions" };
  }

  const { error } = await adminClient
    .from("vip_subscriptions" as any)
    .update({ auto_renew: autoRenew } as any)
    .eq("id", subscriptionId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function cancelSubscription(subscriptionId: number) {
  const { user } = await requireUser();
  const adminClient = createAdminClient();

  const { data: sub } = await adminClient
    .from("vip_subscriptions" as any)
    .select("id, user_id, status")
    .eq("id", subscriptionId)
    .single();

  if (!sub || (sub as any).user_id !== user.id) {
    return { error: "Subscription not found" };
  }

  if ((sub as any).status !== "active") {
    return { error: "Subscription is not active" };
  }

  const { error } = await adminClient
    .from("vip_subscriptions" as any)
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      auto_renew: false,
    } as any)
    .eq("id", subscriptionId);

  if (error) return { error: error.message };
  return { success: true };
}

// ─── Purchase / Checkout ─────────────────────────────────────

/**
 * Initiates a plan purchase (extend, reactivate, or new subscription).
 *
 * Returns { checkoutUrl } when a Stripe session is created, or
 * { error: "stripe_not_configured" } until Stripe is integrated.
 *
 * TODO – Stripe integration:
 *   1. import Stripe from "stripe"
 *   2. const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
 *   3. Fetch the plan price / metadata
 *   4. Determine mode: "subscription" (new/reactivate) or extend by updating period_end
 *   5. Create a checkout session and return { checkoutUrl: session.url }
 */
export async function purchasePlan(
  planId: number
): Promise<{ checkoutUrl?: string; error?: string }> {
  const { supabase, user } = await requireUser();

  const { data: plan } = await supabase
    .from("vip_plans" as any)
    .select("id, months, total_price, is_active")
    .eq("id", planId)
    .eq("is_active", true)
    .single();

  if (!plan) return { error: "Plan not found" };

  // ── Stripe integration goes here ──────────────────────────
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const session = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   customer_email: user.email,
  //   line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
  //   success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?success=1`,
  //   cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription`,
  //   metadata: { user_id: user.id, plan_id: String(plan.id) },
  // });
  // return { checkoutUrl: session.url ?? undefined };
  // ──────────────────────────────────────────────────────────

  void user; // referenced once Stripe is added
  return { error: "stripe_not_configured" };
}

// ─── Notification Preferences ────────────────────────────────

export async function updateNotificationPreferences(prefs: {
  subscribed_email?: boolean;
  subscribed_phone?: boolean;
  subscribed_sms?: boolean;
}) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update(prefs)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
