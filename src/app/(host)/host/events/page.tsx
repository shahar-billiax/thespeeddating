import Link from "next/link";
import { getHostEvents } from "@/lib/host/actions";
import { Badge } from "@/components/ui/badge";

export default async function HostEventsPage() {
  const events = await getHostEvents();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Events</h1>

      {events.length === 0 ? (
        <p className="text-gray-500">No events found at your venues.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Event
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                  Venue
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event: any) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(event.event_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">{event.event_type}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {event.venues?.name}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {event.is_cancelled ? (
                      <Badge variant="destructive">Cancelled</Badge>
                    ) : event.is_published ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/host/events/${event.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View attendees
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
