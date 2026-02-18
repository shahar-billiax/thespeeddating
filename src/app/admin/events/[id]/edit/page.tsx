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
    <EventForm event={event} countries={countries} cities={cities} />
  );
}
