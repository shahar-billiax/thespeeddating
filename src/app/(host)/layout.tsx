import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HostSidebar } from "@/components/layouts/host-sidebar";
import { HostTopbar } from "@/components/layouts/host-topbar";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <HostSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <HostTopbar user={{ email: user.email! }} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
