"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { MatchWeightConfig } from "@/types/compatibility";

interface MatchWeightControlsProps {
  weights: MatchWeightConfig;
  onSave: (weights: Partial<MatchWeightConfig>) => Promise<void>;
  onRecalculate: () => Promise<{ computed: number }>;
}

export function MatchWeightControls({
  weights: initialWeights,
  onSave,
  onRecalculate,
}: MatchWeightControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [recalculating, setRecalculating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recalcResult, setRecalcResult] = useState<string | null>(null);

  const [weights, setWeights] = useState({
    life_alignment_weight: initialWeights.life_alignment_weight,
    psychological_weight: initialWeights.psychological_weight,
    chemistry_weight: initialWeights.chemistry_weight,
    taste_learning_weight: initialWeights.taste_learning_weight,
    profile_completeness_weight: initialWeights.profile_completeness_weight,
  });

  const total =
    weights.life_alignment_weight +
    weights.psychological_weight +
    weights.chemistry_weight +
    weights.taste_learning_weight +
    weights.profile_completeness_weight;

  const remaining = Math.round((1 - total) * 100);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await onSave(weights);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  async function handleRecalculate() {
    setRecalculating(true);
    setRecalcResult(null);
    try {
      const result = await onRecalculate();
      setRecalcResult(`Recalculated ${result.computed} match scores.`);
    } catch {
      setRecalcResult("Recalculation failed.");
    } finally {
      setRecalculating(false);
    }
  }

  const sliders = [
    {
      key: "life_alignment_weight" as const,
      label: "Life Alignment",
      description: "Kids, religion, education, age compatibility",
    },
    {
      key: "psychological_weight" as const,
      label: "Psychological Compatibility",
      description: "20-question personality assessment similarity",
    },
    {
      key: "chemistry_weight" as const,
      label: "Chemistry",
      description: "Event-based ratings and date feedback",
    },
    {
      key: "taste_learning_weight" as const,
      label: "Taste Learning",
      description: "Learned preferences from rating patterns",
    },
    {
      key: "profile_completeness_weight" as const,
      label: "Profile Completeness",
      description: "Bonus for fully completed profiles",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Match Scoring Weights</CardTitle>
          <CardDescription>
            Adjust the relative importance of each scoring dimension.
            Total must not exceed 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sliders.map((s) => (
            <div key={s.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{s.label}</Label>
                  <p className="text-muted-foreground text-xs">{s.description}</p>
                </div>
                <span className="text-sm font-mono font-medium">
                  {Math.round(weights[s.key] * 100)}%
                </span>
              </div>
              <Slider
                min={0}
                max={50}
                step={1}
                value={[Math.round(weights[s.key] * 100)]}
                onValueChange={([v]) =>
                  setWeights((prev) => ({ ...prev, [s.key]: v / 100 }))
                }
              />
            </div>
          ))}

          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between text-sm">
              <span>Total allocated:</span>
              <span
                className={`font-mono font-medium ${
                  total > 1 ? "text-red-600" : "text-green-600"
                }`}
              >
                {Math.round(total * 100)}%
              </span>
            </div>
            {remaining > 0 && (
              <p className="text-muted-foreground mt-1 text-xs">
                {remaining}% remaining serves as neutral base score.
              </p>
            )}
            {total > 1 && (
              <p className="mt-1 text-xs text-red-600">
                Total exceeds 100%. Please reduce weights.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={handleSave} disabled={isPending || total > 1}>
          {isPending ? "Saving..." : "Save Weights"}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}

        <div className="ms-auto flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            {recalculating ? "Recalculating..." : "Recalculate All Scores"}
          </Button>
          {recalcResult && (
            <span className="text-muted-foreground text-sm">{recalcResult}</span>
          )}
        </div>
      </div>
    </div>
  );
}
