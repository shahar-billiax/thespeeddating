import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user needs onboarding (new users without compatibility profile)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && (next === "/" || next === "/dashboard")) {
        // Compatibility fields exist in DB but not in generated types
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("faith, wants_children, education_level")
          .eq("id", user.id)
          .single();

        const { data: compat } = await supabase
          .from("compatibility_profiles" as any)
          .select("user_id")
          .eq("user_id", user.id)
          .single();

        const needsOnboarding =
          !profile?.faith || !profile?.wants_children || !compat;

        if (needsOnboarding) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
