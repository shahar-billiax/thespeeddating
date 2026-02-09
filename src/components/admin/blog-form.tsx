"use client";

import { useActionState } from "react";
import { saveBlogPost } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BlogPostForm({
  post,
  countries,
}: {
  post?: any;
  countries: { id: number; name: string; code: string }[];
}) {
  async function handleSubmit(_prev: any, formData: FormData) {
    return await saveBlogPost(formData);
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {post && <input type="hidden" name="id" value={post.id} />}

      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-100 p-3 rounded">
          Post saved
        </p>
      )}

      <Card>
        <CardHeader><CardTitle>Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input name="title" required defaultValue={post?.title ?? ""} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input name="slug" defaultValue={post?.slug ?? ""} placeholder="auto-generated from title if empty" />
          </div>
          <div>
            <Label>Body (HTML)</Label>
            <Textarea name="body_html" rows={15} required defaultValue={post?.body_html ?? ""} className="font-mono text-sm" />
          </div>
          <div>
            <Label>Featured Image URL</Label>
            <Input name="featured_image" defaultValue={post?.featured_image ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Country</Label>
              <Select name="country_id" defaultValue={post?.country_id ? String(post.country_id) : ""}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select name="language_code" defaultValue={post?.language_code ?? "en"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="he">Hebrew</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="is_published" name="is_published" defaultChecked={post?.is_published ?? false} />
            <Label htmlFor="is_published">Published</Label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : post ? "Update Post" : "Create Post"}
      </Button>
    </form>
  );
}
