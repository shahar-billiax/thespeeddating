import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../env";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

describe("seed data", () => {
  it("has 2 countries", async () => {
    const { data, error } = await supabase.from("countries").select("*");
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(data?.map((c) => c.code).sort()).toEqual(["gb", "il"]);
  });

  it("has 8 cities", async () => {
    const { data, error } = await supabase.from("cities").select("*");
    expect(error).toBeNull();
    expect(data).toHaveLength(8);
  });

  it("has 4 UK cities and 4 Israeli cities", async () => {
    const { data: countries } = await supabase.from("countries").select("id, code");
    const gbId = countries?.find((c) => c.code === "gb")?.id;
    const ilId = countries?.find((c) => c.code === "il")?.id;

    const { data: gbCities } = await supabase.from("cities").select("*").eq("country_id", gbId!);
    const { data: ilCities } = await supabase.from("cities").select("*").eq("country_id", ilId!);

    expect(gbCities).toHaveLength(4);
    expect(ilCities).toHaveLength(4);
  });

  it("has translations for both en and he", async () => {
    const { data: enTranslations } = await supabase
      .from("translations")
      .select("*")
      .eq("language_code", "en");

    const { data: heTranslations } = await supabase
      .from("translations")
      .select("*")
      .eq("language_code", "he");

    expect(enTranslations?.length).toBeGreaterThan(0);
    expect(heTranslations?.length).toBeGreaterThan(0);
    expect(enTranslations?.length).toBe(heTranslations?.length);
  });

  it("has email templates for both countries", async () => {
    const { data } = await supabase.from("email_templates").select("*");
    expect(data?.length).toBeGreaterThan(0);
  });
});
