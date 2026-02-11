"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitScores } from "@/lib/matches/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Heart, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Choice = "date" | "friend" | "no" | null;

interface Score {
  scoredId: string;
  choice: Choice;
  shareEmail: boolean;
  sharePhone: boolean;
  shareWhatsapp: boolean;
  shareInstagram: boolean;
  shareFacebook: boolean;
}

export function ScoreForm({
  eventId,
  participants,
  defaults,
}: {
  eventId: number;
  participants: { id: string; firstName: string }[];
  defaults: {
    shareEmail: boolean;
    sharePhone: boolean;
    shareWhatsapp: boolean;
    shareInstagram: boolean;
    shareFacebook: boolean;
  };
}) {
  const router = useRouter();
  const [scores, setScores] = useState<Score[]>(
    participants.map((p) => ({
      scoredId: p.id,
      choice: null,
      ...defaults,
    }))
  );
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setChoice(index: number, choice: Choice) {
    setScores((prev) =>
      prev.map((s, i) => (i === index ? { ...s, choice } : s))
    );
  }

  function setShare(
    index: number,
    field: keyof Score,
    value: boolean
  ) {
    setScores((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  const allSelected = scores.every((s) => s.choice !== null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitScores(
      eventId,
      scores.map((s) => ({
        scoredId: s.scoredId,
        choice: s.choice!,
        shareEmail: s.shareEmail,
        sharePhone: s.sharePhone,
        shareWhatsapp: s.shareWhatsapp,
        shareInstagram: s.shareInstagram,
        shareFacebook: s.shareFacebook,
      }))
    );

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      setConfirming(false);
    } else {
      router.push("/matches");
    }
  }

  return (
    <>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {participants.map((person, index) => (
          <Card key={person.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-lg">{person.firstName}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={scores[index].choice === "date" ? "default" : "outline"}
                    className={cn(
                      scores[index].choice === "date" && "bg-pink-600 hover:bg-pink-700"
                    )}
                    onClick={() => setChoice(index, "date")}
                  >
                    <Heart className="h-4 w-4 me-1" />
                    Date
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={scores[index].choice === "friend" ? "default" : "outline"}
                    className={cn(
                      scores[index].choice === "friend" && "bg-blue-600 hover:bg-blue-700"
                    )}
                    onClick={() => setChoice(index, "friend")}
                  >
                    <Users className="h-4 w-4 me-1" />
                    Friend
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={scores[index].choice === "no" ? "default" : "outline"}
                    className={cn(
                      scores[index].choice === "no" && "bg-gray-600 hover:bg-gray-700"
                    )}
                    onClick={() => setChoice(index, "no")}
                  >
                    <X className="h-4 w-4 me-1" />
                    No
                  </Button>
                </div>
              </div>

              {(scores[index].choice === "date" ||
                scores[index].choice === "friend") && (
                <div className="border-t pt-3 mt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Share my contact info:
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {(
                      [
                        ["shareEmail", "Email"],
                        ["sharePhone", "Phone"],
                        ["shareWhatsapp", "WhatsApp"],
                        ["shareInstagram", "Instagram"],
                        ["shareFacebook", "Facebook"],
                      ] as const
                    ).map(([field, label]) => (
                      <div key={field} className="flex items-center gap-2">
                        <Checkbox
                          id={`${person.id}-${field}`}
                          checked={scores[index][field]}
                          onCheckedChange={(checked) =>
                            setShare(index, field, checked === true)
                          }
                        />
                        <Label
                          htmlFor={`${person.id}-${field}`}
                          className="text-sm"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Button
          size="lg"
          className="w-full"
          disabled={!allSelected}
          onClick={() => setConfirming(true)}
        >
          Submit All Choices
        </Button>
        {!allSelected && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            Please make a choice for every person before submitting
          </p>
        )}
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Choices</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You are about to submit your choices. This cannot be changed after
            submission. Are you sure?
          </p>
          <div className="space-y-1 mt-2">
            {participants.map((p, i) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span>{p.firstName}</span>
                <span className="font-medium capitalize">
                  {scores[i].choice}
                </span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
