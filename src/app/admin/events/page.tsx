import Link from "next/link";
import { getAllEvents, getEventRegistrationCounts } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventsTable } from "@/components/admin/events-table";


export default async function AdminEventsPage() {
  const events = await getAllEvents();
  const eventIds = events.map((e: any) => e.id);
  const regCounts = await getEventRegistrationCounts(eventIds);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      <EventsTable events={events as any} regCounts={regCounts} />
    </div>
  );
}
