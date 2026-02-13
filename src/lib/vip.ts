"use server";

import { createClient } from "@/lib/supabase/server";

export async function getVipData(countryCode: string, locale: string) {
  const supabase = await createClient();

  const { data: countryData } = await supabase
    .from("countries")
    .select("id, currency, default_locale")
    .eq("code", countryCode)
    .single();

  if (!countryData) {
    return { plans: [], benefits: [], notice: "", currency: "GBP" };
  }

  const fallbackLocale = countryData.default_locale ?? "en";

  const [plansRes, benefitsRes, fallbackBenefitsRes, settingsRes, fallbackSettingsRes] = await Promise.all([
    // Plans are country-specific
    supabase
      .from("vip_plans")
      .select("*")
      .eq("country_id", countryData.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    // Benefits are language-only (shared across countries)
    supabase
      .from("vip_benefits")
      .select("*")
      .eq("language_code", locale)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    // Fallback benefits: default locale if requested locale has none
    locale !== fallbackLocale
      ? supabase
          .from("vip_benefits")
          .select("*")
          .eq("language_code", fallbackLocale)
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: null }),
    // Settings are language-only (shared across countries)
    supabase
      .from("vip_settings")
      .select("auto_renewal_notice")
      .eq("language_code", locale)
      .limit(1)
      .single(),
    // Fallback settings: default locale
    locale !== fallbackLocale
      ? supabase
          .from("vip_settings")
          .select("auto_renewal_notice")
          .eq("language_code", fallbackLocale)
          .limit(1)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  // Benefits: use requested locale, deduplicate to one country's set, fallback to default locale
  const rawBenefits = benefitsRes.data?.length ? benefitsRes.data : fallbackBenefitsRes?.data ?? [];
  const firstCountryId = rawBenefits[0]?.country_id;
  const benefits = firstCountryId != null
    ? rawBenefits.filter((b: { country_id: number }) => b.country_id === firstCountryId)
    : [];

  const settings = settingsRes.data ?? fallbackSettingsRes?.data;

  return {
    plans: plansRes.data ?? [],
    benefits,
    notice: settings?.auto_renewal_notice ?? "",
    currency: countryData.currency,
  };
}
