import { getPage } from "@/lib/pages";
import { notFound } from "next/navigation";

export default async function OnlineDatingPage() {
  const page = await getPage("online-dating");

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
      <div
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: page.content_html }}
      />
    </div>
  );
}

export async function generateMetadata() {
  const page = await getPage("online-dating");

  if (!page) {
    return {
      title: "Online Dating",
    };
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description,
  };
}
