"use client";

import { MatchWeightControls } from "@/components/admin/match-weight-controls";
import { saveMatchWeights, adminRecalculateMatches } from "@/lib/compatibility/admin-actions";
import type { MatchWeightConfig } from "@/types/compatibility";

interface AdminCompatibilityClientProps {
  weights: MatchWeightConfig;
}

export function AdminCompatibilityClient({ weights }: AdminCompatibilityClientProps) {
  return (
    <MatchWeightControls
      weights={weights}
      onSave={saveMatchWeights}
      onRecalculate={adminRecalculateMatches}
    />
  );
}
