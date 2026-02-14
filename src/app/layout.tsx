import type { Metadata } from "next";
import { Geist, Geist_Mono, Heebo } from "next/font/google";
import { headers } from "next/headers";
import { getTranslations, getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
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

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const headerStore = await headers();
  const country = headerStore.get("x-country") || "gb";
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
  const locale = await getLocale();
  const messages = await getMessages();
  const headerStore = await headers();
  const country = headerStore.get("x-country") || "gb";

  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${heebo.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers country={country}>
            {children}
            <CookieConsent />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
