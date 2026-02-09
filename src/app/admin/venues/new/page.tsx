import { getCountries, getCities } from "@/lib/admin/actions";
import { VenueForm } from "@/components/admin/venue-form";

export default async function NewVenuePage() {
  const [countries, cities] = await Promise.all([getCountries(), getCities()]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Add Venue</h1>
      <VenueForm countries={countries} cities={cities} />
    </div>
  );
}
