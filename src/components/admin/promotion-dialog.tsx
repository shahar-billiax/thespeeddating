"use client";

import { useActionState, useState } from "react";
import { savePromotion } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAdminCountry } from "@/lib/admin-country-context";

export function PromotionDialog({
  countries,
}: {
  countries: { id: number; name: string; code: string }[];
}) {
  const [open, setOpen] = useState(false);
  const { countryId: adminCountryId } = useAdminCountry();

  async function handleSubmit(_prev: any, formData: FormData) {
    const result = await savePromotion(formData);
    if (result?.success) setOpen(false);
    return result;
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Promotion Code</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div>
            <Label>Code</Label>
            <Input name="code" required placeholder="e.g. SUMMER20" className="font-mono" />
          </div>
          <div>
            <Label>Country</Label>
            <Select name="country_id" required defaultValue={String(adminCountryId)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="is_percentage" name="is_percentage" />
            <Label htmlFor="is_percentage">Percentage discount</Label>
          </div>
          <div>
            <Label>Value</Label>
            <Input name="value" type="number" step="0.01" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valid From</Label>
              <Input name="valid_from" type="date" />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input name="valid_until" type="date" />
            </div>
          </div>
          <div>
            <Label>Max Uses (empty = unlimited)</Label>
            <Input name="max_uses" type="number" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="promo_active" name="is_active" defaultChecked />
            <Label htmlFor="promo_active">Active</Label>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating..." : "Create Code"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
