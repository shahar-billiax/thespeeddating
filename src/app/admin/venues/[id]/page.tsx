import { notFound } from "next/navigation";
import { getVenue, getVenueEvents, getVenueHostesses } from "@/lib/admin/actions";
import { VenueDetailClient } from "@/components/admin/venue-detail-client";
import { VenueHostesses } from "@/components/admin/venue-hostesses";

export default async function VenueDetailPage({
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

  const venueEvents = await getVenueEvents(Number(id));
  const venueHostesses = await getVenueHostesses(Number(id));

  return (
    <>
      <VenueDetailClient
        venue={venue}
        venueEvents={venueEvents}
        venueId={Number(id)}
      />
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hostesses</h2>
        <VenueHostesses venueId={Number(id)} initialHostesses={venueHostesses as any} />
      </div>
    </>
  );
}
