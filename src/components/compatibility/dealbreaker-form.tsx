"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { saveDealbreakers } from "@/lib/compatibility/actions";
import type { DealbreakerPreferencesInput } from "@/types/compatibility";

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
];

interface DealbreakerFormProps {
  initialData: any;
}

export function DealbreakerForm({ initialData }: DealbreakerFormProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<DealbreakerPreferencesInput>({
    preferred_age_min: initialData?.preferred_age_min ?? 25,
    preferred_age_max: initialData?.preferred_age_max ?? 45,
    religion_must_match: initialData?.religion_must_match ?? false,
    acceptable_religions: initialData?.acceptable_religions ?? null,
    must_want_children: initialData?.must_want_children ?? false,
    min_education_level: initialData?.min_education_level ?? null,
  });

  const educationLabels = [
    "",
    t("compat.edu_high_school"),
    t("compat.edu_some_college"),
    t("compat.edu_bachelors"),
    t("compat.edu_masters"),
    t("compat.edu_doctorate"),
  ];

  function toggleReligion(religion: string) {
    const current = form.acceptable_religions ?? [];
    if (current.includes(religion)) {
      const next = current.filter((r) => r !== religion);
      setForm({ ...form, acceptable_religions: next.length > 0 ? next : null });
    } else {
      setForm({ ...form, acceptable_religions: [...current, religion] });
    }
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await saveDealbreakers(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("compat.dealbreaker_title")}</CardTitle>
          <CardDescription>{t("compat.dealbreaker_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Age Range */}
          <div className="space-y-4">
            <Label className="text-base font-medium">{t("compat.preferred_age_range")}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">{t("compat.minimum_age")}</Label>
                <Input
                  type="number"
                  min={18}
                  max={99}
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
                  min={18}
                  max={99}
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
                {form.min_education_level
                  ? educationLabels[form.min_education_level]
                  : t("compat.no_minimum")}
              </span>
            </div>
            <Slider
              min={0}
              max={5}
              step={1}
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

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? t("compat.saving") : t("compat.save_preferences")}
        </Button>
        {saved && (
          <span className="text-sm text-green-600">{t("compat.saved")}</span>
        )}
      </div>
    </div>
  );
}
