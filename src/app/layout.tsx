import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Providers } from "@/components/providers";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thespeeddating.co.uk"),
  title: {
    default: "TheSpeedDating - Jewish Speed Dating",
    template: "%s | TheSpeedDating",
  },
  description:
    "Jewish speed dating events in the UK and Israel. Meet like-minded singles at our fun, relaxed events.",
  openGraph: {
    type: "website",
    siteName: "TheSpeedDating",
    title: "TheSpeedDating - Jewish Speed Dating",
    description:
      "Jewish speed dating events in the UK and Israel. Meet like-minded singles at our fun, relaxed events.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const locale = headerStore.get("x-locale") || "en";
  const country = headerStore.get("x-country") || "gb";

  const supabase = await createClient();

  // Fetch translations for current locale
  const { data: currentTranslations } = await supabase
    .from("translations")
    .select("string_key, value")
    .eq("language_code", locale);

  const translations = Object.fromEntries(
    (currentTranslations || []).map((t) => [t.string_key, t.value])
  );

  // Fetch English fallback if needed
  let fallback: Record<string, string> = {};
  if (locale !== "en") {
    const { data: enTranslations } = await supabase
      .from("translations")
      .select("string_key, value")
      .eq("language_code", "en");

    fallback = Object.fromEntries(
      (enTranslations || []).map((t) => [t.string_key, t.value])
    );
  }

  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers
          translations={translations}
          fallback={fallback}
          locale={locale}
          country={country}
        >
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
