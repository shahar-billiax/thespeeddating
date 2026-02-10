"use client";

import { useActionState, useState } from "react";
import { createPage, updatePage } from "@/lib/admin/actions";
import { PageEditor } from "@/components/admin/page-editor";
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

const PAGE_KEY_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "about-us", label: "About Us" },
  { value: "dating-tips", label: "Dating Tips" },
  { value: "matchmaking", label: "Matchmaking" },
  { value: "virtual-events", label: "Virtual Events" },
  { value: "success-stories", label: "Success Stories" },
  { value: "contact", label: "Contact" },
  { value: "franchise-jobs", label: "Franchise / Jobs" },
  { value: "what-is-speed-dating", label: "What Is Speed Dating" },
  { value: "vip", label: "VIP Membership" },
  { value: "terms", label: "Terms & Conditions" },
  { value: "faq", label: "FAQ" },
  { value: "safety", label: "Safety Guidelines" },
  { value: "privacy", label: "Privacy Policy" },
];

export function PageForm({
  page,
  countries,
}: {
  page?: any;
  countries: { id: number; name: string; code: string }[];
}) {
  const [contentHtml, setContentHtml] = useState(page?.content_html ?? "");
  const [isPublished, setIsPublished] = useState(page?.is_published ?? true);

  async function handleSubmit(_prev: any, formData: FormData) {
    formData.set("content_html", contentHtml);
    if (page) {
      return await updatePage(page.id, formData);
    }
    return await createPage(formData);
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          {state.error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Page Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Page Key</Label>
            <Select
              name="page_key"
              defaultValue={page?.page_key ?? ""}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select page type" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_KEY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              This determines the URL: /{"{page_key}"}
            </p>
          </div>

          <div>
            <Label>Title</Label>
            <Input name="title" required defaultValue={page?.title ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Country</Label>
              <Select
                name="country_id"
                defaultValue={page?.country_id ? String(page.country_id) : ""}
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
            <div>
              <Label>Language</Label>
              <Select
                name="language_code"
                defaultValue={page?.language_code ?? "en"}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="he">Hebrew</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <PageEditor content={contentHtml} onChange={setContentHtml} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Meta Title</Label>
            <Input
              name="meta_title"
              defaultValue={page?.meta_title ?? ""}
              placeholder="Leave empty to use page title"
            />
          </div>
          <div>
            <Label>Meta Description</Label>
            <Textarea
              name="meta_description"
              rows={3}
              defaultValue={page?.meta_description ?? ""}
              placeholder="Brief description for search engines"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <input type="hidden" name="is_published" value={isPublished ? "true" : "false"} />
            <Switch
              id="is_published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="is_published">
              {isPublished ? "Published" : "Draft"}
            </Label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? "Saving..." : page ? "Update Page" : "Create Page"}
      </Button>
    </form>
  );
}
