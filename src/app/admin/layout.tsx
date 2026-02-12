import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { AdminTopbar } from "@/components/layouts/admin-topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen" dir="ltr">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar user={{ email: user?.email || "" }} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
