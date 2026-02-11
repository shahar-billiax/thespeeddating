"use client";

import { useActionState, useState, useCallback } from "react";
import { createPage, updatePage } from "@/lib/admin/actions";
import { PageEditor } from "@/components/admin/page-editor";
import { TestimoniesPanel } from "@/components/admin/testimonies-panel";
import { FaqEditor } from "@/components/admin/content-editors/faq-editor";
import { ContactEditor } from "@/components/admin/content-editors/contact-editor";
import type { FaqContent, ContactContent } from "@/lib/admin/content-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";

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

function getPageUrl(pageKey: string): string {
  const all = [...CONTENT_PAGES, ...SPECIAL_PAGES];
  return all.find((p) => p.value === pageKey)?.url ?? `/${pageKey}`;
}

export function PageForm({
  page,
  countries,
  stories,
}: {
  page?: any;
  countries: { id: number; name: string; code: string }[];
  stories?: any[];
}) {
  const [contentHtml, setContentHtml] = useState(page?.content_html ?? "");
  const [isPublished, setIsPublished] = useState(page?.is_published ?? true);
  const [pageKey, setPageKey] = useState(page?.page_key ?? "");
  const [pageType, setPageType] = useState(page?.page_type ?? "standard");
  const [contentJson, setContentJson] = useState<Record<string, unknown> | null>(
    page?.content_json ?? null
  );

  const handlePageKeyChange = useCallback((key: string) => {
    setPageKey(key);
    const autoType = PAGE_KEY_TYPE_MAP[key];
    if (autoType) {
      setPageType(autoType);
    }
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
    if (page) {
      return await updatePage(page.id, formData);
    }
    return await createPage(formData);
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  const selectedPageType = PAGE_TYPE_OPTIONS.find((o) => o.value === pageType);

  return (
    <div className="space-y-6 max-w-4xl">
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {state.error}
          </p>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Page Information</CardTitle>
              {page && (
                <a
                  href={getPageUrl(page.page_key)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Site
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Page selector with URL preview */}
            <div>
              <Label>Page</Label>
              <input type="hidden" name="page_key" value={pageKey} />
              <Select
                value={pageKey}
                onValueChange={handlePageKeyChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Content Pages</SelectLabel>
                    {CONTENT_PAGES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          {option.label}
                          <span className="text-xs text-muted-foreground">
                            {option.url}
                          </span>
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
                          <span className="text-xs text-muted-foreground">
                            {option.url}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Page type selector */}
            <div>
              <Label>Page Type</Label>
              <input type="hidden" name="page_type" value={pageType} />
              <Select value={pageType} onValueChange={setPageType}>
                <SelectTrigger>
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
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedPageType.description}
                </p>
              )}
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
            <CardTitle>
              {pageType === "testimony" ? "Intro Content" : "Content"}
            </CardTitle>
            {pageType === "testimony" && (
              <p className="text-sm text-muted-foreground">
                This content appears as the introduction above the testimonies.
              </p>
            )}
            {(pageType === "faq" || pageType === "contact") && (
              <p className="text-sm text-muted-foreground">
                This HTML content appears above the structured data section on the public page.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <PageEditor content={contentHtml} onChange={setContentHtml} />
          </CardContent>
        </Card>

        {/* Structured content editors based on page type */}
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

      {pageType === "testimony" && page && (
        <TestimoniesPanel stories={stories ?? []} pageId={page.id} />
      )}
    </div>
  );
}
