import { headers, cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import enMessages from "@/lib/i18n/messages/en.json";
import heMessages from "@/lib/i18n/messages/he.json";

const VALID_LOCALES = ["en", "he"] as const;
type Locale = (typeof VALID_LOCALES)[number];

const staticMessages: Record<Locale, Record<string, unknown>> = {
  en: enMessages,
  he: heMessages,
};

function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value as Locale);
}

/** Convert legacy {{var}} placeholders to ICU {var} format */
function toIcu(value: string): string {
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) => `{${name}}`);
}

/**
 * Flatten a nested messages object into dot-notation keys.
 * e.g. { nav: { events: "Events" } } → { "nav.events": "Events" }
 */
function flattenMessages(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(
        result,
        flattenMessages(value as Record<string, unknown>, fullKey)
      );
    } else if (typeof value === "string") {
      result[fullKey] = value;
    }
  }
  return result;
}

/**
 * Unflatten dot-notation keys back into nested object.
 * e.g. { "nav.events": "Events" } → { nav: { events: "Events" } }
 */
function unflattenMessages(
  flat: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== "object") {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

export default getRequestConfig(async () => {
  // Read locale from middleware header, then cookie fallback
  const headerStore = await headers();
  const headerLocale = headerStore.get("x-locale");

  let locale: Locale = "en";
  if (headerLocale && isValidLocale(headerLocale)) {
    locale = headerLocale;
  } else {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("locale")?.value;
    if (cookieLocale && isValidLocale(cookieLocale)) {
      locale = cookieLocale;
    }
  }

  // Start with static JSON messages (nested format)
  const baseMessages = staticMessages.en;
  const localeMessages = staticMessages[locale];

  // Flatten for merging with DB overrides
  const flatBase = flattenMessages(baseMessages as Record<string, unknown>);
  const flatLocale = flattenMessages(localeMessages as Record<string, unknown>);

  // Fetch DB translation overrides
  let dbFallback: Record<string, string> = {};
  let dbLocale: Record<string, string> = {};

  try {
    const supabase = await createClient();

    const { data: localeTranslations } = await supabase
      .from("translations")
      .select("string_key, value")
      .eq("language_code", locale);

    dbLocale = Object.fromEntries(
      (localeTranslations || []).map((t) => [t.string_key, toIcu(t.value)])
    );

    if (locale !== "en") {
      const { data: enTranslations } = await supabase
        .from("translations")
        .select("string_key, value")
        .eq("language_code", "en");

      dbFallback = Object.fromEntries(
        (enTranslations || []).map((t) => [t.string_key, toIcu(t.value)])
      );
    }
  } catch {
    // DB unavailable — continue with static messages only
  }

  // Merge order: JSON-en base → JSON-locale → DB-en → DB-locale (last wins)
  const merged = { ...flatBase, ...flatLocale, ...dbFallback, ...dbLocale };

  // Convert back to nested format for next-intl
  const messages = unflattenMessages(merged);

  return {
    locale,
    messages,
  };
});
