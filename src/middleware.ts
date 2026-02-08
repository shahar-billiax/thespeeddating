import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DOMAIN_COUNTRY_MAP: Record<string, string> = {
  "thespeeddating.co.uk": "gb",
  "thespeeddating.co.il": "il",
};

const COUNTRY_LOCALE_MAP: Record<string, string> = {
  gb: "en",
  il: "he",
};

function detectCountry(request: NextRequest): string {
  // Cookie override (for dev)
  const cookieCountry = request.cookies.get("country")?.value;
  if (cookieCountry && COUNTRY_LOCALE_MAP[cookieCountry]) {
    return cookieCountry;
  }

  // Domain-based detection
  const hostname = request.headers.get("host")?.split(":")[0] || "";
  return DOMAIN_COUNTRY_MAP[hostname] || "gb";
}

export async function middleware(request: NextRequest) {
  // 1. Country detection
  const country = detectCountry(request);
  const locale = COUNTRY_LOCALE_MAP[country] || "en";

  // 2. Create Supabase client with cookie handling
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Admin protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Set country/locale headers for downstream use
  response.headers.set("x-country", country);
  response.headers.set("x-locale", locale);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
