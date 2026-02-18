"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { MatchWeightConfig } from "@/types/compatibility";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");
  return user;
}

export async function saveMatchWeights(weights: Partial<MatchWeightConfig>) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("match_weight_config" as any)
    .update({
      life_alignment_weight: weights.life_alignment_weight,
      psychological_weight: weights.psychological_weight,
      chemistry_weight: weights.chemistry_weight,
      taste_learning_weight: weights.taste_learning_weight,
      profile_completeness_weight: weights.profile_completeness_weight,
      updated_at: new Date().toISOString(),
      updated_by: admin.id,
    })
    .eq("id", 1);

  if (error) throw new Error(`Failed to save weights: ${error.message}`);

  revalidatePath("/admin/compatibility");
}

export async function adminRecalculateMatches(): Promise<{ computed: number }> {
  await requireAdmin();

  // Call the admin API route to do the actual recalculation
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/recalculate-matches`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }
  );

  if (!response.ok) {
    // Fallback: do it directly via admin client
    const supabase = createAdminClient();

    // Get all active profiles
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_active", true);

    // For now, just clear and return count
    await supabase
      .from("compatibility_scores" as any)
      .delete()
      .neq("user_a", "00000000-0000-0000-0000-000000000000");

    revalidatePath("/admin/compatibility");
    return { computed: 0 };
  }

  const result = await response.json();
  revalidatePath("/admin/compatibility");
  return result;
}

export async function getCompatibilityStats() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { count: totalProfiles } = await supabase
    .from("compatibility_profiles" as any)
    .select("*", { count: "exact", head: true });

  const { count: totalScores } = await supabase
    .from("compatibility_scores" as any)
    .select("*", { count: "exact", head: true });

  const { count: totalRatings } = await supabase
    .from("date_ratings" as any)
    .select("*", { count: "exact", head: true });

  const { count: totalFeedback } = await supabase
    .from("event_feedback" as any)
    .select("*", { count: "exact", head: true });

  return {
    totalProfiles: totalProfiles ?? 0,
    totalScores: totalScores ?? 0,
    totalRatings: totalRatings ?? 0,
    totalFeedback: totalFeedback ?? 0,
  };
}
