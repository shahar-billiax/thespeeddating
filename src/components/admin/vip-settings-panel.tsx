"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveVipSettings } from "@/lib/admin/actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Settings {
  id: number;
  country_id: number;
  auto_renewal_notice: string;
}

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
}

export function VipSettingsPanel({
  setting,
  country,
}: {
  setting: Settings | null;
  country: Country;
}) {
  async function handleSave(_prev: any, formData: FormData) {
    formData.set("country_id", String(country.id));
    return await saveVipSettings(formData);
  }

  const [state, formAction, isPending] = useActionState(handleSave, null);
  const prevState = useRef(state);

  useEffect(() => {
    if (state && state !== prevState.current) {
      if (state.success) {
        toast.success("Settings saved successfully");
      }
      prevState.current = state;
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div>
            <Label>Auto-Renewal Notice</Label>
            <Textarea
              name="auto_renewal_notice"
              rows={3}
              defaultValue={setting?.auto_renewal_notice ?? ""}
              placeholder="Notice text displayed below pricing plans on the public VIP page"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
