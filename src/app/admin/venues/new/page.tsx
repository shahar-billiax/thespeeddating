import { getCountries, getCities, getAdminCountryId } from "@/lib/admin/actions";
import { VenueForm } from "@/components/admin/venue-form";

export default async function NewVenuePage() {
  const [countries, cities, adminCountryId] = await Promise.all([
    getCountries(),
    getCities(),
    getAdminCountryId(),
  ]);

  return (
    <VenueForm
      countries={countries}
      cities={cities}
      defaultCountryId={adminCountryId ?? undefined}
    />
  );
}
