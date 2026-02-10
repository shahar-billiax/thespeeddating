import { getPageById, getCountries } from "@/lib/admin/actions";
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

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Page: {page.title}</h1>
      <PageForm page={page} countries={countries} />
    </div>
  );
}
