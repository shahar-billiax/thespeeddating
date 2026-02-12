"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VipPlansPanel } from "@/components/admin/vip-plans-panel";
import { VipBenefitsPanel } from "@/components/admin/vip-benefits-panel";
import { VipSettingsPanel } from "@/components/admin/vip-settings-panel";

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
  const defaultCountry = countries[0]?.code ?? "gb";
  const [lang, setLang] = useState("en");

  return (
    <div className="space-y-4">
      {/* Language selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Content language:</span>
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
          const countryBenefits = benefits.filter(
            (b) => b.country_id === c.id && b.language_code === lang
          );
          const countrySetting = settings.find(
            (s) => s.country_id === c.id && s.language_code === lang
          );

          return (
            <TabsContent key={c.code} value={c.code} className="space-y-6 mt-6">
              <VipPlansPanel plans={countryPlans} country={c} />
              <VipBenefitsPanel benefits={countryBenefits} country={c} languageCode={lang} />
              <VipSettingsPanel setting={countrySetting ?? null} country={c} languageCode={lang} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
