"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { submitMatchmakingApplication } from "@/lib/matchmaking/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function MatchmakingForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitMatchmakingApplication(formData);

    if (result.success) {
      toast.success(t("matchmaking.submitted"));
      router.push("/profile");
    } else {
      toast.error(result.error || "Submission failed");
    }

    setIsSubmitting(false);
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="about_yourself">{t("matchmaking.about_you")}</Label>
          <Textarea
            id="about_yourself"
            name="about_yourself"
            required
            rows={5}
            placeholder={t("matchmaking.about_you")}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="looking_for">{t("matchmaking.looking_for")}</Label>
          <Textarea
            id="looking_for"
            name="looking_for"
            required
            rows={5}
            placeholder={t("matchmaking.looking_for")}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="age_range">{t("matchmaking.age_range")}</Label>
          <Input
            id="age_range"
            name="age_range"
            type="text"
            required
            placeholder="25-35"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="preferred_areas">{t("matchmaking.areas")}</Label>
          <Input
            id="preferred_areas"
            name="preferred_areas"
            type="text"
            required
            placeholder="London, Manchester"
            className="mt-1.5"
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : t("matchmaking.apply")}
        </Button>
      </form>
    </Card>
  );
}
