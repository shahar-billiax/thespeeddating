import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("what-is-speed-dating");
  return {
    title: page?.meta_title || page?.title || "What Is Speed Dating?",
    description:
      page?.meta_description ||
      "Learn how Jewish speed dating works - meet professional singles through fun 7-minute dates at trendy bars.",
  };
}

export default async function WhatIsSpeedDatingPage() {
  const page = await getPage("what-is-speed-dating");

  return (
    <CmsPageLayout
      title={page?.title || "What Is Speed Dating?"}
      contentHtml={page?.content_html ?? null}
      fallbackTitle="What Is Speed Dating?"
    />
  );
}
