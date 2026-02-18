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

  let role: string | undefined;
  let compatIncomplete = false;
  if (user) {
    const [{ data: profile }, { data: compatProfile }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("compatibility_profiles" as any).select("user_id").eq("user_id", user.id).maybeSingle(),
    ]);
    role = profile?.role ?? undefined;
    compatIncomplete = !compatProfile;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader user={user ? { email: user.email!, role, compatIncomplete } : null} />
      <main id="main-content" className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
