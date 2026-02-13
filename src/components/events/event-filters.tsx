"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

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
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <div className="flex-1 min-w-[200px]">
        <Select value={currentCity} onValueChange={(value) => updateFilter("city", value)}>
          <SelectTrigger>
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

      <div className="flex-1 min-w-[200px]">
        <Select value={currentType} onValueChange={(value) => updateFilter("type", value)}>
          <SelectTrigger>
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
        <Button variant="outline" onClick={clearFilters}>
          {t("events.clear_filters")}
        </Button>
      )}
    </div>
  );
}
