import { notFound } from "next/navigation";
import { getEvent, getCountries, getCities } from "@/lib/admin/actions";
import { EventForm } from "@/components/admin/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let event;
  try {
    event = await getEvent(Number(id));
  } catch {
    notFound();
  }

  const [countries, cities] = await Promise.all([
    getCountries(),
    getCities(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Event</h1>
      <EventForm event={event} countries={countries} cities={cities} />
    </div>
  );
}
