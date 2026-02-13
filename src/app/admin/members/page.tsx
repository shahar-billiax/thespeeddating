import { getAllMembers } from "@/lib/admin/actions";
import { MembersTable } from "@/components/admin/members-table";

export default async function AdminMembersPage() {
  const members = await getAllMembers();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold">Members</h1>
      <MembersTable members={members as any} />
    </div>
  );
}
