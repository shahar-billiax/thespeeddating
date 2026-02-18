"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  CompatibilityMatchResult,
  ExplanationStrength,
  MatchExplanation,
  PremiumCompatibilityBreakdown,
} from "@/types/compatibility";
import { getCompatibilityMatches } from "@/lib/compatibility/actions";
import { ShieldCheck, CalendarCheck2 } from "lucide-react";

function getTranslatedSummary(explanation: MatchExplanation, t: ReturnType<typeof useTranslations>): string {
  const parts: string[] = [];

  if (explanation.family_alignment === "very_strong") {
    parts.push(t("compat.summary_family_very_strong"));
  } else if (explanation.family_alignment === "strong") {
    parts.push(t("compat.summary_family_strong"));
  }
  if (explanation.faith_compatibility === "very_strong" || explanation.faith_compatibility === "strong") {
    parts.push(t("compat.summary_faith"));
  }
  if (explanation.emotional_balance === "very_strong" || explanation.emotional_balance === "strong") {
    parts.push(t("compat.summary_emotional"));
  }
  if (explanation.lifestyle_match === "very_strong" || explanation.lifestyle_match === "strong") {
    parts.push(t("compat.summary_lifestyle"));
  }
  if (explanation.chemistry_signal === "positive") {
    parts.push(t("compat.summary_chemistry"));
  }

  if (parts.length === 0) {
    return t("compat.summary_default");
  }

  return t("compat.summary_template", { traits: parts.join(", ") });
}

function getTranslatedConflictInsight(insight: string, t: ReturnType<typeof useTranslations>): string {
  if (insight.includes("very different")) return t("compat.conflict_very_different");
  if (insight.includes("somewhat different")) return t("compat.conflict_somewhat_different");
  return t("compat.conflict_similar");
}

const STRENGTH_COLORS: Record<ExplanationStrength, string> = {
  very_strong: "bg-green-100 text-green-800 border-green-200",
  strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-yellow-50 text-yellow-700 border-yellow-200",
  weak: "bg-orange-50 text-orange-700 border-orange-200",
  mismatch: "bg-red-50 text-red-700 border-red-200",
};

const STRENGTH_KEY_MAP: Record<ExplanationStrength, string> = {
  very_strong: "strength_excellent",
  strong: "strength_strong",
  moderate: "strength_moderate",
  weak: "strength_weak",
  mismatch: "strength_mismatch",
};

interface StrengthBadgeProps {
  strength: ExplanationStrength;
  dimension: string;
}

