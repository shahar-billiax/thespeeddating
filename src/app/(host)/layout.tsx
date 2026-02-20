import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-lg text-gray-900">
            Host Portal
          </span>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/host"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/host/events"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Events
            </Link>
            <Link
              href="/host/venues"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Venues
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            {profile?.first_name} {profile?.last_name}
          </span>
          <Link href="/" className="hover:text-gray-900">
            Back to site
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
