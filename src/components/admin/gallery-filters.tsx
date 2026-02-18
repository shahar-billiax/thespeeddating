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
import { useAdminCountry } from "@/lib/admin-country-context";

const CATEGORIES = ["events", "venues", "homepage", "success_stories", "general"];

export function GalleryFilters({
  countries,
}: {
  countries: { id: number; name: string; code: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { countryId: adminCountryId } = useAdminCountry();

  const current = {
    category: searchParams.get("category") ?? undefined,
    country: searchParams.get("country") ?? (adminCountryId ? String(adminCountryId) : undefined),
  };

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

  const hasFilters = current.category || current.country;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select
        value={current.category ?? "all"}
        onValueChange={(v) => setFilter("category", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={current.country ?? "all"}
        onValueChange={(v) => setFilter("country", v)}
      >
        <SelectTrigger className="w-[160px]">
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

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
