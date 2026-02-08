"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const countries = [
  { code: "gb", label: "UK", flag: "🇬🇧" },
  { code: "il", label: "Israel", flag: "🇮🇱" },
];

export function CountrySwitcher() {
  const { country } = useTranslation();
  const current = countries.find((c) => c.code === country) || countries[0];

  function switchCountry(code: string) {
    document.cookie = `country=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span>{current.flag} {current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {countries.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => switchCountry(c.code)}
            className={c.code === country ? "font-semibold" : ""}
          >
            {c.flag} {c.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
