import { getHostVenues } from "@/lib/host/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HostVenuesPage() {
  const venueHosts = await getHostVenues();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Venues</h1>

      {venueHosts.length === 0 ? (
        <p className="text-gray-500">
          You are not assigned to any venues yet. Contact an administrator.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {venueHosts.map((vh: any) => {
            const v = vh.venues;
            return (
              <Card key={vh.venue_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{v?.name}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {(v?.cities as any)?.name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  {v?.address && (
                    <p>
                      <span className="font-medium text-gray-700">Address:</span>{" "}
                      {v.address}
                    </p>
                  )}
                  {v?.phone && (
                    <p>
                      <span className="font-medium text-gray-700">Phone:</span>{" "}
                      <a href={`tel:${v.phone}`} className="hover:underline">
                        {v.phone}
                      </a>
                    </p>
                  )}
                  {v?.website && (
                    <p>
                      <span className="font-medium text-gray-700">Website:</span>{" "}
                      <a
                        href={v.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {v.website}
                      </a>
                    </p>
                  )}
                  {v?.transport_info && (
                    <p>
                      <span className="font-medium text-gray-700">Getting here:</span>{" "}
                      {v.transport_info}
                    </p>
                  )}
                  {v?.dress_code && (
                    <p>
                      <span className="font-medium text-gray-700">Dress code:</span>{" "}
                      {v.dress_code}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
