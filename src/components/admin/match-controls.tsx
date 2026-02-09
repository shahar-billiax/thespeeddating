"use client";

import { useState } from "react";
import {
  toggleMatchSubmission,
  toggleMatchResults,
  computeMatches,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function MatchControls({
  eventId,
  matchSubmissionOpen,
  matchResultsReleased,
  isPast,
}: {
  eventId: number;
  matchSubmissionOpen: boolean;
  matchResultsReleased: boolean;
  isPast: boolean;
}) {
  const [submissionOpen, setSubmissionOpen] = useState(matchSubmissionOpen);
  const [resultsReleased, setResultsReleased] = useState(matchResultsReleased);
  const [computing, setComputing] = useState(false);

  async function handleToggleSubmission(open: boolean) {
    const result = await toggleMatchSubmission(eventId, open);
    if (!result.error) setSubmissionOpen(open);
  }

  async function handleToggleResults(released: boolean) {
    const result = await toggleMatchResults(eventId, released);
    if (!result.error) setResultsReleased(released);
  }

  async function handleCompute() {
    setComputing(true);
    await computeMatches(eventId);
    setComputing(false);
  }

  if (!isPast) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Match controls are available after the event date has passed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Match Scoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Score Submission</Label>
              <p className="text-sm text-muted-foreground">
                Allow participants to submit their choices
              </p>
            </div>
            <Switch
              checked={submissionOpen}
              onCheckedChange={handleToggleSubmission}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Results Released</Label>
              <p className="text-sm text-muted-foreground">
                Make match results visible to participants
              </p>
            </div>
            <Switch
              checked={resultsReleased}
              onCheckedChange={handleToggleResults}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCompute} disabled={computing}>
            {computing ? "Computing..." : "Compute Matches"}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Re-runs the matching algorithm based on all submitted scores.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
