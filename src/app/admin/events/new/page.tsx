import { getCountries, getCities } from "@/lib/admin/actions";
import { EventForm } from "@/components/admin/event-form";

export default async function NewEventPage() {
  const [countries, cities] = await Promise.all([
    getCountries(),
    getCities(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Create Event</h1>
      <EventForm countries={countries} cities={cities} />
    </div>
  );
}
