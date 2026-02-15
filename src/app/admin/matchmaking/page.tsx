import { getMatchmakingProfiles, getMatchmakingPackages, getCountries, getAdminCountryId } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/admin/pagination";
import { MatchmakingReview } from "@/components/admin/matchmaking-review";
import { MatchmakingPackagesPanel } from "@/components/admin/matchmaking-packages-panel";


export default async function AdminMatchmakingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const adminCountryId = await getAdminCountryId();
  const [{ profiles, total, page, perPage }, packages, countries] = await Promise.all([
    getMatchmakingProfiles({
      page: params.page ? Number(params.page) : 1,
      status: params.status,
      country: adminCountryId ? String(adminCountryId) : undefined,
    }),
    getMatchmakingPackages(adminCountryId ?? undefined),
    getCountries(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Matchmaking</h1>

      {/* Packages Section */}
      <MatchmakingPackagesPanel packages={packages} countries={countries} />

      {/* Profiles Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Applications</h2>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Gender</TableHead>
                <TableHead className="hidden md:table-cell">Package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No matchmaking profiles
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.profiles?.first_name} {p.profiles?.last_name}
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{p.profiles?.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">{p.profiles?.gender}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.package_type ?? "\u2014"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "pending_review"
                            ? "secondary"
                            : p.status === "approved" || p.status === "active"
                              ? "default"
                              : "outline"
                        }
                      >
                        {p.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <MatchmakingReview profile={p} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AdminPagination total={total} page={page} perPage={perPage} />
      </div>
    </div>
  );
}
