import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { AdminTopbar } from "@/components/layouts/admin-topbar";
import { AdminCountryProvider } from "@/lib/admin-country-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: countries } = await supabase
    .from("countries")
    .select("id, name, code, currency")
    .eq("is_active", true)
    .order("name");

  const countryList = countries ?? [];

  const cookieStore = await cookies();
  const adminCountryCookie = cookieStore.get("admin_country")?.value;
  let initialCountryId = countryList[0]?.id ?? 1;
  let initialCountryCode = countryList[0]?.code ?? "gb";

  if (adminCountryCookie) {
    const [idStr, code] = adminCountryCookie.split(":");
    const id = Number(idStr);
    if (id && code && countryList.some((c) => c.id === id)) {
      initialCountryId = id;
      initialCountryCode = code;
    }
  }

  return (
    <AdminCountryProvider
      initialCountryId={initialCountryId}
      initialCountryCode={initialCountryCode}
    >
      <div className="flex min-h-screen" dir="ltr">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminTopbar
            user={{ email: user?.email || "" }}
            countries={countryList}
          />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AdminCountryProvider>
  );
}
