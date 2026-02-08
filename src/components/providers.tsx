"use client";

import { TranslationProvider } from "@/lib/i18n/context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({
  translations,
  fallback,
  locale,
  country,
  children,
}: {
  translations: Record<string, string>;
  fallback: Record<string, string>;
  locale: string;
  country: string;
  children: React.ReactNode;
}) {
  return (
    <TranslationProvider
      translations={translations}
      fallback={fallback}
      locale={locale}
      country={country}
    >
      {children}
      <Toaster />
    </TranslationProvider>
  );
}
