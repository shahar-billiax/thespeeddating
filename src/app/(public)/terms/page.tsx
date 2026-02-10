import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("terms");
  return {
    title: page?.meta_title || page?.title || "Terms & Conditions",
    description:
      page?.meta_description ||
      "Terms and Conditions for TheSpeedDating.",
  };
}

export default async function TermsPage() {
  const page = await getPage("terms");

  return (
    <CmsPageLayout
      title={page?.title || "Terms & Conditions"}
      contentHtml={page?.content_html ?? null}
      fallbackTitle="Terms & Conditions"
    />
  );
}
