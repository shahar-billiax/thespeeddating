import Link from "next/link";
import { notFound } from "next/navigation";
import { getVenue } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{venue.name}</h1>
          <p className="text-muted-foreground">
            {(venue.cities as any)?.name}, {(venue.countries as any)?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={venue.is_active ? "default" : "secondary"}>
            {venue.is_active ? "Active" : "Archived"}
          </Badge>
          <Button variant="outline" asChild>
            <Link href={`/admin/venues/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold">Details</h3>
            {venue.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p>{venue.address}</p>
              </div>
            )}
            {venue.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{venue.phone}</p>
              </div>
            )}
            {venue.website && (
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <p>{venue.website}</p>
              </div>
            )}
            {venue.venue_type && (
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p>{venue.venue_type}</p>
              </div>
            )}
            {venue.dress_code && (
              <div>
                <p className="text-sm text-muted-foreground">Dress Code</p>
                <p>{venue.dress_code}</p>
              </div>
            )}
            {venue.transport_info && (
              <div>
                <p className="text-sm text-muted-foreground">Transport Info</p>
                <p>{venue.transport_info}</p>
              </div>
            )}
            {venue.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{venue.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold">Internal</h3>
            {venue.contact_person_name && (
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p>
                  {venue.contact_person_name}
                  {venue.contact_person_email &&
                    ` (${venue.contact_person_email})`}
                  {venue.contact_person_phone &&
                    ` - ${venue.contact_person_phone}`}
                </p>
              </div>
            )}
            {venue.internal_notes && (
              <div>
                <p className="text-sm text-muted-foreground">Internal Notes</p>
                <p className="whitespace-pre-wrap">{venue.internal_notes}</p>
              </div>
            )}
            {venue.map_url && (
              <div>
                <p className="text-sm text-muted-foreground">Map URL</p>
                <a
                  href={venue.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Open in Maps
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
