"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { submitEventFeedback, submitDateRating } from "@/lib/compatibility/actions";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  avatarUrl: string | null;
}

interface EventRatingFormProps {
  eventId: number;
  participants: Participant[];
  existingFeedback: any;
  existingRatings: any[];
}

export function EventRatingForm({
  eventId,
  participants,
  existingFeedback,
  existingRatings,
}: EventRatingFormProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"feedback" | "ratings" | "done">(
    existingFeedback ? "ratings" : "feedback"
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  // Event feedback state
  const [feedback, setFeedback] = useState({
    overall_satisfaction: existingFeedback?.overall_satisfaction ?? 3,
    met_aligned_people: existingFeedback?.met_aligned_people ?? false,
    would_attend_again: existingFeedback?.would_attend_again ?? true,
  });

  // Per-person ratings state
  const ratingsMap = new Map<string, any>();
  for (const r of existingRatings) {
    ratingsMap.set(r.to_user_id, r);
  }

  const [ratings, setRatings] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const p of participants) {
      const existing = ratingsMap.get(p.id);
      initial[p.id] = {
        would_meet_again: existing?.would_meet_again ?? false,
        conversation_quality: existing?.conversation_quality ?? 3,
        long_term_potential: existing?.long_term_potential ?? 3,
        physical_chemistry: existing?.physical_chemistry ?? 3,
        comfort_level: existing?.comfort_level ?? 3,
        values_alignment: existing?.values_alignment ?? 3,
        energy_compatibility: existing?.energy_compatibility ?? 3,
      };
    }
    return initial;
  });

  const ratingFields = [
    { key: "conversation_quality", label: t("compat.conversation_quality"), low: t("compat.conversation_quality_low"), high: t("compat.conversation_quality_high") },
    { key: "long_term_potential", label: t("compat.long_term_potential"), low: t("compat.long_term_potential_low"), high: t("compat.long_term_potential_high") },
    { key: "physical_chemistry", label: t("compat.physical_chemistry"), low: t("compat.physical_chemistry_low"), high: t("compat.physical_chemistry_high") },
    { key: "comfort_level", label: t("compat.comfort_level"), low: t("compat.comfort_level_low"), high: t("compat.comfort_level_high") },
    { key: "values_alignment", label: t("compat.values_alignment"), low: t("compat.values_alignment_low"), high: t("compat.values_alignment_high") },
    { key: "energy_compatibility", label: t("compat.energy_compatibility"), low: t("compat.energy_compatibility_low"), high: t("compat.energy_compatibility_high") },
  ];

  function handleSubmitFeedback() {
    startTransition(async () => {
      await submitEventFeedback({
        event_id: eventId,
        ...feedback,
      });
      setStep("ratings");
    });
  }

  function handleSubmitRating(participantId: string) {
    setSaved(false);
    startTransition(async () => {
      await submitDateRating({
        event_id: eventId,
        to_user_id: participantId,
        ...ratings[participantId],
      });
      setSaved(true);

      // Move to next participant or done
      if (currentIdx < participants.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSaved(false);
      } else {
        setStep("done");
      }
    });
  }

  // Event feedback step
  if (step === "feedback") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("compat.event_feedback")}</CardTitle>
          <CardDescription>
            {t("compat.event_feedback_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("compat.overall_satisfaction")}</Label>
              <span className="text-muted-foreground text-sm">{feedback.overall_satisfaction}/5</span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[feedback.overall_satisfaction]}
              onValueChange={([v]) =>
                setFeedback({ ...feedback, overall_satisfaction: v })
              }
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{t("compat.poor")}</span>
              <span>{t("compat.excellent")}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>{t("compat.met_aligned")}</Label>
            <Switch
              checked={feedback.met_aligned_people}
              onCheckedChange={(v) =>
                setFeedback({ ...feedback, met_aligned_people: v })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>{t("compat.attend_again")}</Label>
            <Switch
              checked={feedback.would_attend_again}
              onCheckedChange={(v) =>
                setFeedback({ ...feedback, would_attend_again: v })
              }
            />
          </div>

          <Button onClick={handleSubmitFeedback} disabled={isPending} className="w-full">
            {isPending ? t("compat.saving") : t("compat.continue_ratings")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Done step
  if (step === "done") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("compat.all_done")}</CardTitle>
          <CardDescription>
            {t("compat.all_done_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("compat.rated_all", { count: participants.length })}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Per-person rating step
  const participant = participants[currentIdx];
  const rating = ratings[participant.id];

  const participantName = `${participant.firstName} ${participant.lastName}${participant.age ? `, ${participant.age}` : ""}`;

  function getSubmitButtonLabel(): string {
    if (isPending) {
      return t("compat.saving");
    }
    if (currentIdx === participants.length - 1) {
      return t("compat.submit_all_ratings");
    }
    return t("compat.save_next");
  }

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          {t("compat.rating_of", { current: currentIdx + 1, total: participants.length })}
        </span>
        <span>{t("compat.percent_complete", { percent: Math.round(((currentIdx) / participants.length) * 100) })}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("compat.rate_date_with", { name: participantName })}
          </CardTitle>
          <CardDescription>
            {t("compat.rate_experience_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Would meet again */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-base font-medium">
                {t("compat.would_meet_again")}
              </Label>
              <p className="text-muted-foreground text-sm">
                {t("compat.would_meet_again_note")}
              </p>
            </div>
            <Switch
              checked={rating.would_meet_again}
              onCheckedChange={(v) =>
                setRatings({
                  ...ratings,
                  [participant.id]: { ...rating, would_meet_again: v },
                })
              }
            />
          </div>

          {/* Rating sliders */}
          {ratingFields.map((field) => (
            <div key={field.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{field.label}</Label>
                <span className="text-muted-foreground text-sm">
                  {rating[field.key]}/5
                </span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[rating[field.key]]}
                onValueChange={([v]) =>
                  setRatings({
                    ...ratings,
                    [participant.id]: { ...rating, [field.key]: v },
                  })
                }
              />
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{field.low}</span>
                <span>{field.high}</span>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0 || isPending}
            >
              {t("compat.previous")}
            </Button>
            <Button
              onClick={() => handleSubmitRating(participant.id)}
              disabled={isPending}
            >
              {getSubmitButtonLabel()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
