"use server";

import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";

export async function getPage(pageKey: string) {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("page_key", pageKey)
    .eq("language_code", locale)
    .eq("is_published", true)
    .single();

  return page;
}
