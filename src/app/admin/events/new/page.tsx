import { getCountries, getCities, getAdminCountryId } from "@/lib/admin/actions";
import { EventForm } from "@/components/admin/event-form";

export default async function NewEventPage() {
  const [countries, cities, adminCountryId] = await Promise.all([
    getCountries(),
    getCities(),
    getAdminCountryId(),
  ]);

  return (
    <EventForm
      countries={countries}
      cities={cities}
      defaultCountryId={adminCountryId ?? undefined}
    />
  );
}
