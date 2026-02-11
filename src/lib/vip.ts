"use server";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";

export async function getVipData(countryCode: string) {
  const supabase = await createClient();

  const { data: countryData } = await supabase
    .from("countries")
    .select("id, currency")
    .eq("code", countryCode)
    .single();

  if (!countryData) {
    return { plans: [], benefits: [], notice: "", currency: "GBP" };
  }

  const [plansRes, benefitsRes, settingsRes] = await Promise.all([
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
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("vip_settings")
      .select("auto_renewal_notice")
      .eq("country_id", countryData.id)
      .single(),
  ]);

  return {
    plans: plansRes.data ?? [],
    benefits: benefitsRes.data ?? [],
    notice: settingsRes.data?.auto_renewal_notice ?? "",
    currency: countryData.currency,
  };
}
