import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { getMessages, getTranslations } from "@/lib/i18n/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const { t, country } = await getTranslations();
  const domain = country === "il"
    ? "https://www.thespeeddating.co.il"
    : "https://www.thespeeddating.co.uk";

  return {
    metadataBase: new URL(domain),
    title: {
      default: t("meta.site_title"),
      template: `%s | TheSpeedDating`,
    },
    description: t("meta.site_description"),
    openGraph: {
      type: "website",
      siteName: "TheSpeedDating",
      title: t("meta.site_title"),
      description: t("meta.site_description"),
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        en: "https://www.thespeeddating.co.uk",
        he: "https://www.thespeeddating.co.il",
        "x-default": "https://www.thespeeddating.co.uk",
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const locale = headerStore.get("x-locale") || "en";
  const country = headerStore.get("x-country") || "gb";

  const { translations, fallback } = await getMessages(locale);

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
