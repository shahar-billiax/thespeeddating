import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getTranslations } from "@/lib/i18n/server";
import { getPageFallbackHtml } from "@/lib/i18n/page-fallbacks";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  const page = await getPage("what-is-speed-dating");
  return {
    title: page?.meta_title || t("meta.what_is_speed_dating_title"),
    description:
      page?.meta_description ||
      t("meta.what_is_speed_dating_description"),
  };
}

export default async function WhatIsSpeedDatingPage() {
  const { t, locale } = await getTranslations();
  const page = await getPage("what-is-speed-dating");

  return (
    <CmsPageLayout
      title={page?.title || t("nav.what_is_speed_dating")}
      contentHtml={page?.content_html ?? getPageFallbackHtml("what-is-speed-dating", locale)}
      fallbackTitle={t("nav.what_is_speed_dating")}
    />
  );
}
