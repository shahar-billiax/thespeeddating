import Link from "next/link";
import { getEvents, getCountries, getCities } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminEventFilters } from "@/components/admin/event-filters";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const [{ events, total, page, perPage }, countries, cities] =
    await Promise.all([
      getEvents({
        page: params.page ? Number(params.page) : 1,
        country: params.country,
        city: params.city,
        status: params.status,
        type: params.type,
        search: params.search,
      }),
      getCountries(),
      getCities(),
    ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      <AdminEventFilters
        countries={countries}
        cities={cities}
        current={params}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Age Range</TableHead>
              <TableHead className="text-center">M/F</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-medium hover:underline"
                    >
                      {event.event_date}
                      {event.start_time && (
                        <span className="text-muted-foreground ml-1">
                          {event.start_time}
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>{event.cities?.name}</TableCell>
                  <TableCell>{event.venues?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {event.event_type?.replace("_", " ") ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.enable_gendered_age
                      ? `M: ${event.age_min_male ?? "?"}–${event.age_max_male ?? "?"} / F: ${event.age_min_female ?? "?"}–${event.age_max_female ?? "?"}`
                      : event.age_min || event.age_max
                        ? `${event.age_min ?? "?"}–${event.age_max ?? "?"}`
                        : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {event.limit_male ?? "—"}/{event.limit_female ?? "—"}
                  </TableCell>
                  <TableCell>
                    {event.is_cancelled ? (
                      <Badge variant="destructive">Cancelled</Badge>
                    ) : !event.is_published ? (
                      <Badge variant="secondary">Draft</Badge>
                    ) : event.event_date <
                      new Date().toISOString().split("T")[0] ? (
                      <Badge variant="outline">Past</Badge>
                    ) : (
                      <Badge>Published</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination total={total} page={page} perPage={perPage} />
    </div>
  );
}
