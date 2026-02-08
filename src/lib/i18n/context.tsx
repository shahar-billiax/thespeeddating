"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { TranslationFn } from "./server";

interface TranslationContextValue {
  t: TranslationFn;
  locale: string;
  country: string;
}

const TranslationContext = createContext<TranslationContextValue>({
  t: (key) => key,
  locale: "en",
  country: "gb",
});

export function TranslationProvider({
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
  children: ReactNode;
}) {
  const t: TranslationFn = (key, params) => {
    let value = translations[key] || fallback[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, v);
      });
    }
    return value;
  };

  return (
    <TranslationContext.Provider value={{ t, locale, country }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
