import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about-us");
  return {
    title: page?.meta_title || page?.title || "About Us",
    description:
      page?.meta_description ||
      "Learn about TheSpeedDating - Jewish speed dating events since May 2003. Over 120 weddings worldwide.",
  };
}

export default async function AboutPage() {
  const page = await getPage("about-us");

  return (
    <CmsPageLayout
      title={page?.title || "About Us"}
      contentHtml={page?.content_html ?? null}
      fallbackTitle="About Us"
    />
  );
}
