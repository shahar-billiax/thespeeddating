"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, X } from "lucide-react";

type City = { id: number; name: string; country_id: number };

interface CityMultiSelectProps {
  cities: City[];
  selected: string[];
  onChange: (cities: string[]) => void;
  countryFilter?: string;
  placeholder?: string;
}

const COUNTRY_CODE_TO_ID: Record<string, number> = { gb: 1, il: 2 };

export function CityMultiSelect({
  cities,
  selected,
  onChange,
  countryFilter,
  placeholder = "Select cities...",
}: CityMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const availableCities = useMemo(() => {
    let list = cities;
    if (countryFilter && countryFilter !== "all") {
      const cid = COUNTRY_CODE_TO_ID[countryFilter];
      if (cid) list = list.filter((c) => c.country_id === cid);
    }
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter((c) => c.name.toLowerCase().includes(term));
    }
    return list;
  }, [cities, countryFilter, search]);

  function toggle(cityName: string) {
    if (selected.includes(cityName)) {
      onChange(selected.filter((c) => c !== cityName));
    } else {
      onChange([...selected, cityName]);
    }
  }

  function remove(cityName: string) {
    onChange(selected.filter((c) => c !== cityName));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between min-h-[36px] h-auto font-normal"
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((name) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className="text-xs gap-1 pr-1"
                >
                  {name}
                  <span
                    role="button"
                    tabIndex={0}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        remove(name);
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-2" align="start">
        <Input
          placeholder="Search cities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm mb-2"
        />
        <div className="max-h-[200px] overflow-y-auto space-y-0.5">
          {availableCities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              No cities found
            </p>
          ) : (
            availableCities.map((city) => (
              <label
                key={city.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
              >
                <Checkbox
                  checked={selected.includes(city.name)}
                  onCheckedChange={() => toggle(city.name)}
                />
                {city.name}
              </label>
            ))
          )}
        </div>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs h-7"
            onClick={() => onChange([])}
          >
            Clear all
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
