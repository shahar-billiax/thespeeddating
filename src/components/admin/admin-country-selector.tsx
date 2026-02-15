"use client";

import { useAdminCountry } from "@/lib/admin-country-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountryFlag } from "@/components/ui/flags";
import { Check, ChevronDown } from "lucide-react";

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
}

export function AdminCountrySelector({
  countries,
}: {
  countries: Country[];
}) {
  const { countryId, setAdminCountry } = useAdminCountry();
  const router = useRouter();

  const current = countries.find((c) => c.id === countryId) ?? countries[0];

  function handleSelect(country: Country) {
    if (country.id === countryId) return;
    setAdminCountry(country.id, country.code);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <CountryFlag
            code={current.code}
            className="h-[14px] w-[19px] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
          />
          <span className="text-sm font-medium">{current.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {countries.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onSelect={() => handleSelect(c)}
            className="gap-2.5 cursor-pointer"
          >
            <CountryFlag
              code={c.code}
              className="h-[14px] w-[19px] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
            />
            <span className={c.id === countryId ? "font-semibold" : ""}>
              {c.name}
            </span>
            {c.id === countryId && (
              <Check className="ml-auto h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
