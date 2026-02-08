import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type TranslationFn = (key: string, params?: Record<string, string>) => string;

export const getTranslations = cache(async (): Promise<{ t: TranslationFn; locale: string; country: string }> => {
  const headerStore = await headers();
  const locale = headerStore.get("x-locale") || "en";
  const country = headerStore.get("x-country") || "gb";

  const supabase = await createClient();

  // Fetch all translations for the current locale
  const { data: translations } = await supabase
    .from("translations")
    .select("string_key, value")
    .eq("language_code", locale);

  // If not English, also fetch English for fallback
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

  const translationMap = Object.fromEntries(
    (translations || []).map((t) => [t.string_key, t.value])
  );

  const t: TranslationFn = (key, params) => {
    let value = translationMap[key] || fallback[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, v);
      });
    }
    return value;
  };

  return { t, locale, country };
});
