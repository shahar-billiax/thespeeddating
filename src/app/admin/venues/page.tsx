import Link from "next/link";
import { getAllVenues } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VenuesTable } from "@/components/admin/venues-table";

export default async function AdminVenuesPage() {
  const venues = await getAllVenues();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Venues</h1>
        <Button asChild>
          <Link href="/admin/venues/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
          </Link>
        </Button>
      </div>

      <VenuesTable venues={venues as any} />
    </div>
  );
}
