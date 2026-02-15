"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VipPlansPanel } from "@/components/admin/vip-plans-panel";
import { VipBenefitsPanel } from "@/components/admin/vip-benefits-panel";
import { VipSettingsPanel } from "@/components/admin/vip-settings-panel";
import { useAdminCountry } from "@/lib/admin-country-context";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "he", label: "עברית" },
] as const;

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
}

interface Plan {
  id: number;
  country_id: number;
  months: number;
  price_per_month: number;
  total_price: number;
  currency: string;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
  countries?: { name: string; code: string; currency: string };
}

interface Benefit {
  id: number;
  country_id: number;
  language_code: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  countries?: { name: string; code: string };
}

interface Settings {
  id: number;
  country_id: number;
  language_code: string;
  auto_renewal_notice: string;
  countries?: { name: string; code: string };
}

export function VipAdminContent({
  plans,
  benefits,
  settings,
  countries,
}: {
  plans: Plan[];
  benefits: Benefit[];
  settings: Settings[];
  countries: Country[];
}) {
  const { countryCode: adminCountryCode } = useAdminCountry();
  const defaultCountry = countries.find((c) => c.code === adminCountryCode)?.code ?? countries[0]?.code ?? "gb";
  const [lang, setLang] = useState("en");

  // Benefits are language-global (same for all countries).
  // The DB stores them with a country_id FK, but they're really just translations.
  // Pick one set per language (from whichever country has them).
  const langBenefits = benefits.filter((b) => b.language_code === lang);
  const benefitCountryId = langBenefits[0]?.country_id;
  const displayBenefits =
    benefitCountryId != null
      ? langBenefits.filter((b) => b.country_id === benefitCountryId)
      : [];

  // Default country_id for creating new benefits/settings
  const defaultContentCountryId = benefitCountryId ?? countries[0]?.id;

  // Settings are also language-global (same notice for all countries).
  // Pick the first matching setting for this language.
  const langSettings = settings.filter((s) => s.language_code === lang);
  const displaySetting = langSettings[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Language toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Content language:
        </span>
        <div className="flex rounded-md border overflow-hidden">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                lang === l.code
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Country tabs — only pricing differs per country */}
      <Tabs defaultValue={defaultCountry}>
        <TabsList>
          {countries.map((c) => (
            <TabsTrigger key={c.code} value={c.code}>
              {c.name} ({c.currency})
            </TabsTrigger>
          ))}
        </TabsList>

        {countries.map((c) => {
          const countryPlans = plans.filter((p) => p.country_id === c.id);

          return (
            <TabsContent key={c.code} value={c.code} className="mt-4">
              <VipPlansPanel plans={countryPlans} country={c} languageCode={lang} />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Benefits — same for all countries, just translations */}
      <VipBenefitsPanel
        key={`benefits-${lang}`}
        benefits={displayBenefits}
        countryId={defaultContentCountryId}
        languageCode={lang}
      />

      {/* Settings — same for all countries, just translations */}
      <VipSettingsPanel
        key={`settings-${lang}`}
        setting={displaySetting}
        countryId={displaySetting?.country_id ?? defaultContentCountryId}
        languageCode={lang}
      />
    </div>
  );
}
