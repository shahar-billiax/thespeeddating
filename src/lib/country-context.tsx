"use client";

import { createContext, useContext, type ReactNode } from "react";

const CountryContext = createContext<string>("gb");

export function CountryProvider({
  country,
  children,
}: {
  country: string;
  children: ReactNode;
}) {
  return (
    <CountryContext.Provider value={country}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}
