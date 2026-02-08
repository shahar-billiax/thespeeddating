"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth/actions";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function RegisterForm() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await signUp(formData);
    },
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("auth.register_title")}</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Step {step} of 2</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input id="password" name="password" type="password" minLength={6} required />
              </div>
              <Button type="button" className="w-full" onClick={() => setStep(2)}>
                Next
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="gender" value="male" required />
                    Male
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="gender" value="female" required />
                    Female
                  </label>
                </div>
              </div>
              {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? "Creating account..." : t("nav.register")}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("nav.login")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
