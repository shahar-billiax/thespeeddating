"use client";

import { useActionState, useState, useCallback, useTransition, useEffect, useRef } from "react";
import { createPage, savePageVersion } from "@/lib/admin/actions";
import { PageEditor } from "@/components/admin/page-editor";
import type { PageEditorRef } from "@/components/admin/page-editor";
import { MediaGalleryPanel } from "@/components/admin/media-gallery-panel";
import { MediaGalleryDialog } from "@/components/admin/media-gallery-dialog";
import { TestimoniesPanel } from "@/components/admin/testimonies-panel";
import { FaqEditor } from "@/components/admin/content-editors/faq-editor";
import { ContactEditor } from "@/components/admin/content-editors/contact-editor";
import type { FaqContent, ContactContent } from "@/lib/admin/content-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Heart,
  HelpCircle,
  Phone,
  ExternalLink,
  Check,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CONTENT_PAGES = [
  { value: "home", label: "Home", url: "/" },
  { value: "about-us", label: "About Us", url: "/about-us" },
  { value: "dating-tips", label: "Dating Tips", url: "/dating-tips" },
  { value: "what-is-speed-dating", label: "What Is Speed Dating", url: "/what-is-speed-dating" },
  { value: "virtual-events", label: "Virtual Events", url: "/virtual-events" },
  { value: "franchise-jobs", label: "Franchise / Jobs", url: "/franchise-jobs" },
  { value: "terms", label: "Terms & Conditions", url: "/terms" },
  { value: "privacy", label: "Privacy Policy", url: "/privacy" },
  { value: "safety", label: "Safety Guidelines", url: "/safety" },
];

const SPECIAL_PAGES = [
  { value: "success-stories", label: "Success Stories", url: "/success-stories" },
  { value: "matchmaking", label: "Matchmaking", url: "/matchmaking" },
  { value: "vip", label: "VIP Membership", url: "/vip" },
  { value: "faq", label: "FAQ", url: "/faqs" },
  { value: "contact", label: "Contact", url: "/contact" },
];

const PAGE_TYPE_OPTIONS = [
  { value: "standard", label: "Standard", description: "Regular page with rich text content", icon: FileText },
  { value: "testimony", label: "Testimony", description: "Page with testimonies/success stories", icon: Heart },
  { value: "faq", label: "FAQ", description: "Page with categorised Q&A sections", icon: HelpCircle },
  { value: "contact", label: "Contact", description: "Page with opening hours & contact details", icon: Phone },
];

const PAGE_KEY_TYPE_MAP: Record<string, string> = {
  "success-stories": "testimony",
  faq: "faq",
  contact: "contact",
};

const LANGUAGES = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "he", label: "Hebrew", shortLabel: "HE" },
] as const;

function getPageUrl(pageKey: string): string {
  const all = [...CONTENT_PAGES, ...SPECIAL_PAGES];
  return all.find((p) => p.value === pageKey)?.url ?? `/${pageKey}`;
}

interface LanguageData {
  id: number | null;
  title: string;
  contentHtml: string;
  contentJson: Record<string, unknown> | null;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
}

function emptyLanguageData(): LanguageData {
  return {
    id: null,
    title: "",
    contentHtml: "",
    contentJson: null,
    metaTitle: "",
    metaDescription: "",
    isPublished: true,
  };
}

