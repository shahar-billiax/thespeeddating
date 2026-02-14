"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ResetForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return await resetPassword(formData);
    },
    null
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-bold">{t("auth.reset_password")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" name="email" type="email" required className="h-11" />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600">{state.success}</p>
          )}
          <Button type="submit" className="w-full h-11 shadow-sm" disabled={pending}>
            {pending ? t("auth.sending") : t("auth.reset_password")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm pt-2">
        <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
          {t("auth.back_to_login")}
        </Link>
      </CardFooter>
    </Card>
  );
}
