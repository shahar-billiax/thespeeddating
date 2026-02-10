"use server";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";

export async function getPage(pageKey: string) {
  const { country, locale } = await getTranslations();
  const supabase = await createClient();

  // Get country ID
  const { data: countryData } = await supabase
    .from("countries")
    .select("id")
    .eq("code", country)
    .single();

  if (!countryData) return null;

  // Fetch page from DB
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("page_key", pageKey)
    .eq("country_id", countryData.id)
    .eq("language_code", locale)
    .eq("is_published", true)
    .single();

  return page;
}
