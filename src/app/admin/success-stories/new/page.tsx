import { getCountries } from "@/lib/admin/actions";
import { SuccessStoryForm } from "@/components/admin/success-story-form";

export default async function NewSuccessStoryPage() {
  const countries = await getCountries();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">New Success Story</h1>
      <SuccessStoryForm countries={countries} />
    </div>
  );
}
