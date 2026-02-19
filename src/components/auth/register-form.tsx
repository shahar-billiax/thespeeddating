"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function RegisterForm() {
  const t = useTranslations();
  const [step, setStep] = useState(1);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [stepError, setStepError] = useState("");
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await signUp(formData);
    },
    null
  );

  function handleNext() {
    const form = document.querySelector("form");
    if (!form) return;
    const firstName = (form.querySelector('[name="firstName"]') as HTMLInputElement)?.value?.trim();
    const lastName = (form.querySelector('[name="lastName"]') as HTMLInputElement)?.value?.trim();
    const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value?.trim();
    const password = (form.querySelector('[name="password"]') as HTMLInputElement)?.value;

    if (!firstName || !lastName || !email || !password) {
      setStepError(t("auth.fill_all_fields"));
      return;
    }
    if (password.length < 6) {
      setStepError(t("auth.password_min_length"));
      return;
    }
    setStepError("");
    setStep(2);
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-bold">{t("auth.register_title")}</CardTitle>
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        </div>
        <p className="text-center text-sm text-muted-foreground">{t("auth.step_of", { step: String(step), total: "2" })}</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className={step === 1 ? undefined : "hidden"}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("profile.first_name")}</Label>
                  <Input id="firstName" name="firstName" autoComplete="given-name" required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("profile.last_name")}</Label>
                  <Input id="lastName" name="lastName" autoComplete="family-name" required className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required className="h-11" />
              </div>
              {stepError && (
                <p className="text-sm text-destructive">{stepError}</p>
              )}
              <Button type="button" className="w-full h-11 shadow-sm" onClick={handleNext}>
                {t("common.next")}
              </Button>
            </div>
          </div>

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t("profile.date_of_birth")}</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" autoComplete="bday" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.gender")}</Label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value="male" required className="accent-primary" />
                    <span className="text-sm">{t("profile.male")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value="female" required className="accent-primary" />
                    <span className="text-sm">{t("profile.female")}</span>
                  </label>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent_terms"
                    checked={consentTerms}
                    onCheckedChange={(checked) => setConsentTerms(checked as boolean)}
                    required
                  />
                  <input type="hidden" name="consent_terms" value={consentTerms ? "true" : "false"} />
                  <Label htmlFor="consent_terms" className="cursor-pointer text-sm leading-relaxed">
                    {t("auth.consent_terms_text")}{" "}
                    <Link href="/terms" className="text-primary hover:underline" target="_blank">
                      {t("auth.terms_and_conditions")}
                    </Link>
                    {" "}{t("auth.and")}{" "}
                    <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                      {t("auth.privacy_policy")}
                    </Link>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent_marketing"
                    checked={consentMarketing}
                    onCheckedChange={(checked) => setConsentMarketing(checked as boolean)}
                  />
                  <input type="hidden" name="consent_marketing" value={consentMarketing ? "true" : "false"} />
                  <Label htmlFor="consent_marketing" className="cursor-pointer text-sm">
                    {t("auth.consent_marketing")}
                  </Label>
                </div>
              </div>
              {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setStep(1)}>
                  {t("common.back")}
                </Button>
                <Button type="submit" className="flex-1 h-11 shadow-sm" disabled={pending || !consentTerms}>
                  {pending ? t("auth.creating_account") : t("nav.register")}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm pt-2">
        <p className="text-muted-foreground">
          {t("auth.have_account")}{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            {t("nav.login")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
