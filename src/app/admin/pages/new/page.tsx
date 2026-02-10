import { getCountries } from "@/lib/admin/actions";
import { PageForm } from "@/components/admin/page-form";

export default async function NewPagePage() {
  const countries = await getCountries();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Create New Page</h1>
      <PageForm countries={countries} />
    </div>
  );
}
