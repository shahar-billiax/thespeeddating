"use client";

import { useActionState, useState, useRef } from "react";
import { saveBlogPost } from "@/lib/admin/actions";
import { PageEditor } from "@/components/admin/page-editor";
import type { PageEditorRef } from "@/components/admin/page-editor";
import { MediaGalleryPanel } from "@/components/admin/media-gallery-panel";
import { MediaGalleryDialog } from "@/components/admin/media-gallery-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function BlogPostForm({ post }: { post?: any }) {
  const [bodyHtml, setBodyHtml]               = useState<string>(post?.body_html ?? "");
  const [isPublished, setIsPublished]         = useState<boolean>(post?.is_published ?? false);
  const [language, setLanguage]               = useState<string>(post?.language_code ?? "en");
  const [mediaSheetOpen, setMediaSheetOpen]   = useState(false);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const editorRef = useRef<PageEditorRef>(null);

  async function handleSubmit(_prev: any, formData: FormData) {
    formData.set("body_html", bodyHtml);
    return await saveBlogPost(formData);
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <div className="flex gap-6">
      <form action={formAction} className="flex-1 min-w-0 space-y-4 max-w-4xl">
        {post && <input type="hidden" name="id" value={post.id} />}
        <input type="hidden" name="is_published" value={isPublished ? "true" : "false"} />

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

        {/* ── Compact info bar ── */}
        <div className="rounded-lg border bg-card px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                name="title"
                required
                defaultValue={post?.title ?? ""}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Slug</Label>
              <Input
                name="slug"
                defaultValue={post?.slug ?? ""}
                placeholder="auto-generated from title if empty"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Featured Image URL</Label>
              <Input
                name="featured_image"
                defaultValue={post?.featured_image ?? ""}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Language</Label>
              {post ? (
                <>
                  <input type="hidden" name="language_code" value={language} />
                  <div className="h-8 flex items-center">
                    <Badge variant={language === "en" ? "default" : "secondary"}>
                      {language === "en" ? "English" : "עברית"}
                    </Badge>
                  </div>
                </>
              ) : (
                <Select name="language_code" value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 text-sm w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="he">Hebrew (עברית)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1 flex flex-col">
              <Label className="text-xs">Published</Label>
              <div className="h-8 flex items-center">
                <Switch
                  id="is_published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Rich text editor ── */}
        <div dir={language === "he" ? "rtl" : "ltr"}>
          <PageEditor
            ref={editorRef}
            content={bodyHtml}
            onChange={setBodyHtml}
            onOpenMediaGallery={() => setMediaSheetOpen(true)}
            onImageImported={() => setGalleryRefreshKey((k) => k + 1)}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
      </form>

      {/* Media Gallery Panel — visible on xl+ screens */}
      <div className="flex-1 min-w-[300px] hidden xl:block">
        <MediaGalleryPanel
          onInsertImage={(url, alt) => editorRef.current?.insertImage(url, alt)}
          refreshKey={galleryRefreshKey}
        />
      </div>

      <MediaGalleryDialog
        open={mediaSheetOpen}
        onOpenChange={(open) => {
          setMediaSheetOpen(open);
          if (!open) setGalleryRefreshKey((k) => k + 1);
        }}
        onInsertImage={(url, alt) => editorRef.current?.insertImage(url, alt)}
      />
    </div>
  );
}
