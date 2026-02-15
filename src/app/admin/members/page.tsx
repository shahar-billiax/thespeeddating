import { getAllMembers, getCities, getMemberEventActivity } from "@/lib/admin/actions";
import { MembersTable } from "@/components/admin/members-table";


export default async function AdminMembersPage() {
  const [members, cities, eventActivity] = await Promise.all([
    getAllMembers(),
    getCities(),
    getMemberEventActivity(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold">Members</h1>
      <MembersTable
        members={members as any}
        cities={cities}
        eventActivity={eventActivity}
      />
    </div>
  );
}
