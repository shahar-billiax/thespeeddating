import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/layouts/public-header";
import { PublicFooter } from "@/components/layouts/public-footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader user={user ? { email: user.email! } : null} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
