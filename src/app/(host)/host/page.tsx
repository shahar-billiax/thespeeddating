import Link from "next/link";
import { getHostEvents, getHostVenues } from "@/lib/host/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HostDashboardPage() {
  const [upcomingEvents, venues] = await Promise.all([
    getHostEvents(true),
    getHostVenues(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Your upcoming events across {venues.length} venue
          {venues.length !== 1 ? "s" : ""}
        </p>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No upcoming events at your venues.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event: any) => (
            <Link key={event.id} href={`/host/events/${event.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    {event.event_type}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {event.venues?.name} · {(event.cities as any)?.name}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(event.event_date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {event.start_time && (
                    <p className="text-sm text-gray-500">{event.start_time}</p>
                  )}
                  <div className="mt-3">
                    {event.is_cancelled ? (
                      <Badge variant="destructive">Cancelled</Badge>
                    ) : event.is_published ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
