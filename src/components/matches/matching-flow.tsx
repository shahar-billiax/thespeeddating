"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ParticipantCard, type Participant } from "./participant-card";
import { ConnectionSelector } from "./connection-selector";
import { ContactSharingToggles, type ContactShares } from "./contact-sharing-toggles";
import { MatchQuestions, type MatchQuestion } from "./match-questions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Check, Clock, Loader2, Send, ArrowLeft } from "lucide-react";
import { saveDraftScore, submitFinalScores } from "@/lib/matches/actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Choice = "date" | "friend" | "no";

interface ScoreData {
  choice: Choice | null;
  shareEmail: boolean;
  sharePhone: boolean;
  shareWhatsapp: boolean;
  shareInstagram: boolean;
  shareFacebook: boolean;
  answers: Record<number, string>;
}

interface MatchingFlowProps {
  eventId: number;
  participants: Participant[];
  questions: MatchQuestion[];
  defaults: ContactShares;
  draftScores: Record<string, any> | null;
  deadline: string | null;
  vipChoices: Record<string, string> | null;
}

export function MatchingFlow({
  eventId,
  participants,
  questions,
  defaults,
  draftScores,
  deadline,
  vipChoices,
}: MatchingFlowProps) {
  const router = useRouter();
  const t = useTranslations("matches");

  // Track scores for all participants
  const [scores, setScores] = useState<Record<string, ScoreData>>(() => {
    const initial: Record<string, ScoreData> = {};
    for (const p of participants) {
      if (draftScores?.[p.id]) {
        initial[p.id] = draftScores[p.id];
      }
    }
    return initial;
  });

  // View state: null = grid, number = scoring detail view
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedParticipant = selectedIndex !== null ? participants[selectedIndex] : null;

  // A participant is "complete" only if they have a choice AND all required questions answered
  const requiredQuestions = questions.filter((q) => q.is_required);
  const isParticipantComplete = (pid: string) => {
    const s = scores[pid];
    if (!s || s.choice === null) return false;
    return requiredQuestions.every((q) => {
      const ans = s.answers[q.id];
      return ans !== undefined && ans !== "";
    });
  };

  const completedCount = participants.filter((p) => isParticipantComplete(p.id)).length;
  const allScored = completedCount === participants.length;
  const progressPercent = participants.length > 0 ? (completedCount / participants.length) * 100 : 0;

  // Current score for the selected participant
  const currentScore: ScoreData = selectedParticipant
    ? scores[selectedParticipant.id] ?? { choice: null, ...defaults, answers: {} }
    : { choice: null, ...defaults, answers: {} };

  // Check if current person has all required fields
  const requiredQuestionsFilled = questions
    .filter((q) => q.is_required)
    .every((q) => {
      const ans = currentScore.answers[q.id];
      return ans !== undefined && ans !== "";
    });
  const canSave = currentScore.choice !== null && requiredQuestionsFilled;

  // Update score for selected participant
  const updateScore = useCallback(
    (updates: Partial<ScoreData>) => {
      if (!selectedParticipant) return;
      setScores((prev) => ({
        ...prev,
        [selectedParticipant.id]: {
          ...(prev[selectedParticipant.id] ?? { choice: null, ...defaults, answers: {} }),
          ...updates,
        },
      }));
    },
    [selectedParticipant, defaults]
  );

  function setChoice(choice: Choice) {
    updateScore({ choice });
  }

  function setShare(field: keyof ContactShares, value: boolean) {
    updateScore({ [field]: value } as Partial<ScoreData>);
  }

  function setAnswer(questionId: number, answer: string) {
    updateScore({
      answers: { ...currentScore.answers, [questionId]: answer },
    });
  }

  // Helper: save a participant's score as draft
  async function saveDraft(participantId: string): Promise<boolean> {
    const score = scores[participantId];
    if (!score || score.choice === null) return true;

    const result = await saveDraftScore(
      eventId,
      participantId,
      score.choice,
      {
        shareEmail: score.shareEmail,
        sharePhone: score.sharePhone,
        shareWhatsapp: score.shareWhatsapp,
        shareInstagram: score.shareInstagram,
        shareFacebook: score.shareFacebook,
      },
      Object.entries(score.answers).map(([qId, ans]) => ({
        questionId: Number(qId),
        answer: String(ans),
      }))
    );

    if (result.error) {
      toast.error(result.error);
      return false;
    }
    return true;
  }

  // Save and go back to grid
  async function saveAndGoBack() {
    if (!selectedParticipant) return;
    if (canSave) {
      setSaving(true);
      const ok = await saveDraft(selectedParticipant.id);
      setSaving(false);
      if (!ok) return;
    }
    setSelectedIndex(null);
  }

  // Navigate to next/previous while saving current
  async function saveAndNavigate(direction: "next" | "prev") {
    if (!selectedParticipant || selectedIndex === null) return;

    if (currentScore.choice !== null) {
      setSaving(true);
      await saveDraft(selectedParticipant.id);
      setSaving(false);
    }

    if (direction === "next" && selectedIndex < participants.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (direction === "prev" && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }

  // Final submission
  async function handleFinalSubmit() {
    setSubmitting(true);

    // Save all unsaved scores first
    for (const p of participants) {
      const score = scores[p.id];
      if (score && score.choice !== null) {
        const ok = await saveDraft(p.id);
        if (!ok) {
          setSubmitting(false);
          setShowConfirm(false);
          return;
        }
      }
    }

    const result = await submitFinalScores(eventId);
    setSubmitting(false);
    setShowConfirm(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("submission_success"));
      router.push("/matches");
    }
  }

  // Deadline display
  const deadlineDate = deadline ? new Date(deadline) : null;
  const isDeadlineSoon =
    deadlineDate && deadlineDate.getTime() - Date.now() < 48 * 60 * 60 * 1000;

  // ─── Detail scoring view ────────────────────────────────────
  if (selectedIndex !== null && selectedParticipant) {
    const vipChoice = vipChoices?.[selectedParticipant.id] ?? null;

    return (
      <div className="animate-in fade-in duration-200">
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={saveAndGoBack}
            disabled={saving}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedIndex + 1} {t("of")} {participants.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => saveAndNavigate("prev")}
              disabled={selectedIndex === 0 || saving}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => saveAndNavigate("next")}
              disabled={selectedIndex === participants.length - 1 || saving}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Two-column on desktop, stacked on mobile */}
        <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start space-y-4 md:space-y-0">
          {/* Left: Profile */}
          <ParticipantCard participant={selectedParticipant} theirChoice={vipChoice} />

          {/* Right: Scoring controls */}
          <div className="space-y-4 md:sticky md:top-4">
            <ConnectionSelector value={currentScore.choice} onChange={setChoice} />

            {(currentScore.choice === "date" || currentScore.choice === "friend") && (
              <Card className="border-2 border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <CardContent className="pt-5 pb-4">
                  <ContactSharingToggles
                    shares={currentScore}
                    onChange={setShare}
                  />
                </CardContent>
              </Card>
            )}

            {questions.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <MatchQuestions
                    questions={questions}
                    answers={currentScore.answers}
                    onChange={setAnswer}
                  />
                </CardContent>
              </Card>
            )}

            {/* Save & back button */}
            <Button
              size="lg"
              className="w-full"
              onClick={saveAndGoBack}
              disabled={!canSave || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 me-2" />
                  {t("save_close")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Grid view (default) ────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Progress + deadline header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount} {t("of")} {participants.length} {t("scored")}
          </span>
          {deadlineDate && (
            <span
              className={cn(
                "text-xs inline-flex items-center gap-1",
                isDeadlineSoon ? "text-amber-600 font-medium" : "text-muted-foreground"
              )}
            >
              <Clock className="h-3 w-3" />
              {t("deadline")}: {deadlineDate.toLocaleDateString()}
            </span>
          )}
        </div>
        <Progress value={progressPercent} className="h-2" />
        {allScored && (
          <p className="text-sm text-green-600 font-medium text-center">
            {t("all_scored")}
          </p>
        )}
      </div>

      {/* Participant grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {participants.map((participant, index) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            compact
            choice={scores[participant.id]?.choice ?? null}
            complete={isParticipantComplete(participant.id)}
            theirChoice={vipChoices?.[participant.id] ?? null}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {/* Submit button */}
      <Button
        size="lg"
        className="w-full"
        disabled={!allScored || submitting}
        onClick={() => setShowConfirm(true)}
      >
        <Send className="h-4 w-4 me-2" />
        {t("review_submit")}
      </Button>

      {/* Confirmation dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("confirm_submission_title")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("confirm_submission_text")}
          </p>
          <div className="max-h-64 overflow-y-auto space-y-1 mt-2 border rounded-lg p-3">
            {participants.map((p) => {
              const s = scores[p.id];
              return (
                <div key={p.id} className="flex justify-between text-sm py-1">
                  <span>
                    {p.firstName} {p.lastName}
                  </span>
                  <span
                    className={cn(
                      "font-medium capitalize",
                      s?.choice === "date" && "text-pink-600",
                      s?.choice === "friend" && "text-blue-600",
                      s?.choice === "no" && "text-muted-foreground"
                    )}
                  >
                    {s?.choice ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {t("back")}
            </Button>
            <Button onClick={handleFinalSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 me-2" />
                  {t("submit_all")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
