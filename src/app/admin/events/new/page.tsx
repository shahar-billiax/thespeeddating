import { getCountries, getCities, getAdminCountryId } from "@/lib/admin/actions";
import { EventForm } from "@/components/admin/event-form";

export default async function NewEventPage() {
  const [countries, cities, adminCountryId] = await Promise.all([
    getCountries(),
    getCities(),
    getAdminCountryId(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Create Event</h1>
      <EventForm
        countries={countries}
        cities={cities}
        defaultCountryId={adminCountryId ?? undefined}
      />
    </div>
  );
}
