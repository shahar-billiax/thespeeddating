import Link from "next/link";
import { getVenues, getCountries, getCities } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";

export default async function AdminVenuesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { venues, total, page, perPage } = await getVenues({
    page: params.page ? Number(params.page) : 1,
    country: params.country,
    city: params.city,
    active: params.active,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Venues</h1>
        <Button asChild>
          <Link href="/admin/venues/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No venues found
                </TableCell>
              </TableRow>
            ) : (
              venues.map((venue: any) => (
                <TableRow key={venue.id}>
                  <TableCell>
                    <Link href={`/admin/venues/${venue.id}`} className="font-medium hover:underline">
                      {venue.name}
                    </Link>
                  </TableCell>
                  <TableCell>{venue.cities?.name}</TableCell>
                  <TableCell>{venue.countries?.name}</TableCell>
                  <TableCell>{venue.venue_type ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={venue.is_active ? "default" : "secondary"}>
                      {venue.is_active ? "Active" : "Archived"}
                    </Badge>
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
