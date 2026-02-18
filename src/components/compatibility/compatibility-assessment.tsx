"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { saveCompatibilityProfile } from "@/lib/compatibility/actions";
import { COMPAT_QUESTIONS, type CompatibilityProfileInput } from "@/types/compatibility";

interface CompatibilityAssessmentProps {
  initialData: any;
}

const CATEGORIES = ["emotional", "lifestyle", "ambition", "family", "communication"];

export function CompatibilityAssessment({ initialData }: CompatibilityAssessmentProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);

  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const q of COMPAT_QUESTIONS) {
      initial[q.key] = initialData?.[q.key] ?? 3;
    }
    return initial;
  });

  const currentQuestions = COMPAT_QUESTIONS.filter(
    (q) => q.category === CATEGORIES[currentCategory]
  );

  const answeredCount = Object.values(answers).filter((v) => v !== 3 || initialData).length;
  const progress = (answeredCount / 20) * 100;

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await saveCompatibilityProfile(answers as CompatibilityProfileInput);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("compat.section_of", { current: currentCategory + 1, total: CATEGORIES.length })}
          </span>
          <span className="text-muted-foreground">
            {t("compat.questions_count", { count: answeredCount })}
          </span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat, idx) => (
          <Button
            key={cat}
            variant={idx === currentCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentCategory(idx)}
          >
            {t(`compat.cat_${cat}`)}
          </Button>
        ))}
      </div>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>{t(`compat.cat_${CATEGORIES[currentCategory]}`)}</CardTitle>
          <CardDescription>{t(`compat.cat_${CATEGORIES[currentCategory]}_desc`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {currentQuestions.map((q, idx) => (
            <div key={q.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  {idx + 1}. {t(`compat.q_${q.key}`)}
                </Label>
                <span className="text-muted-foreground shrink-0 text-sm font-medium">
                  {answers[q.key]}/5
                </span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[answers[q.key]]}
                onValueChange={([v]) =>
                  setAnswers((prev) => ({ ...prev, [q.key]: v }))
                }
              />
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{t(`compat.q_${q.key}_low`)}</span>
                <span>{t(`compat.q_${q.key}_high`)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
          disabled={currentCategory === 0}
        >
          {t("compat.previous_section")}
        </Button>

        <div className="flex items-center gap-4">
          {saved && (
            <span className="text-sm text-green-600">{t("compat.saved_short")}</span>
          )}
          {currentCategory === CATEGORIES.length - 1 ? (
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? t("compat.saving") : t("compat.save_assessment")}
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentCategory(Math.min(CATEGORIES.length - 1, currentCategory + 1))
              }
            >
              {t("compat.next_section")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
