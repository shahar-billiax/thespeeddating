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
    supabase
      .from("vip_plans")
      .select("*")
      .eq("country_id", countryData.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("vip_benefits")
      .select("*")
      .eq("country_id", countryData.id)
      .eq("language_code", locale)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    // Fallback: if locale differs from country default, also fetch default
    locale !== fallbackLocale
      ? supabase
          .from("vip_benefits")
          .select("*")
          .eq("country_id", countryData.id)
          .eq("language_code", fallbackLocale)
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: null }),
    supabase
      .from("vip_settings")
      .select("auto_renewal_notice")
      .eq("country_id", countryData.id)
      .eq("language_code", locale)
      .single(),
    locale !== fallbackLocale
      ? supabase
          .from("vip_settings")
          .select("auto_renewal_notice")
          .eq("country_id", countryData.id)
          .eq("language_code", fallbackLocale)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const benefits = (benefitsRes.data?.length ? benefitsRes.data : fallbackBenefitsRes.data) ?? [];
  const settings = settingsRes.data ?? fallbackSettingsRes.data;

  return {
    plans: plansRes.data ?? [],
    benefits,
    notice: settings?.auto_renewal_notice ?? "",
    currency: countryData.currency,
  };
}
