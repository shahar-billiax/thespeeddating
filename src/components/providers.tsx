"use client";

import { CountryProvider } from "@/lib/country-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({
  country,
  children,
}: {
  country: string;
  children: React.ReactNode;
}) {
  return (
    <CountryProvider country={country}>
      {children}
      <Toaster />
    </CountryProvider>
  );
}
