import { notFound } from "next/navigation";
import { getVenue, getCountries, getCities } from "@/lib/admin/actions";
import { VenueForm } from "@/components/admin/venue-form";

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let venue;
  try {
    venue = await getVenue(Number(id));
  } catch {
    notFound();
  }

  const [countries, cities] = await Promise.all([getCountries(), getCities()]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Venue</h1>
      <VenueForm venue={venue} countries={countries} cities={cities} />
    </div>
  );
}
