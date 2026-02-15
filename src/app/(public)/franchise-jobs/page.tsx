import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getTranslations, getLocale } from "next-intl/server";
import { getPageFallbackHtml } from "@/lib/i18n/page-fallbacks";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const page = await getPage("franchise-jobs");
  return {
    title: page?.meta_title || t("meta.franchise_title"),
    description: page?.meta_description || t("meta.franchise_description"),
  };
}

export default async function FranchiseJobsPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const page = await getPage("franchise-jobs");

  return (
    <CmsPageLayout
      title={page?.title || t("nav.franchise")}
      contentHtml={page?.content_html ?? getPageFallbackHtml("franchise-jobs", locale)}
      fallbackTitle={t("nav.franchise")}
    />
  );
}
