import { notFound } from "next/navigation";
import { getEvent, getEventParticipants } from "@/lib/admin/actions";
import { EventDetailClient } from "@/components/admin/event-detail-client";

export default async function EventDetailPage({
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

  const participants = await getEventParticipants(Number(id));

  return (
    <EventDetailClient
      event={event}
      participants={participants}
      eventId={Number(id)}
    />
  );
}
