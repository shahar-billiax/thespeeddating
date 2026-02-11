import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getTranslations } from "@/lib/i18n/server";
import { getPageFallbackHtml } from "@/lib/i18n/page-fallbacks";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  const page = await getPage("about-us");
  return {
    title: page?.meta_title || t("meta.about_title"),
    description: page?.meta_description || t("meta.about_description"),
  };
}

export default async function AboutPage() {
  const { t, locale } = await getTranslations();
  const page = await getPage("about-us");

  return (
    <CmsPageLayout
      title={page?.title || t("nav.about")}
      contentHtml={page?.content_html ?? getPageFallbackHtml("about-us", locale)}
      fallbackTitle={t("nav.about")}
    />
  );
}
