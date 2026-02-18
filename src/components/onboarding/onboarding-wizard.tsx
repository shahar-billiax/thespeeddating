"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import {
  updateLifeAlignmentProfile,
  saveCompatibilityProfile,
  saveDealbreakers,
} from "@/lib/compatibility/actions";
import {
  COMPAT_QUESTIONS,
  type CompatibilityProfileInput,
  type ProfileLifeAlignmentInput,
  type DealbreakerPreferencesInput,
} from "@/types/compatibility";

// ─── Constants ──────────────────────────────────────────────────────

const RELIGION_KEYS = [
  { value: "Jewish - Orthodox", key: "rel_jewish_orthodox" },
  { value: "Jewish - Conservative", key: "rel_jewish_conservative" },
  { value: "Jewish - Reform", key: "rel_jewish_reform" },
  { value: "Jewish - Traditional", key: "rel_jewish_traditional" },
  { value: "Jewish - Secular", key: "rel_jewish_secular" },
  { value: "Christian", key: "rel_christian" },
  { value: "Muslim", key: "rel_muslim" },
  { value: "Buddhist", key: "rel_buddhist" },
  { value: "Hindu", key: "rel_hindu" },
  { value: "Spiritual", key: "rel_spiritual" },
  { value: "Not religious", key: "rel_not_religious" },
  { value: "Other", key: "rel_other" },
] as const;

const PRACTICE_FREQUENCY_KEYS = [
  { value: "daily", key: "freq_daily" },
  { value: "weekly", key: "freq_weekly" },
  { value: "occasionally", key: "freq_occasionally" },
  { value: "rarely", key: "freq_rarely" },
] as const;

const PROFESSION_CATEGORY_KEYS = [
  { value: "Technology", key: "prof_technology" },
  { value: "Finance", key: "prof_finance" },
  { value: "Healthcare", key: "prof_healthcare" },
  { value: "Education", key: "prof_education" },
  { value: "Law", key: "prof_law" },
  { value: "Arts & Media", key: "prof_arts_media" },
  { value: "Business", key: "prof_business" },
  { value: "Government", key: "prof_government" },
  { value: "Non-profit", key: "prof_nonprofit" },
  { value: "Science", key: "prof_science" },
  { value: "Trades", key: "prof_trades" },
  { value: "Other", key: "prof_other" },
] as const;

const EDUCATION_KEYS = [
  "",
  "edu_high_school",
  "edu_some_college",
  "edu_bachelors",
  "edu_masters",
  "edu_doctorate",
] as const;

const CATEGORIES = ["emotional", "lifestyle", "ambition", "family", "communication"] as const;

// ─── Props ──────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  profile: any;
  compatProfile: any;
  dealbreakers: any;
}

// ─── Main Component ─────────────────────────────────────────────────

