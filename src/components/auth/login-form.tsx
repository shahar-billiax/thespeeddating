"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm({ redirect }: { redirect?: string }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await signIn(formData);
    },
    null
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-bold">{t("auth.login_title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {redirect && <input type="hidden" name="redirect" value={redirect} />}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full h-11 shadow-sm" disabled={pending}>
            {pending ? t("auth.signing_in") : t("nav.login")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 text-sm pt-2">
        <Link href="/reset-password" className="text-muted-foreground hover:text-primary transition-colors">
          {t("auth.forgot_password")}
        </Link>
        <p className="text-muted-foreground">
          {t("auth.no_account")}{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            {t("nav.register")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
