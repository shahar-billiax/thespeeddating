"use client";

import { useActionState, useState } from "react";
import {
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SuccessStoryForm({
  story,
  countries,
  returnTo,
  defaultCountryId,
}: {
  story?: any;
  countries: { id: number; name: string; code: string }[];
  returnTo?: string;
  defaultCountryId?: number;
}) {
  const router = useRouter();
  const [isFeatured, setIsFeatured] = useState(story?.is_featured ?? false);
  const [isActive, setIsActive] = useState(story?.is_active ?? true);

  async function handleSubmit(_prev: any, formData: FormData) {
    if (story) {
      return await updateSuccessStory(story.id, formData);
    }
    return await createSuccessStory(formData);
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  async function handleDelete() {
    if (!story) return;
    const result = await deleteSuccessStory(story.id);
    if (result?.error) {
      console.error("Failed to delete story:", result.error);
    } else {
      router.push(returnTo || "/admin/success-stories");
    }
  }

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          {state.error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Couple / Person Name *</Label>
            <Input
              name="couple_names"
              required
              defaultValue={story?.couple_names ?? ""}
              placeholder="e.g. Howard B & Louise J"
            />
          </div>

          <div>
            <Label>Testimonial Quote *</Label>
            <Textarea
              name="quote"
              required
              rows={5}
              defaultValue={story?.quote ?? ""}
              placeholder="Their story or testimonial..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Year / Date</Label>
              <Input
                name="year"
                defaultValue={story?.year ?? ""}
                placeholder="e.g. December 2004"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                name="location"
                defaultValue={story?.location ?? ""}
                placeholder="e.g. London, NYC"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Story Type</Label>
              <Select
                name="story_type"
                defaultValue={story?.story_type ?? "testimonial"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="dating">Dating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Country</Label>
              <Select
                name="country_id"
                defaultValue={
                  story?.country_id
                    ? String(story.country_id)
                    : defaultCountryId
                      ? String(defaultCountryId)
                      : ""
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Sort Order</Label>
            <Input
              name="sort_order"
              type="number"
              defaultValue={story?.sort_order ?? 0}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lower numbers appear first
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="hidden"
              name="is_featured"
              value={isFeatured ? "true" : "false"}
            />
            <Switch
              id="is_featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
            <Label htmlFor="is_featured">
              {isFeatured ? "Featured (highlighted on page)" : "Not Featured"}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="hidden"
              name="is_active"
              value={isActive ? "true" : "false"}
            />
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is_active">
              {isActive ? "Active (visible on site)" : "Hidden"}
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1"
          size="lg"
        >
          {isPending ? "Saving..." : story ? "Update Story" : "Create Story"}
        </Button>
        {story && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="lg">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this story and all its content.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </form>
  );
}
