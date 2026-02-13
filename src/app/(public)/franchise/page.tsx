import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getTranslations } from "next-intl/server";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const page = await getPage("franchise-jobs");
  return {
    title: page?.meta_title || t("meta.franchise_title"),
    description:
      page?.meta_description || t("meta.franchise_description"),
  };
}

export default async function FranchisePage() {
  const t = await getTranslations();
  const page = await getPage("franchise-jobs");

  return (
    <CmsPageLayout
      title={page?.title || t("nav.franchise")}
      contentHtml={page?.content_html ?? null}
      fallbackTitle={t("nav.franchise")}
    />
  );
}