export function OnboardingWizard({ profile, compatProfile, dealbreakers }: OnboardingWizardProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  // Determine initial step based on existing data
  const initialStep = getInitialStep(profile, compatProfile, dealbreakers);
  const [step, setStep] = useState(initialStep);
  const [error, setError] = useState<string | null>(null);

  const stepLabels = [
    t("compat.step_life_alignment"),
    t("compat.step_personality"),
    t("compat.step_dealbreakers"),
    t("compat.step_about_you"),
  ];

  // Step 1: Life Alignment
  const [lifeForm, setLifeForm] = useState<ProfileLifeAlignmentInput>({
    faith: profile?.faith ?? null,
    religion_importance: profile?.religion_importance ?? 3,
    practice_frequency: profile?.practice_frequency ?? null,
    has_children: profile?.has_children ?? null,
    wants_children: profile?.wants_children ?? null,
    children_timeline: profile?.children_timeline ?? null,
    career_ambition: profile?.career_ambition ?? 3,
    work_life_philosophy: profile?.work_life_philosophy ?? 3,
    education_level: profile?.education_level ?? 3,
    profession_category: profile?.profession_category ?? null,
    personal_description: profile?.personal_description ?? null,
    partner_expectations: profile?.partner_expectations ?? null,
    marriage_vision: profile?.marriage_vision ?? null,
  });

  // Step 2: Compatibility Assessment
  const [assessmentCategory, setAssessmentCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const q of COMPAT_QUESTIONS) {
      initial[q.key] = compatProfile?.[q.key] ?? 3;
    }
    return initial;
  });

  // Step 3: Dealbreakers
  const [dealbreakerForm, setDealbreakerForm] = useState<DealbreakerPreferencesInput>({
    preferred_age_min: dealbreakers?.preferred_age_min ?? 25,
    preferred_age_max: dealbreakers?.preferred_age_max ?? 45,
    religion_must_match: dealbreakers?.religion_must_match ?? false,
    acceptable_religions: dealbreakers?.acceptable_religions ?? null,
    must_want_children: dealbreakers?.must_want_children ?? false,
    min_education_level: dealbreakers?.min_education_level ?? null,
  });

  // Step 4: About You (uses lifeForm fields)

  const overallProgress = step >= 4 ? 100 : ((step + 1) / 4) * 100;

  // Success screen
  if (step === 4) {
    return (
      <div className="space-y-8 text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">{t("compat.profile_complete_title")}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("compat.profile_complete_desc")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button size="lg" onClick={() => router.push("/compatibility?tab=matches")} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {t("compat.see_your_matches")}
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push("/events")} className="gap-2">
            {t("compat.browse_events")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  function saveAndNext() {
    setError(null);
    startTransition(async () => {
      try {
        if (step === 0) {
          await updateLifeAlignmentProfile(lifeForm);
          setStep(1);
        } else if (step === 1) {
          await saveCompatibilityProfile(answers as CompatibilityProfileInput);
          setStep(2);
        } else if (step === 2) {
          await saveDealbreakers(dealbreakerForm);
          setStep(3);
        } else if (step === 3) {
          // Save free text fields (they're part of lifeForm)
          await updateLifeAlignmentProfile(lifeForm);
          setStep(4); // Show success screen
        }
      } catch {
        setError(t("compat.something_went_wrong"));
      }
    });
  }

  function getButtonLabel(): string {
    if (isPending) return t("compat.saving");
    if (step === 3) return t("compat.complete_profile_btn");
    return t("compat.save_continue");
  }

  return (
    <div className="space-y-8">
      {/* Progress header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t("compat.step_of", { current: step + 1, total: 4 })}</span>
          <span className="text-muted-foreground">{stepLabels[step]}</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        <div className="flex justify-between">
          {stepLabels.map((label, idx) => (
            <button
              key={label}
              className={`text-xs transition-colors ${
                idx <= step
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              } ${idx < step ? "cursor-pointer hover:underline" : "cursor-default"}`}
              onClick={() => idx < step && setStep(idx)}
              disabled={idx >= step}
            >
              {idx < step ? "\u2713 " : ""}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      {step === 0 && (
        <StepLifeAlignment form={lifeForm} setForm={setLifeForm} />
      )}
      {step === 1 && (
        <StepAssessment
          answers={answers}
          setAnswers={setAnswers}
          category={assessmentCategory}
          setCategory={setAssessmentCategory}
          hasExisting={!!compatProfile}
        />
      )}
      {step === 2 && (
        <StepDealbreakers form={dealbreakerForm} setForm={setDealbreakerForm} />
      )}
      {step === 3 && (
        <StepAboutYou form={lifeForm} setForm={setLifeForm} />
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <div>
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isPending}>
              {t("compat.previous")}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step < 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step + 1)}
              disabled={isPending}
              className="text-muted-foreground"
            >
              {t("compat.skip_for_now")}
            </Button>
          )}
          <Button onClick={saveAndNext} disabled={isPending}>
            {getButtonLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

function getInitialStep(profile: any, compatProfile: any, dealbreakers: any): number {
  const lifeFields = [
    profile?.faith,
    profile?.religion_importance,
    profile?.wants_children,
    profile?.career_ambition,
    profile?.education_level,
  ];
  const lifeComplete = lifeFields.filter((f: any) => f != null && f !== "").length >= 3;

  if (!lifeComplete) return 0;
  if (!compatProfile) return 1;
  if (!dealbreakers) return 2;
  return 3;
}

// ─── Step 1: Life Alignment ─────────────────────────────────────────

function StepLifeAlignment({
  form,
  setForm,
}: {
  form: ProfileLifeAlignmentInput;
  setForm: (f: ProfileLifeAlignmentInput) => void;
}) {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        {t("compat.life_goals_intro")}
      </p>

      {/* Religion & Values */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("compat.religion_values")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("compat.religion")}</Label>
              <Select
                value={form.faith ?? ""}
                onValueChange={(v) => setForm({ ...form, faith: v || null })}
              >
                <SelectTrigger><SelectValue placeholder={t("compat.select")} /></SelectTrigger>
                <SelectContent>
                  {RELIGION_KEYS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {t(`compat.${r.key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("compat.practice_frequency")}</Label>
              <Select
                value={form.practice_frequency ?? ""}
                onValueChange={(v) =>
                  setForm({ ...form, practice_frequency: (v || null) as any })
                }
              >
                <SelectTrigger><SelectValue placeholder={t("compat.select")} /></SelectTrigger>
                <SelectContent>
                  {PRACTICE_FREQUENCY_KEYS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {t(`compat.${f.key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("compat.religion_importance")}</Label>
              <span className="text-muted-foreground text-sm">{form.religion_importance ?? 3}/5</span>
            </div>
            <Slider
              min={1} max={5} step={1}
              value={[form.religion_importance ?? 3]}
              onValueChange={([v]) => setForm({ ...form, religion_importance: v })}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{t("compat.not_important")}</span>
              <span>{t("compat.very_important")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family & Children */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("compat.family_children")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("compat.has_children")}</Label>
              <Select
                value={form.has_children === true ? "yes" : form.has_children === false ? "no" : ""}
                onValueChange={(v) =>
                  setForm({ ...form, has_children: v === "yes" ? true : v === "no" ? false : null })
                }
              >
                <SelectTrigger><SelectValue placeholder={t("compat.select")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">{t("compat.yes")}</SelectItem>
                  <SelectItem value="no">{t("compat.no")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("compat.wants_children")}</Label>
              <Select
                value={form.wants_children ?? ""}
                onValueChange={(v) =>
                  setForm({ ...form, wants_children: (v || null) as any })
                }
              >
                <SelectTrigger><SelectValue placeholder={t("compat.select")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">{t("compat.yes")}</SelectItem>
                  <SelectItem value="no">{t("compat.no")}</SelectItem>
                  <SelectItem value="open">{t("compat.open_to_it")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.wants_children === "yes" && (
            <div className="space-y-2">
              <Label>{t("compat.children_timeline")}</Label>
              <Select
                value={form.children_timeline ?? ""}
                onValueChange={(v) =>
                  setForm({ ...form, children_timeline: (v || null) as any })
                }
              >
                <SelectTrigger><SelectValue placeholder={t("compat.select")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="soon">{t("compat.soon")}</SelectItem>
                  <SelectItem value="2_3_years">{t("compat.two_three_years")}</SelectItem>
                  <SelectItem value="flexible">{t("compat.flexible")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education & Career */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("compat.education_career")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("compat.education_level")}</Label>
                <span className="text-muted-foreground text-sm">
                  {EDUCATION_KEYS[form.education_level ?? 3]
                    ? t(`compat.${EDUCATION_KEYS[form.education_level ?? 3]}`)
                    : ""}
                </span>
              </div>
              <Slider
                min={1} max={5} step={1}
                value={[form.education_level ?? 3]}
                onValueChange={([v]) => setForm({ ...form, education_level: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("compat.profession_category")}</Label>
              <Select
                value={form.profession_category ?? ""}
                onValueChange={(v) => setForm({ ...form, profession_category: v || null })}
              >
                <SelectTrigger><SelectValue placeholder={t("compat.select")} /></SelectTrigger>
                <SelectContent>
                  {PROFESSION_CATEGORY_KEYS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {t(`compat.${c.key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("compat.career_ambition")}</Label>
              <span className="text-muted-foreground text-sm">{form.career_ambition ?? 3}/5</span>
            </div>
            <Slider
              min={1} max={5} step={1}
              value={[form.career_ambition ?? 3]}
              onValueChange={([v]) => setForm({ ...form, career_ambition: v })}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{t("compat.stable_content")}</span>
              <span>{t("compat.highly_ambitious")}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("compat.work_life")}</Label>
              <span className="text-muted-foreground text-sm">{form.work_life_philosophy ?? 3}/5</span>
            </div>
            <Slider
              min={1} max={5} step={1}
              value={[form.work_life_philosophy ?? 3]}
              onValueChange={([v]) => setForm({ ...form, work_life_philosophy: v })}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{t("compat.family_first")}</span>
              <span>{t("compat.career_first")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Step 2: Assessment ─────────────────────────────────────────────

function StepAssessment({
  answers,
  setAnswers,
  category,
  setCategory,
  hasExisting,
}: {
  answers: Record<string, number>;
  setAnswers: (fn: (prev: Record<string, number>) => Record<string, number>) => void;
  category: number;
  setCategory: (c: number) => void;
  hasExisting: boolean;
}) {
  const t = useTranslations();

  const currentQuestions = COMPAT_QUESTIONS.filter(
    (q) => q.category === CATEGORIES[category]
  );
  const cat = CATEGORIES[category];

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        {t("compat.assessment_intro")}
      </p>

      {/* Section progress */}
      <div className="flex items-center gap-2">
        {CATEGORIES.map((c, idx) => (
          <button
            key={c}
            onClick={() => setCategory(idx)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              idx === category
                ? "bg-primary text-primary-foreground"
                : idx < category
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <span className="text-muted-foreground ms-2 text-sm">
          {t(`compat.cat_${cat}`)}
        </span>
      </div>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t(`compat.cat_${cat}`)}</CardTitle>
          <CardDescription>{t(`compat.cat_${cat}_desc`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {currentQuestions.map((q, idx) => (
            <div key={q.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  {category * 4 + idx + 1}. {t(`compat.q_${q.key}`)}
                </Label>
                <span className="text-muted-foreground shrink-0 text-sm">
                  {answers[q.key]}/5
                </span>
              </div>
              <Slider
                min={1} max={5} step={1}
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

      {/* Section navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategory(Math.max(0, category - 1))}
          disabled={category === 0}
        >
          {t("compat.previous_section")}
        </Button>
        {category < CATEGORIES.length - 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategory(category + 1)}
          >
            {t("compat.next_section")}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Dealbreakers ───────────────────────────────────────────

function StepDealbreakers({
  form,
  setForm,
}: {
  form: DealbreakerPreferencesInput;
  setForm: (f: DealbreakerPreferencesInput) => void;
}) {
  const t = useTranslations();

  function toggleReligion(religion: string) {
    const current = form.acceptable_religions ?? [];
    if (current.includes(religion)) {
      const next = current.filter((r) => r !== religion);
      setForm({ ...form, acceptable_religions: next.length > 0 ? next : null });
    } else {
      setForm({ ...form, acceptable_religions: [...current, religion] });
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        {t("compat.dealbreaker_intro")}
      </p>

      <Card>
        <CardContent className="space-y-8 pt-6">
          {/* Age Range */}
          <div className="space-y-4">
            <Label className="text-base font-medium">{t("compat.preferred_age_range")}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">{t("compat.minimum_age")}</Label>
                <Input
                  type="number"
                  min={18} max={99}
                  value={form.preferred_age_min ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preferred_age_min: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">{t("compat.maximum_age")}</Label>
                <Input
                  type="number"
                  min={18} max={99}
                  value={form.preferred_age_max ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preferred_age_max: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Religion */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">{t("compat.religion_must_match")}</Label>
                <p className="text-muted-foreground text-sm">
                  {t("compat.religion_must_match_desc")}
                </p>
              </div>
              <Switch
                checked={form.religion_must_match}
                onCheckedChange={(v) => setForm({ ...form, religion_must_match: v })}
              />
            </div>
            {form.religion_must_match && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">
                  {t("compat.acceptable_religions")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {RELIGION_KEYS.map((r) => {
                    const selected = (form.acceptable_religions ?? []).includes(r.value);
                    return (
                      <Badge
                        key={r.value}
                        variant={selected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleReligion(r.value)}
                      >
                        {t(`compat.${r.key}`)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">{t("compat.must_want_children")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("compat.must_want_children_desc")}
              </p>
            </div>
            <Switch
              checked={form.must_want_children}
              onCheckedChange={(v) => setForm({ ...form, must_want_children: v })}
            />
          </div>

          {/* Education */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">{t("compat.min_education")}</Label>
              <span className="text-muted-foreground text-sm">
                {form.min_education_level && EDUCATION_KEYS[form.min_education_level]
                  ? t(`compat.${EDUCATION_KEYS[form.min_education_level]}`)
                  : t("compat.no_minimum")}
              </span>
            </div>
            <Slider
              min={0} max={5} step={1}
              value={[form.min_education_level ?? 0]}
              onValueChange={([v]) =>
                setForm({ ...form, min_education_level: v === 0 ? null : v })
              }
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{t("compat.no_minimum")}</span>
              <span>{t("compat.edu_doctorate")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Step 4: About You ──────────────────────────────────────────────

function StepAboutYou({
  form,
  setForm,
}: {
  form: ProfileLifeAlignmentInput;
  setForm: (f: ProfileLifeAlignmentInput) => void;
}) {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        {t("compat.about_you_optional")}
      </p>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label>{t("compat.describe_yourself")}</Label>
            <Textarea
              value={form.personal_description ?? ""}
              onChange={(e) => setForm({ ...form, personal_description: e.target.value || null })}
              rows={4}
              placeholder={t("compat.describe_yourself_placeholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("compat.partner_expectations")}</Label>
            <Textarea
              value={form.partner_expectations ?? ""}
              onChange={(e) => setForm({ ...form, partner_expectations: e.target.value || null })}
              rows={4}
              placeholder={t("compat.partner_expectations_placeholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("compat.marriage_vision")}</Label>
            <Textarea
              value={form.marriage_vision ?? ""}
              onChange={(e) => setForm({ ...form, marriage_vision: e.target.value || null })}
              rows={4}
              placeholder={t("compat.marriage_vision_placeholder")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
