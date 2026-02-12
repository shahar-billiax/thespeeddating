import Link from "next/link";
import { getMembers } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/admin/pagination";
import { MemberSearch } from "@/components/admin/member-search";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { members, total, page, perPage } = await getMembers({
    page: params.page ? Number(params.page) : 1,
    search: params.search,
    gender: params.gender,
    country: params.country,
    city: params.city,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Members</h1>

      <MemberSearch current={params} />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Gender</TableHead>
              <TableHead className="hidden md:table-cell">Age</TableHead>
              <TableHead className="hidden md:table-cell">City</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((m: any) => {
                const age = m.date_of_birth
                  ? Math.floor(
                      (Date.now() - new Date(m.date_of_birth).getTime()) /
                        (365.25 * 24 * 60 * 60 * 1000)
                    )
                  : null;

                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link href={`/admin/members/${m.id}`} className="font-medium hover:underline">
                        {m.first_name} {m.last_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{m.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{m.gender}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{age ?? "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{m.cities?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={m.role === "admin" ? "default" : "secondary"}>
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {new Date(m.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination total={total} page={page} perPage={perPage} />
    </div>
  );
}
