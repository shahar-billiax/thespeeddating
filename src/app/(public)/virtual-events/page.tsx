import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getTranslations, getLocale } from "next-intl/server";
import { getPageFallbackHtml } from "@/lib/i18n/page-fallbacks";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const page = await getPage("virtual-events");
  return {
    title: page?.meta_title || t("meta.virtual_events_title"),
    description:
      page?.meta_description || t("meta.virtual_events_description"),
  };
}

export default async function VirtualEventsPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const page = await getPage("virtual-events");

  return (
    <CmsPageLayout
      title={page?.title || t("nav.virtual_events")}
      contentHtml={page?.content_html ?? getPageFallbackHtml("virtual-events", locale)}
      fallbackTitle={t("nav.virtual_events")}
    />
  );
}
