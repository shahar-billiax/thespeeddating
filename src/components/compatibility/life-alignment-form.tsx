"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLifeAlignmentProfile } from "@/lib/compatibility/actions";
import type { ProfileLifeAlignmentInput } from "@/types/compatibility";

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

const PRACTICE_FREQ_KEYS = [
  { value: "daily", key: "freq_daily" },
  { value: "weekly", key: "freq_weekly" },
  { value: "occasionally", key: "freq_occasionally" },
  { value: "rarely", key: "freq_rarely" },
] as const;

const PROFESSION_KEYS = [
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

interface LifeAlignmentFormProps {
  initialData: any;
}

export function LifeAlignmentForm({ initialData }: LifeAlignmentFormProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const educationLabels = [
    "",
    t("compat.edu_high_school"),
    t("compat.edu_some_college"),
    t("compat.edu_bachelors"),
    t("compat.edu_masters"),
    t("compat.edu_doctorate"),
  ];

  const validFaithValues = RELIGION_KEYS.map((r) => r.value as string);

  const [form, setForm] = useState<ProfileLifeAlignmentInput>({
    faith: (initialData?.faith && validFaithValues.includes(initialData.faith))
      ? initialData.faith
      : null,
    religion_importance: initialData?.religion_importance ?? 3,
    practice_frequency: initialData?.practice_frequency ?? null,
    has_children: initialData?.has_children ?? null,
    wants_children: initialData?.wants_children ?? null,
    children_timeline: initialData?.children_timeline ?? null,
    career_ambition: initialData?.career_ambition ?? 3,
    work_life_philosophy: initialData?.work_life_philosophy ?? 3,
    education_level: initialData?.education_level ?? 3,
    profession_category: initialData?.profession_category ?? null,
    personal_description: initialData?.personal_description ?? null,
    partner_expectations: initialData?.partner_expectations ?? null,
    marriage_vision: initialData?.marriage_vision ?? null,
  });

  function handleSave() {
    // Show a hint for missing required fields but still allow partial saves
    const missing: string[] = [];
    if (!form.faith) missing.push(t("compat.field_faith"));
    if (!form.practice_frequency) missing.push(t("compat.field_practice_frequency"));
    if (!form.wants_children) missing.push(t("compat.field_wants_children"));
    setValidationError(missing.length > 0
      ? t("compat.required_fields_missing", { fields: missing.join(", ") })
      : null);

    setSaved(false);
    // Clear children_timeline when not applicable
    const dataToSave = {
      ...form,
      children_timeline: form.wants_children === "yes" ? form.children_timeline : null,
    };
    startTransition(async () => {
      await updateLifeAlignmentProfile(dataToSave);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="space-y-8">
      {/* Religion & Values */}
      <Card>
        <CardHeader>
          <CardTitle>{t("compat.religion_values")}</CardTitle>
          <CardDescription>{t("compat.religion_values_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  {PRACTICE_FREQ_KEYS.map((f) => (
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
              <span className="text-muted-foreground text-sm font-medium">
                {form.religion_importance ?? 3}/5
              </span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
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
          <CardTitle>{t("compat.family_children")}</CardTitle>
          <CardDescription>{t("compat.family_children_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          <CardTitle>{t("compat.education_career")}</CardTitle>
          <CardDescription>{t("compat.education_career_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("compat.education_level")}</Label>
                <span className="text-muted-foreground text-sm font-medium">
                  {educationLabels[form.education_level ?? 3]}
                </span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[form.education_level ?? 3]}
                onValueChange={([v]) => setForm({ ...form, education_level: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("compat.profession_category")}</Label>
              <Select
                value={form.profession_category ?? ""}
                onValueChange={(v) =>
                  setForm({ ...form, profession_category: v || null })
                }
              >
                <SelectTrigger><SelectValue placeholder={t("compat.select")} /></SelectTrigger>
                <SelectContent>
                  {PROFESSION_KEYS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {t(`compat.${p.key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("compat.career_ambition")}</Label>
              <span className="text-muted-foreground text-sm font-medium">{form.career_ambition ?? 3}/5</span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
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
              <span className="text-muted-foreground text-sm font-medium">{form.work_life_philosophy ?? 3}/5</span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
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

      {/* Free Text */}
      <Card>
        <CardHeader>
          <CardTitle>{t("compat.about_you")}</CardTitle>
          <CardDescription>
            {t("compat.about_you_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

      {/* Save */}
      <div className="space-y-2">
        {validationError && (
          <p className="text-sm text-amber-600">{validationError}</p>
        )}
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? t("compat.saving") : t("compat.save_life_alignment")}
          </Button>
          {saved && (
            <span className="text-sm text-green-600">{t("compat.saved")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
