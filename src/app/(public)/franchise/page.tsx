import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("franchise-jobs");
  return {
    title: page?.meta_title || page?.title || "Franchise & Jobs",
    description:
      page?.meta_description ||
      "Franchise opportunities and job openings at TheSpeedDating.",
  };
}

export default async function FranchisePage() {
  const page = await getPage("franchise-jobs");

  return (
    <CmsPageLayout
      title={page?.title || "Franchise & Jobs"}
      contentHtml={page?.content_html ?? null}
      fallbackTitle="Franchise & Jobs"
    />
  );
}
