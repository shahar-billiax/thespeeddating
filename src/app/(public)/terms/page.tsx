import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getTranslations } from "@/lib/i18n/server";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  const page = await getPage("terms");
  return {
    title: page?.meta_title || t("meta.terms_title"),
    description: page?.meta_description || t("meta.terms_description"),
  };
}

export default async function TermsPage() {
  const { t } = await getTranslations();
  const page = await getPage("terms");

  return (
    <CmsPageLayout
      title={page?.title || t("terms.title")}
      contentHtml={page?.content_html ?? null}
      fallbackTitle={t("terms.title")}
    />
  );
}
