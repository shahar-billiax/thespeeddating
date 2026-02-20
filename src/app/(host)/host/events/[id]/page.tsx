import { notFound } from "next/navigation";
import { getHostEventWithAttendees } from "@/lib/host/actions";
import { AttendeeRow } from "./attendee-row";
import { PrintButton } from "./print-button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function HostEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) notFound();

  const { event, registrations } = await getHostEventWithAttendees(eventId);

  const checkedInCount = registrations.filter(
    (r: any) => r.checked_in_at
  ).length;
  const venue = (event as any).venues;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/host/events"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Back to events
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {(event as any).event_type}
          </h1>
          <p className="text-gray-500 mt-1">
            {venue?.name} ·{" "}
            {new Date((event as any).event_date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {(event as any).start_time && ` · ${(event as any).start_time}`}
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Venue info */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm print:hidden">
        {venue?.address && (
          <div>
            <span className="font-medium text-gray-700">Address:</span>{" "}
            <span className="text-gray-600">{venue.address}</span>
          </div>
        )}
        {venue?.transport_info && (
          <div>
            <span className="font-medium text-gray-700">Transport:</span>{" "}
            <span className="text-gray-600">{venue.transport_info}</span>
          </div>
        )}
        {(venue?.dress_code || (event as any).dress_code) && (
          <div>
            <span className="font-medium text-gray-700">Dress code:</span>{" "}
            <span className="text-gray-600">
              {(event as any).dress_code ?? venue?.dress_code}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="font-semibold text-gray-900">
            {registrations.length}
          </span>{" "}
          <span className="text-gray-500">registered</span>
        </div>
        <div>
          <span className="font-semibold text-green-700">{checkedInCount}</span>{" "}
          <span className="text-gray-500">checked in</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">
            {registrations.length - checkedInCount}
          </span>{" "}
          <span className="text-gray-500">not yet arrived</span>
        </div>
      </div>

      {/* Attendee table */}
      {registrations.length === 0 ? (
        <p className="text-gray-500">No registrations yet.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Age
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Gender
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Phone
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Payment
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 print:hidden">
                  Check-in
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.map((registration: any) => (
                <AttendeeRow
                  key={registration.id}
                  registration={registration}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