function StrengthBadge({ strength, dimension }: StrengthBadgeProps) {
  const t = useTranslations();

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STRENGTH_COLORS[strength]}`}>
      {dimension}: {t(`compat.${STRENGTH_KEY_MAP[strength]}`)}
    </span>
  );
}

function MatchCard({ match }: { match: CompatibilityMatchResult }) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const scorePercent = Math.round(match.final_score * 100);
  const sharedEventCount = match.shared_event_count ?? 0;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold">
            {match.avatar_url ? (
              <img
                src={match.avatar_url}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span>
                {match.first_name[0]}
                {match.last_name[0]}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold leading-snug">
                  {match.first_name} {match.last_name}
                  {match.age ? `, ${match.age}` : ""}
                </h3>
                {match.city && (
                  <p className="text-muted-foreground text-sm mt-0.5">{match.city}</p>
                )}
              </div>
              <div className="text-end shrink-0">
                <div className="text-2xl font-bold leading-none">{scorePercent}%</div>
                <div className="text-muted-foreground text-[11px] mt-1">{t("compat.compatibility_label")}</div>
              </div>
            </div>

            {/* Dealbreaker & shared events badges */}
            {(match.dealbreakers_passed || sharedEventCount > 0) && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {match.dealbreakers_passed && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <ShieldCheck className="h-3 w-3" />
                    {t("compat.passes_dealbreakers")}
                  </span>
                )}
                {sharedEventCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    <CalendarCheck2 className="h-3 w-3" />
                    {sharedEventCount === 1
                      ? t("compat.shared_events", { count: sharedEventCount })
                      : t("compat.shared_events_plural", { count: sharedEventCount })}
                  </span>
                )}
              </div>
            )}

            {/* Explanation summary */}
            {match.explanation && (
              <p className="text-muted-foreground mt-2.5 text-sm">
                {getTranslatedSummary(match.explanation, t)}
              </p>
            )}

            {/* Strength badges */}
            {match.explanation && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <StrengthBadge dimension={t("compat.dim_family")} strength={match.explanation.family_alignment} />
                <StrengthBadge dimension={t("compat.dim_faith")} strength={match.explanation.faith_compatibility} />
                <StrengthBadge dimension={t("compat.dim_emotional")} strength={match.explanation.emotional_balance} />
                <StrengthBadge dimension={t("compat.dim_lifestyle")} strength={match.explanation.lifestyle_match} />
                <StrengthBadge dimension={t("compat.dim_ambition")} strength={match.explanation.ambition_alignment} />
                <StrengthBadge dimension={t("compat.dim_communication")} strength={match.explanation.communication_style} />
                {match.explanation.chemistry_signal === "positive" && (
                  <Badge variant="secondary" className="text-xs">
                    {t("compat.positive_chemistry")}
                  </Badge>
                )}
              </div>
            )}

            {/* Premium breakdown */}
            {match.premium_breakdown && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="mb-2 h-auto p-0 text-sm"
                >
                  {expanded ? t("compat.hide_breakdown") : t("compat.show_breakdown")}
                </Button>

                {expanded && (
                  <PremiumBreakdownView breakdown={match.premium_breakdown} />
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getProgressColorClass(value: number): string {
  if (value >= 75) return "[&_[data-slot=progress-indicator]]:bg-green-500";
  if (value >= 50) return "[&_[data-slot=progress-indicator]]:bg-amber-500";
  return "[&_[data-slot=progress-indicator]]:bg-red-500";
}

function StabilityBadge({
  level,
}: {
  level: PremiumCompatibilityBreakdown["long_term_stability_indicator"];
}) {
  const t = useTranslations();

  switch (level) {
    case "high":
      return (
        <span className="inline-flex items-center rounded-md border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          {t("compat.stability_high")}
        </span>
      );
    case "moderate":
      return (
        <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
          {t("compat.stability_moderate")}
        </span>
      );
    case "developing":
      return (
        <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
          {t("compat.stability_developing")}
        </span>
      );
  }
}

function PremiumBreakdownView({
  breakdown,
}: {
  breakdown: PremiumCompatibilityBreakdown;
}) {
  const t = useTranslations();

  const dimensions = [
    { label: t("compat.emotional_harmony"), value: breakdown.emotional_harmony },
    { label: t("compat.family_alignment"), value: breakdown.family_alignment },
    { label: t("compat.lifestyle_compatibility"), value: breakdown.lifestyle_compatibility },
    { label: t("compat.ambition_alignment"), value: breakdown.ambition_alignment },
    { label: t("compat.communication_match"), value: breakdown.communication_match },
  ];

  return (
    <div className="space-y-4 rounded-lg border p-4">
      {dimensions.map((d) => (
        <div key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{d.label}</span>
            <span className="font-medium">{d.value}%</span>
          </div>
          <Progress
            value={d.value}
            className={`h-2 ${getProgressColorClass(d.value)}`}
          />
        </div>
      ))}

      <p className="text-muted-foreground text-sm italic">
        {getTranslatedConflictInsight(breakdown.conflict_style_insight, t)}
      </p>

      <div className="flex items-center gap-2 text-sm">
        <span>{t("compat.long_term_stability")}</span>
        <StabilityBadge level={breakdown.long_term_stability_indicator} />
      </div>
    </div>
  );
}

export function MatchResultsList() {
  const t = useTranslations();
  const [matches, setMatches] = useState<CompatibilityMatchResult[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadMatches(pageNum: number) {
    setLoading(true);
    try {
      const result = await getCompatibilityMatches(pageNum);
      if (pageNum === 1) {
        setMatches(result.matches);
      } else {
        setMatches((prev) => [...prev, ...result.matches]);
      }
      setHasMore(result.has_more);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches(1);
  }, []);

  if (loading && matches.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("compat.loading_matches")}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("compat.no_matches_title")}</CardTitle>
          <CardDescription>
            {t("compat.no_matches_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/compatibility">{t("compat.complete_your_profile")}</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {total === 1
            ? t("compat.matches_found", { count: total })
            : t("compat.matches_found_plural", { count: total })}
        </p>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <MatchCard key={match.user_id} match={match} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              loadMatches(nextPage);
            }}
            disabled={loading}
          >
            {loading ? t("compat.loading") : t("compat.load_more")}
          </Button>
        </div>
      )}
    </div>
  );
}
