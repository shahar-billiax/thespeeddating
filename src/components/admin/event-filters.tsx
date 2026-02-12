"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EVENT_TYPES = [
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

export function AdminEventFilters({
  countries,
  cities,
  current,
}: {
  countries: { id: number; name: string; code: string }[];
  cities: { id: number; name: string; country_id: number }[];
  current: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    router.push("?");
  }

  const filteredCities = current.country
    ? cities.filter((c) => c.country_id === Number(current.country))
    : cities;

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-center">
      <Select
        value={current.country ?? "all"}
        onValueChange={(v) => setFilter("country", v)}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {countries.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={current.city ?? "all"}
        onValueChange={(v) => setFilter("city", v)}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {filteredCities.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={current.status ?? "all"}
        onValueChange={(v) => setFilter("status", v)}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="past">Past</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={current.type ?? "all"}
        onValueChange={(v) => setFilter("type", v)}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {EVENT_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {Object.keys(current).some((k) =>
        ["country", "city", "status", "type"].includes(k)
      ) && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
