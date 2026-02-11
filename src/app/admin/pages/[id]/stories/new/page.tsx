import { getPageById, getCountries } from "@/lib/admin/actions";
import { SuccessStoryForm } from "@/components/admin/success-story-form";
import { notFound } from "next/navigation";

export default async function NewStoryForPagePage({
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
      <h1 className="text-3xl font-bold">New Testimony</h1>
      <p className="text-muted-foreground">
        Adding testimony to page: {page.title}
      </p>
      <SuccessStoryForm
        countries={countries}
        defaultCountryId={page.country_id}
        returnTo={`/admin/pages/${id}/edit`}
      />
    </div>
  );
}
