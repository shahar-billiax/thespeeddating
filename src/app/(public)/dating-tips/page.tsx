import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getTranslations, getLocale } from "next-intl/server";
import { getPageFallbackHtml } from "@/lib/i18n/page-fallbacks";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const page = await getPage("dating-tips");
  return {
    title: page?.meta_title || t("meta.dating_tips_title"),
    description:
      page?.meta_description || t("meta.dating_tips_description"),
  };
}

export default async function DatingTipsPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const page = await getPage("dating-tips");

  return (
    <CmsPageLayout
      title={page?.title || t("nav.dating_tips")}
      contentHtml={page?.content_html ?? getPageFallbackHtml("dating-tips", locale)}
      fallbackTitle={t("nav.dating_tips")}
    />
  );
}
