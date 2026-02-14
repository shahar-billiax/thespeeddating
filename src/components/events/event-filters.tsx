"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

interface EventFiltersProps {
  cities: Array<{ id: number | string; name: string }>;
}

const eventTypes = [
  "jewish_general",
  "jewish_secular",
  "jewish_traditional",
  "jewish_divorcees",
  "jewish_single_parents",
  "jewish_conservative",
  "jewish_modern_orthodox",
  "israeli",
  "party",
  "singles",
  "virtual",
];

export function EventFilters({ cities }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const currentCity = searchParams.get("city") || "all";
  const currentType = searchParams.get("type") || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Reset to page 1 when filtering
    params.delete("page");

    router.push(`/events?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/events");
  };

  const hasFilters = searchParams.has("city") || searchParams.has("type") || searchParams.has("from") || searchParams.has("to");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[180px] max-w-[280px]">
        <Select value={currentCity} onValueChange={(value) => updateFilter("city", value)}>
          <SelectTrigger className="h-10 bg-white shadow-sm border-border/60 hover:border-primary/30 hover:shadow transition-all rounded-lg text-sm font-medium">
            <SelectValue placeholder={t("events.filter_city")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.all_cities")}</SelectItem>
            {cities.map((city) => (
              <SelectItem key={String(city.id)} value={String(city.id)}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[180px] max-w-[280px]">
        <Select value={currentType} onValueChange={(value) => updateFilter("type", value)}>
          <SelectTrigger className="h-10 bg-white shadow-sm border-border/60 hover:border-primary/30 hover:shadow transition-all rounded-lg text-sm font-medium">
            <SelectValue placeholder={t("events.filter_type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.all_types")}</SelectItem>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`events.type.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
          <X className="h-3.5 w-3.5 me-1" />
          {t("events.clear_filters")}
        </Button>
      )}
    </div>
  );
}
