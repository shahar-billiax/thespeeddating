import { getCountries, getCities, getAdminCountryId } from "@/lib/admin/actions";
import { VenueForm } from "@/components/admin/venue-form";

export default async function NewVenuePage() {
  const [countries, cities, adminCountryId] = await Promise.all([
    getCountries(),
    getCities(),
    getAdminCountryId(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Add Venue</h1>
      <VenueForm
        countries={countries}
        cities={cities}
        defaultCountryId={adminCountryId ?? undefined}
      />
    </div>
  );
}