// ── "New page" mode (no existing versions) ──────────────────────
function NewPageForm() {
  const [contentHtml, setContentHtml] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [pageKey, setPageKey] = useState("");
  const [pageType, setPageType] = useState("standard");
  const [contentJson, setContentJson] = useState<Record<string, unknown> | null>(null);
  const editorRef = useRef<PageEditorRef>(null);
  const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  const handlePageKeyChange = useCallback((key: string) => {
    setPageKey(key);
    const autoType = PAGE_KEY_TYPE_MAP[key];
    if (autoType) setPageType(autoType);
  }, []);

  const handleFaqChange = useCallback((data: FaqContent) => {
    setContentJson(data as unknown as Record<string, unknown>);
  }, []);

  const handleContactChange = useCallback((data: ContactContent) => {
    setContentJson(data as unknown as Record<string, unknown>);
  }, []);

  async function handleSubmit(_prev: any, formData: FormData) {
    formData.set("content_html", contentHtml);
    if (contentJson && (pageType === "faq" || pageType === "contact")) {
      formData.set("content_json", JSON.stringify(contentJson));
    }
    return await createPage(formData);
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);
  const selectedPageType = PAGE_TYPE_OPTIONS.find((o) => o.value === pageType);

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6 max-w-4xl">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {state.error}
            </p>
          )}

          {/* ── Compact page info bar ── */}
          <div className="rounded-lg border bg-card px-4 py-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Page</Label>
                <input type="hidden" name="page_key" value={pageKey} />
                <Select value={pageKey} onValueChange={handlePageKeyChange} required>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select a page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Content Pages</SelectLabel>
                      {CONTENT_PAGES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            {option.label}
                            <span className="text-xs text-muted-foreground">{option.url}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Special Pages</SelectLabel>
                      {SPECIAL_PAGES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            {option.label}
                            <span className="text-xs text-muted-foreground">{option.url}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <input type="hidden" name="page_type" value={pageType} />
                <Select value={pageType} onValueChange={setPageType}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_TYPE_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {option.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedPageType && (
                  <p className="text-xs text-muted-foreground leading-tight">
                    {selectedPageType.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input name="title" required className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Language</Label>
                <Select name="language_code" defaultValue="en" required>
                  <SelectTrigger className="h-8 text-sm w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="he">Hebrew</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ── Content editor ── */}
          {(pageType === "testimony" || pageType === "faq" || pageType === "contact") && (
            <p className="text-xs text-muted-foreground -mb-2">
              {pageType === "testimony"
                ? "Intro content — appears above the testimonies on the public page."
                : "Intro HTML — appears above the structured data section on the public page."}
            </p>
          )}
          <PageEditor
            ref={editorRef}
            content={contentHtml}
            onChange={setContentHtml}
            onOpenMediaGallery={() => setMediaSheetOpen(true)}
            onImageImported={() => setGalleryRefreshKey((k) => k + 1)}
          />

          {pageType === "faq" && (
            <FaqEditor
              value={contentJson as FaqContent | null}
              onChange={handleFaqChange}
            />
          )}

          {pageType === "contact" && (
            <ContactEditor
              value={contentJson as ContactContent | null}
              onChange={handleContactChange}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input name="meta_title" placeholder="Leave empty to use page title" />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea name="meta_description" rows={3} placeholder="Brief description for search engines" />
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
                <Switch id="is_published" checked={isPublished} onCheckedChange={setIsPublished} />
                <Label htmlFor="is_published">{isPublished ? "Published" : "Draft"}</Label>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isPending} className="w-full" size="lg">
            {isPending ? "Creating..." : "Create Page"}
          </Button>
        </form>
      </div>

      {/* Media Gallery Panel - visible on xl+ screens, fills remaining space */}
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

// ── "Edit page" mode (with language switching) ──────────────────
function EditPageForm({
  pageKey: initialPageKey,
  pageType: initialPageType,
  versions,
  storiesByLang,
}: {
  pageKey: string;
  pageType: string;
  versions: Record<string, any>;
  storiesByLang?: Record<string, any[]>;
}) {
  const editorRef = useRef<PageEditorRef>(null);
  const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState<string>(
    versions.en ? "en" : "he"
  );
  const [pageKey] = useState(initialPageKey);
  const [pageType] = useState(initialPageType);

  // Per-language data keyed by language code
  const [langData, setLangData] = useState<Record<string, LanguageData>>(() => {
    const result: Record<string, LanguageData> = {};
    for (const lang of LANGUAGES) {
      const v = versions[lang.code];
      if (v) {
        result[lang.code] = {
          id: v.id,
          title: v.title,
          contentHtml: v.content_html,
          contentJson: v.content_json,
          metaTitle: v.meta_title ?? "",
          metaDescription: v.meta_description ?? "",
          isPublished: v.is_published,
        };
      }
    }
    return result;
  });

  const currentLang = langData[activeLanguage] ?? emptyLanguageData();
  const currentLangInfo = LANGUAGES.find((l) => l.code === activeLanguage)!;
  const hasVersion = !!langData[activeLanguage]?.id;

  // Saving state
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (showSaved) {
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSaved]);

  const updateField = useCallback(
    <K extends keyof LanguageData>(field: K, value: LanguageData[K]) => {
      setLangData((prev) => ({
        ...prev,
        [activeLanguage]: {
          ...(prev[activeLanguage] ?? emptyLanguageData()),
          [field]: value,
        },
      }));
    },
    [activeLanguage]
  );

  const handleFaqChange = useCallback(
    (data: FaqContent) => {
      updateField("contentJson", data as unknown as Record<string, unknown>);
    },
    [updateField]
  );

  const handleContactChange = useCallback(
    (data: ContactContent) => {
      updateField("contentJson", data as unknown as Record<string, unknown>);
    },
    [updateField]
  );

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setShowSaved(false);

    startTransition(async () => {
      const formData = new FormData();
      if (currentLang.id) formData.set("page_id", String(currentLang.id));
      formData.set("page_key", pageKey);
      formData.set("language_code", activeLanguage);
      formData.set("page_type", pageType);
      formData.set("title", currentLang.title);
      formData.set("content_html", currentLang.contentHtml);
      formData.set("meta_title", currentLang.metaTitle);
      formData.set("meta_description", currentLang.metaDescription);
      formData.set("is_published", currentLang.isPublished ? "true" : "false");
      if (
        currentLang.contentJson &&
        (pageType === "faq" || pageType === "contact")
      ) {
        formData.set("content_json", JSON.stringify(currentLang.contentJson));
      }

      const result = await savePageVersion(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowSaved(true);
        // If a new record was created, store its ID
        if (result?.id && !currentLang.id) {
          setLangData((prev) => ({
            ...prev,
            [activeLanguage]: {
              ...(prev[activeLanguage] ?? emptyLanguageData()),
              id: result.id!,
            },
          }));
        }
      }
    });
  }

  const selectedPageType = PAGE_TYPE_OPTIONS.find((o) => o.value === pageType);
  const activeStories = storiesByLang?.[activeLanguage] ?? [];
  const activePageId = currentLang.id;

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-4 max-w-4xl">

      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {error}
          </p>
        )}

        {/* ── Compact header bar: page meta + title + language switcher ── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border bg-card px-4 py-2.5">
          {/* Page key + type */}
          <div className="flex items-center gap-2 shrink-0">
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
              {pageKey}
            </code>
            {selectedPageType && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <selectedPageType.icon className="h-3.5 w-3.5" />
                {selectedPageType.label}
              </span>
            )}
          </div>

          <div className="w-px h-4 bg-border shrink-0" />

          {/* Title input */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Label htmlFor="page-title" className="text-xs shrink-0 text-muted-foreground">
              Title
            </Label>
            <Input
              id="page-title"
              value={currentLang.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
              dir={activeLanguage === "he" ? "rtl" : "ltr"}
              className="h-7 text-sm"
            />
          </div>

          <div className="w-px h-4 bg-border shrink-0" />

          {/* Language switcher */}
          <div className="flex gap-0.5 rounded-md border bg-muted/40 p-0.5 shrink-0">
            {LANGUAGES.map((lang) => {
              const isActive = activeLanguage === lang.code;
              const exists = !!langData[lang.code]?.id;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLanguage(lang.code)}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-all",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {lang.label}
                  {exists ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-dashed leading-none">
                      new
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* View on Site */}
          <a
            href={getPageUrl(pageKey)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </a>
        </div>

        {/* Missing version warning */}
        {!hasVersion && (
          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-md">
            No {currentLangInfo.label} version yet — fill in content below and save to create it.
          </p>
        )}

        {/* ── Content editor (no extra Card wrapper — editor has its own border) ── */}
        {(pageType === "testimony" || pageType === "faq" || pageType === "contact") && (
          <p className="text-xs text-muted-foreground -mb-2">
            {pageType === "testimony"
              ? "Intro content — appears above the testimonies on the public page."
              : "Intro HTML — appears above the structured data section on the public page."}
          </p>
        )}
        <div dir={activeLanguage === "he" ? "rtl" : "ltr"}>
          <PageEditor
            ref={editorRef}
            key={activeLanguage}
            content={currentLang.contentHtml}
            onChange={(html) => updateField("contentHtml", html)}
            onOpenMediaGallery={() => setMediaSheetOpen(true)}
            onImageImported={() => setGalleryRefreshKey((k) => k + 1)}
          />
        </div>

        {pageType === "faq" && (
          <FaqEditor
            key={activeLanguage}
            value={currentLang.contentJson as FaqContent | null}
            onChange={handleFaqChange}
          />
        )}

        {pageType === "contact" && (
          <ContactEditor
            key={activeLanguage}
            value={currentLang.contentJson as ContactContent | null}
            onChange={handleContactChange}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>SEO ({currentLangInfo.label})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Meta Title</Label>
              <Input
                value={currentLang.metaTitle}
                onChange={(e) => updateField("metaTitle", e.target.value)}
                placeholder="Leave empty to use page title"
                dir={activeLanguage === "he" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea
                value={currentLang.metaDescription}
                onChange={(e) => updateField("metaDescription", e.target.value)}
                rows={3}
                placeholder="Brief description for search engines"
                dir={activeLanguage === "he" ? "rtl" : "ltr"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing ({currentLangInfo.label})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Switch
                id="is_published"
                checked={currentLang.isPublished}
                onCheckedChange={(checked) => updateField("isPublished", checked)}
              />
              <Label htmlFor="is_published">
                {currentLang.isPublished ? "Published" : "Draft"}
              </Label>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isPending}
          className={cn("w-full", showSaved && "bg-green-600 hover:bg-green-600")}
          size="lg"
        >
          {isPending
            ? "Saving..."
            : showSaved
              ? "Saved!"
              : hasVersion
                ? `Save ${currentLangInfo.label} Version`
                : `Create ${currentLangInfo.label} Version`}
        </Button>
      </form>

      {pageType === "testimony" && (
        <TestimoniesPanel
          stories={activeStories}
          pageKey={pageKey}
          language={activeLanguage}
          pageId={activePageId}
        />
      )}
      </div>

      {/* Media Gallery Panel - visible on xl+ screens, fills remaining space */}
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

// ── Public component (decides which form to render) ─────────────
export function PageForm({
  pageKey,
  pageType,
  versions,
  storiesByLang,
}: {
  pageKey?: string;
  pageType?: string;
  versions?: Record<string, any>;
  storiesByLang?: Record<string, any[]>;
}) {
  // Edit mode: pageKey and versions are provided
  if (pageKey && versions) {
    return (
      <EditPageForm
        pageKey={pageKey}
        pageType={pageType ?? "standard"}
        versions={versions}
        storiesByLang={storiesByLang}
      />
    );
  }

  // New page mode
  return <NewPageForm />;
}
