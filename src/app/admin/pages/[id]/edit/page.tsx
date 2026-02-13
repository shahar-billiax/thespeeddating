import { getPageVersions, getSuccessStoriesByLanguage } from "@/lib/admin/actions";
import { PageForm } from "@/components/admin/page-form";
import { notFound } from "next/navigation";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // id param is actually the page_key (e.g. "about-us")
  const { id: pageKey } = await params;
  const versions = await getPageVersions(pageKey);

  if (versions.length === 0) {
    notFound();
  }

  const pageType = versions[0].page_type;

  // Fetch stories for both languages if testimony-type page
  let storiesByLang: Record<string, any[]> | undefined;
  if (pageType === "testimony") {
    const [enStories, heStories] = await Promise.all([
      getSuccessStoriesByLanguage("en"),
      getSuccessStoriesByLanguage("he"),
    ]);
    storiesByLang = { en: enStories, he: heStories };
  }

  // Build versions map keyed by language
  const versionsMap: Record<string, any> = {};
  for (const v of versions) {
    versionsMap[v.language_code] = v;
  }

  const primaryTitle =
    versionsMap.en?.title ?? versions[0].title;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Page: {primaryTitle}</h1>
      <PageForm
        pageKey={pageKey}
        pageType={pageType}
        versions={versionsMap}
        storiesByLang={storiesByLang}
      />
    </div>
  );
}
