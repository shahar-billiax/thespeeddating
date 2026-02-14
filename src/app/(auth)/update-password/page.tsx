"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UpdatePasswordPage() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await updatePassword(formData);
    },
    null
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-bold">{t("auth.set_new_password")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.new_password")}</Label>
            <Input id="password" name="password" type="password" minLength={6} required className="h-11" />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full h-11 shadow-sm" disabled={pending}>
            {pending ? t("auth.updating") : t("auth.update_password")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
