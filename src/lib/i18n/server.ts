import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import enMessages from "./messages/en.json";
import heMessages from "./messages/he.json";

export type TranslationFn = (key: string, params?: Record<string, string>) => string;

const jsonMessages: Record<string, Record<string, string>> = {
  en: enMessages,
  he: heMessages,
};

export const getTranslations = cache(async (): Promise<{ t: TranslationFn; locale: string; country: string }> => {
  const headerStore = await headers();
  const locale = headerStore.get("x-locale") || "en";
  const country = headerStore.get("x-country") || "gb";

  const supabase = await createClient();

  // Fetch all translations for the current locale from DB
  const { data: translations } = await supabase
    .from("translations")
    .select("string_key, value")
    .eq("language_code", locale);

  // If not English, also fetch English DB translations for fallback
  let dbFallback: Record<string, string> = {};
  if (locale !== "en") {
    const { data: enTranslations } = await supabase
      .from("translations")
      .select("string_key, value")
      .eq("language_code", "en");

    dbFallback = Object.fromEntries(
      (enTranslations || []).map((t) => [t.string_key, t.value])
    );
  }

  const dbMap = Object.fromEntries(
    (translations || []).map((t) => [t.string_key, t.value])
  );

  // Merge order: JSON-en base -> JSON-locale -> DB-en -> DB-locale (last wins)
  const jsonEn = jsonMessages.en || {};
  const jsonLocale = jsonMessages[locale] || {};
  const merged = { ...jsonEn, ...jsonLocale, ...dbFallback, ...dbMap };

  const t: TranslationFn = (key, params) => {
    let value = merged[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, v);
      });
    }
    return value;
  };

  return { t, locale, country };
});

/**
 * Returns merged translation maps for passing to the client-side TranslationProvider.
 * The `translations` map is the locale-specific translations, and `fallback` is English.
 */
export const getMessages = cache(async (locale: string): Promise<{
  translations: Record<string, string>;
  fallback: Record<string, string>;
}> => {
  const supabase = await createClient();

  // Fetch DB translations for the current locale
  const { data: dbTranslations } = await supabase
    .from("translations")
    .select("string_key, value")
    .eq("language_code", locale);

  const dbMap = Object.fromEntries(
    (dbTranslations || []).map((t) => [t.string_key, t.value])
  );

  // Merge JSON + DB for current locale
  const jsonLocale = jsonMessages[locale] || {};
  const translations = { ...jsonLocale, ...dbMap };

  // Build English fallback (JSON + DB)
  let fallback: Record<string, string> = {};
  if (locale !== "en") {
    const { data: enDbTranslations } = await supabase
      .from("translations")
      .select("string_key, value")
      .eq("language_code", "en");

    const enDbMap = Object.fromEntries(
      (enDbTranslations || []).map((t) => [t.string_key, t.value])
    );

    fallback = { ...jsonMessages.en, ...enDbMap };
  }

  return { translations, fallback };
});
