"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VipPlansPanel } from "@/components/admin/vip-plans-panel";
import { VipBenefitsPanel } from "@/components/admin/vip-benefits-panel";
import { VipSettingsPanel } from "@/components/admin/vip-settings-panel";

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

  return (
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
        const countryBenefits = benefits.filter((b) => b.country_id === c.id);
        const countrySetting = settings.find((s) => s.country_id === c.id);

        return (
          <TabsContent key={c.code} value={c.code} className="space-y-6 mt-6">
            <VipPlansPanel plans={countryPlans} country={c} />
            <VipBenefitsPanel benefits={countryBenefits} country={c} />
            <VipSettingsPanel setting={countrySetting ?? null} country={c} />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
