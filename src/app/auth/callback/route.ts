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
        // Check the same required fields that getInitialStep uses
        const [{ data: profile }, { data: compat }] = await Promise.all([
          (supabase as any)
            .from("profiles")
            .select("faith, religion_importance, practice_frequency, wants_children, career_ambition, work_life_philosophy, education_level")
            .eq("id", user.id)
            .single(),
          supabase
            .from("compatibility_profiles" as any)
            .select("user_id")
            .eq("user_id", user.id)
            .single(),
        ]);

        const needsOnboarding =
          !profile?.faith ||
          profile?.religion_importance == null || profile?.religion_importance === "" ||
          !profile?.practice_frequency ||
          !profile?.wants_children ||
          profile?.career_ambition == null || profile?.career_ambition === "" ||
          profile?.work_life_philosophy == null || profile?.work_life_philosophy === "" ||
          profile?.education_level == null || profile?.education_level === "" ||
          !compat;

        if (needsOnboarding) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
