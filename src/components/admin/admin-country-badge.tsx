"use client";

import { useAdminCountry } from "@/lib/admin-country-context";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/ui/flags";

const COUNTRY_LABELS: Record<string, string> = {
  gb: "UK",
  il: "Israel",
};

export function AdminCountryBadge() {
  const { countryCode } = useAdminCountry();
  const label = COUNTRY_LABELS[countryCode] ?? countryCode.toUpperCase();

  return (
    <Badge variant="outline" className="text-xs font-normal gap-1">
      <CountryFlag
        code={countryCode}
        className="h-[10px] w-[14px] shrink-0 rounded-[1px]"
      />
      {label}
    </Badge>
  );
}
