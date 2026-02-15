"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useTranslations } from "next-intl";

export interface MatchQuestion {
  id: number;
  question_text: string;
  question_type: "multiple_choice" | "yes_no" | "rating";
  options: string[] | null;
  is_required: boolean;
}

export function MatchQuestions({
  questions,
  answers,
  onChange,
}: {
  questions: MatchQuestion[];
  answers: Record<number, string>;
  onChange: (questionId: number, answer: string) => void;
}) {
  const t = useTranslations("matches");

  if (questions.length === 0) return null;

  return (
    <div className="space-y-5">
      <p className="text-sm font-medium text-muted-foreground">
        {t("additional_questions")}
      </p>

      {questions.map((q) => (
        <div key={q.id} className="space-y-2.5">
          <Label className="text-sm leading-snug">
            {q.question_text}
            {q.is_required && <span className="text-destructive ms-0.5">*</span>}
          </Label>

          {q.question_type === "yes_no" && (
            <RadioGroup
              value={answers[q.id] ?? ""}
              onValueChange={(value) => onChange(q.id, value)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id={`q${q.id}-yes`} />
                <Label htmlFor={`q${q.id}-yes`} className="cursor-pointer text-sm font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id={`q${q.id}-no`} />
                <Label htmlFor={`q${q.id}-no`} className="cursor-pointer text-sm font-normal">
                  No
                </Label>
              </div>
            </RadioGroup>
          )}

          {q.question_type === "multiple_choice" && q.options && (
            <RadioGroup
              value={answers[q.id] ?? ""}
              onValueChange={(value) => onChange(q.id, value)}
              className="space-y-1.5"
            >
              {q.options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <RadioGroupItem value={option} id={`q${q.id}-opt${i}`} />
                  <Label htmlFor={`q${q.id}-opt${i}`} className="cursor-pointer text-sm font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {q.question_type === "rating" && (
            <div className="space-y-2 pt-1">
              <Slider
                value={[Number(answers[q.id] ?? "5")]}
                onValueChange={(value) => onChange(q.id, String(value[0]))}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span className="font-medium text-foreground">
                  {answers[q.id] ?? "5"} / 10
                </span>
                <span>10</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
