import { getPageById, getCountries, getSuccessStoriesByCountry } from "@/lib/admin/actions";
import { PageForm } from "@/components/admin/page-form";
import { notFound } from "next/navigation";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page, countries] = await Promise.all([
    getPageById(Number(id)),
    getCountries(),
  ]);

  if (!page) {
    notFound();
  }

  // Fetch stories for testimony-type pages
  const stories =
    page.page_type === "testimony" && page.country_id
      ? await getSuccessStoriesByCountry(page.country_id)
      : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Page: {page.title}</h1>
      <PageForm page={page} countries={countries} stories={stories} />
    </div>
  );
}
