import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("dating-tips");
  return {
    title: page?.meta_title || page?.title || "Dating Tips",
    description:
      page?.meta_description ||
      "Speed dating tips and advice to help you make the most of your evening.",
  };
}

export default async function DatingTipsPage() {
  const page = await getPage("dating-tips");

  return (
    <CmsPageLayout
      title={page?.title || "Dating Tips"}
      contentHtml={page?.content_html ?? null}
      fallbackTitle="Dating Tips"
    />
  );
}
