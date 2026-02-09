"use client";

import { useActionState, useState } from "react";
import { saveGallery } from "@/lib/admin/actions";
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

const CATEGORIES = ["events", "venues", "homepage", "success_stories"];

export function GalleryDialog({
  countries,
}: {
  countries: { id: number; name: string; code: string }[];
}) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(_prev: any, formData: FormData) {
    const result = await saveGallery(formData);
    if (result?.success) setOpen(false);
    return result;
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />New Gallery</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Gallery</DialogTitle></DialogHeader>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div>
            <Label>Name</Label>
            <Input name="name" required />
          </div>
          <div>
            <Label>Category</Label>
            <Select name="category" required>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Country</Label>
            <Select name="country_id" required>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="gallery_active" name="is_active" defaultChecked />
            <Label htmlFor="gallery_active">Active</Label>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating..." : "Create Gallery"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
