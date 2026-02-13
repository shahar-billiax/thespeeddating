"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useCountry } from "@/lib/country-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  SVG flag components — 4:3 aspect ratio (viewBox 60×45)            */
/* ------------------------------------------------------------------ */

function FlagGB({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 45"
      className={className}
      role="img"
      aria-label="UK flag"
    >
      <clipPath id="gb-clip">
        <rect width="60" height="45" rx="3" />
      </clipPath>
      <g clipPath="url(#gb-clip)">
        <rect width="60" height="45" fill="#012169" />
        <path d="M0,0 L60,45 M60,0 L0,45" stroke="#fff" strokeWidth="9" />
        <path d="M0,0 L60,45 M60,0 L0,45" stroke="#C8102E" strokeWidth="3" />
        <path d="M30,0 V45 M0,22.5 H60" stroke="#fff" strokeWidth="15" />
        <path d="M30,0 V45 M0,22.5 H60" stroke="#C8102E" strokeWidth="9" />
      </g>
    </svg>
  );
}

function FlagIL({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 45"
      className={className}
      role="img"
      aria-label="Israel flag"
    >
      <clipPath id="il-clip">
        <rect width="60" height="45" rx="3" />
      </clipPath>
      <g clipPath="url(#il-clip)">
        <rect width="60" height="45" fill="#fff" />
        <rect y="5" width="60" height="7" fill="#0038b8" />
        <rect y="33" width="60" height="7" fill="#0038b8" />
        <g
          fill="none"
          stroke="#0038b8"
          strokeWidth="1.6"
          transform="translate(30,22.5)"
        >
          <polygon points="0,-10 8.66,5 -8.66,5" />
          <polygon points="0,10 8.66,-5 -8.66,-5" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared data + helpers (exported for mobile menu reuse)            */
/* ------------------------------------------------------------------ */

export const REGIONS = [
  { code: "gb", labelKey: "country.uk", Flag: FlagGB },
  { code: "il", labelKey: "country.israel", Flag: FlagIL },
] as const;

export const LANGUAGES = [
  { code: "en", nativeName: "English" },
  { code: "he", nativeName: "עברית" },
] as const;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function switchRegion(code: string) {
  document.cookie = `country=${code}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  window.location.reload();
}

export function switchLanguage(code: string) {
  document.cookie = `locale=${code}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  window.location.reload();
}

/* ------------------------------------------------------------------ */
/*  Desktop dropdown component                                        */
/* ------------------------------------------------------------------ */

const FLAG_CLASSES =
  "h-[14px] w-[19px] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.1)]";

export function RegionLanguageSelector() {
  const t = useTranslations();
  const locale = useLocale();
  const country = useCountry();

  const currentRegion = REGIONS.find((r) => r.code === country) ?? REGIONS[0];
  const CurrentFlag = currentRegion.Flag;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2.5 focus-visible:ring-0 focus-visible:border-transparent data-[state=open]:bg-accent"
        >
          <CurrentFlag className={FLAG_CLASSES} />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {locale}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Region section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
            {t("switcher.region")}
          </DropdownMenuLabel>
          {REGIONS.map((r) => {
            const isActive = r.code === country;
            return (
              <DropdownMenuItem
                key={r.code}
                onSelect={() => switchRegion(r.code)}
                className="cursor-pointer gap-2.5"
              >
                <r.Flag className={FLAG_CLASSES} />
                <span className={isActive ? "font-semibold" : ""}>
                  {t(r.labelKey)}
                </span>
                {isActive && (
                  <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Language section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
            {t("switcher.language")}
          </DropdownMenuLabel>
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === locale;
            return (
              <DropdownMenuItem
                key={lang.code}
                onSelect={() => switchLanguage(lang.code)}
                className="cursor-pointer gap-2.5"
              >
                <span className={isActive ? "font-semibold" : ""}>
                  {lang.nativeName}
                </span>
                {isActive && (
                  <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
