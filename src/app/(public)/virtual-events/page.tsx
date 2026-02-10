import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { CmsPageLayout } from "@/components/cms/cms-page-layout";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("virtual-events");
  return {
    title: page?.meta_title || page?.title || "Virtual Events",
    description:
      page?.meta_description ||
      "Join our virtual speed dating events from the comfort of your home.",
  };
}

export default async function VirtualEventsPage() {
  const page = await getPage("virtual-events");

  return (
    <CmsPageLayout
      title={page?.title || "Virtual Events"}
      contentHtml={page?.content_html ?? null}
      fallbackTitle="Virtual Events"
    />
  );
}
