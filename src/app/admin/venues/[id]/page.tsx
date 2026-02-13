import { notFound } from "next/navigation";
import { getVenue, getVenueEvents } from "@/lib/admin/actions";
import { VenueDetailClient } from "@/components/admin/venue-detail-client";

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

  return (
    <VenueDetailClient
      venue={venue}
      venueEvents={venueEvents}
      venueId={Number(id)}
    />
  );
}
