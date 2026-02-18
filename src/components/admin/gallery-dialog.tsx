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
import { useAdminCountry } from "@/lib/admin-country-context";

const CATEGORIES = ["events", "venues", "homepage", "success_stories", "general"];

interface GalleryDialogProps {
  countries: { id: number; name: string; code: string }[];
  gallery?: {
    id: number;
    name: string;
    category: string;
    country_id: number;
    is_active: boolean;
  };
  trigger?: React.ReactNode;
}

export function GalleryDialog({
  countries,
  gallery,
  trigger,
}: GalleryDialogProps) {
  const [open, setOpen] = useState(false);
  const { countryId: adminCountryId } = useAdminCountry();
  const isEdit = !!gallery;

  async function handleSubmit(_prev: any, formData: FormData) {
    const result = await saveGallery(formData);
    if (result?.success) setOpen(false);
    return result;
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button><Plus className="h-4 w-4 mr-2" />New Gallery</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Gallery" : "Create Gallery"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {gallery && <input type="hidden" name="id" value={gallery.id} />}
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div>
            <Label>Name</Label>
            <Input name="name" required defaultValue={gallery?.name ?? ""} />
          </div>
          <div>
            <Label>Category</Label>
            <Select name="category" required defaultValue={gallery?.category ?? ""}>
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
            <Select
              name="country_id"
              required
              defaultValue={gallery ? String(gallery.country_id) : String(adminCountryId)}
            >
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="gallery_active"
              name="is_active"
              defaultChecked={gallery?.is_active ?? true}
            />
            <Label htmlFor="gallery_active">Active</Label>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending
              ? isEdit ? "Saving..." : "Creating..."
              : isEdit ? "Save Changes" : "Create Gallery"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
