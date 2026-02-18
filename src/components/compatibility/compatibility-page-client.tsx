"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LifeAlignmentForm } from "./life-alignment-form";
import { CompatibilityAssessment } from "./compatibility-assessment";
import { DealbreakerForm } from "./dealbreaker-form";
import { MatchResultsList } from "./match-results";

interface CompatibilityPageClientProps {
  profile: any;
  compatProfile: any;
  dealbreakers: any;
}

export function CompatibilityPageClient({
  profile,
  compatProfile,
  dealbreakers,
}: CompatibilityPageClientProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();

  // Determine completion status — 7 core required fields, all must be filled
  const lifeFields = [
    profile.faith,
    profile.religion_importance,
    profile.practice_frequency,
    profile.wants_children,
    profile.career_ambition,
    profile.work_life_philosophy,
    profile.education_level,
  ];
  const lifeComplete = lifeFields.filter((f: any) => f != null && f !== "").length >= 7;
  const assessmentComplete = !!compatProfile;
  const prefsComplete = !!dealbreakers;

  const stepsCompleted = [lifeComplete, assessmentComplete, prefsComplete].filter(Boolean).length;
  const overallProgress = Math.round((stepsCompleted / 3) * 100);

  // Determine default tab — auto-focus the next incomplete step, or matches if all done
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam ?? getDefaultTab(lifeComplete, assessmentComplete, prefsComplete);

  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="space-y-8">
      {/* Overall progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t("compat.profile_completion")}</span>
              <span className="text-muted-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StepIndicator
              step={1}
              title={t("compat.life_alignment")}
              complete={lifeComplete}
              description={t("compat.life_alignment_desc")}
              onClick={() => setActiveTab("life")}
              active={activeTab === "life"}
              completeLabel={t("compat.complete")}
              incompleteLabel={t("compat.incomplete")}
            />
            <StepIndicator
              step={2}
              title={t("compat.assessment")}
              complete={assessmentComplete}
              description={t("compat.assessment_desc")}
              onClick={() => setActiveTab("assessment")}
              active={activeTab === "assessment"}
              completeLabel={t("compat.complete")}
              incompleteLabel={t("compat.incomplete")}
            />
            <StepIndicator
              step={3}
              title={t("compat.dealbreaker_prefs")}
              complete={prefsComplete}
              description={t("compat.dealbreaker_prefs_desc")}
              onClick={() => setActiveTab("preferences")}
              active={activeTab === "preferences"}
              completeLabel={t("compat.complete")}
              incompleteLabel={t("compat.incomplete")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabbed content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="life">
            {t("compat.life_alignment")}
            {lifeComplete && <span className="ms-1 text-green-600">&#10003;</span>}
          </TabsTrigger>
          <TabsTrigger value="assessment">
            {t("compat.assessment")}
            {assessmentComplete && <span className="ms-1 text-green-600">&#10003;</span>}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            {t("compat.preferences")}
            {prefsComplete && <span className="ms-1 text-green-600">&#10003;</span>}
          </TabsTrigger>
          <TabsTrigger value="matches">
            {t("compat.my_matches")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="life" className="mt-6">
          <LifeAlignmentForm initialData={profile} />
          {!assessmentComplete && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setActiveTab("assessment")}
                className="text-primary text-sm font-medium hover:underline"
              >
                {t("compat.continue_to_assessment")} &rarr;
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assessment" className="mt-6">
          <CompatibilityAssessment initialData={compatProfile} />
          {!prefsComplete && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setActiveTab("preferences")}
                className="text-primary text-sm font-medium hover:underline"
              >
                {t("compat.continue_to_preferences")} &rarr;
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <DealbreakerForm initialData={dealbreakers} />
          {lifeComplete && assessmentComplete && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setActiveTab("matches")}
                className="text-primary text-sm font-medium hover:underline"
              >
                {t("compat.view_your_matches")} &rarr;
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="mt-6">
          {lifeComplete && assessmentComplete ? (
            <MatchResultsList />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t("compat.complete_first_title")}</CardTitle>
                <CardDescription>
                  {t("compat.complete_first_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {!lifeComplete && (
                    <p className="text-muted-foreground text-sm">
                      &#x2022; {t("compat.complete_life_req")}
                    </p>
                  )}
                  {!assessmentComplete && (
                    <p className="text-muted-foreground text-sm">
                      &#x2022; {t("compat.complete_assessment_req")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab(!lifeComplete ? "life" : "assessment")}
                  className="text-primary mt-4 text-sm font-medium hover:underline"
                >
                  {!lifeComplete ? t("compat.start_life_alignment") : t("compat.start_assessment")} &rarr;
                </button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getDefaultTab(
  lifeComplete: boolean,
  assessmentComplete: boolean,
  prefsComplete: boolean,
): string {
  if (!lifeComplete) return "life";
  if (!assessmentComplete) return "assessment";
  if (!prefsComplete) return "preferences";
  return "matches";
}

function StepIndicator({
  step,
  title,
  complete,
  description,
  onClick,
  active,
  completeLabel,
  incompleteLabel,
}: {
  step: number;
  title: string;
  complete: boolean;
  description: string;
  onClick: () => void;
  active: boolean;
  completeLabel: string;
  incompleteLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg p-2 text-start transition-colors ${
        active ? "bg-muted" : "hover:bg-muted/50"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          complete
            ? "bg-green-100 text-green-800"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {complete ? "\u2713" : step}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
        <Badge variant={complete ? "default" : "outline"} className="mt-1">
          {complete ? completeLabel : incompleteLabel}
        </Badge>
      </div>
    </button>
  );
}
