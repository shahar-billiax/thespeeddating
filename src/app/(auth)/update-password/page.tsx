"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/auth/actions";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UpdatePasswordPage() {
  const { t } = useTranslation();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await updatePassword(formData);
    },
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("auth.set_new_password")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.new_password")}</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("auth.updating") : t("auth.update_password")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
