import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminCompatibilityClient } from "./client";

export default async function AdminCompatibilityPage() {
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

  // Fetch current weights (table from migration 040, not in generated types)
  const { data: weights } = (await supabase
    .from("match_weight_config" as any)
    .select("*")
    .eq("id", 1)
    .single()) as { data: any };

  // Fetch stats
  const { count: totalProfiles } = await supabase
    .from("compatibility_profiles" as any)
    .select("*", { count: "exact", head: true });

  const { count: totalScores } = await supabase
    .from("compatibility_scores" as any)
    .select("*", { count: "exact", head: true });

  const { count: totalRatings } = await supabase
    .from("date_ratings" as any)
    .select("*", { count: "exact", head: true });

  const defaultWeights = {
    id: 1,
    life_alignment_weight: 0.30,
    psychological_weight: 0.25,
    chemistry_weight: 0.15,
    taste_learning_weight: 0.10,
    profile_completeness_weight: 0.05,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Compatibility Engine</h1>
        <p className="text-muted-foreground">
          Configure matching weights and monitor the compatibility system.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Compatibility Profiles" value={totalProfiles ?? 0} />
        <StatCard label="Cached Match Scores" value={totalScores ?? 0} />
        <StatCard label="Date Ratings" value={totalRatings ?? 0} />
      </div>

      <AdminCompatibilityClient weights={weights ?? defaultWeights} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
