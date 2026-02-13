import { SuccessStoryForm } from "@/components/admin/success-story-form";

export default async function NewStoryForPagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  // id param is actually the page_key (e.g. "success-stories")
  const { id: pageKey } = await params;
  const query = await searchParams;
  const defaultLanguage = query.lang ?? "en";

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">New Testimony</h1>
      <p className="text-muted-foreground">
        Adding testimony for page: {pageKey} ({defaultLanguage === "he" ? "Hebrew" : "English"})
      </p>
      <SuccessStoryForm
        defaultLanguage={defaultLanguage}
        returnTo={`/admin/pages/${pageKey}/edit`}
      />
    </div>
  );
}
