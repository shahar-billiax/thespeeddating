"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  SortableHeader, AdminSearchInput, EmptyTableRow,
  type SortDir,
} from "./admin-data-table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAdminCountry } from "@/lib/admin-country-context";

type VenueRow = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  venue_type: string | null;
  is_active: boolean;
  cities: { name: string } | null;
  countries: { name: string; code: string } | null;
};

type SortKey = "name" | "city" | "country" | "type" | "status";

function compareFn(a: VenueRow, b: VenueRow, key: SortKey, dir: SortDir): number {
  let cmp = 0;
  switch (key) {
    case "name":
      cmp = a.name.localeCompare(b.name);
      break;
    case "city":
      cmp = (a.cities?.name ?? "").localeCompare(b.cities?.name ?? "");
      break;
    case "country":
      cmp = (a.countries?.name ?? "").localeCompare(b.countries?.name ?? "");
      break;
    case "type":
      cmp = (a.venue_type ?? "").localeCompare(b.venue_type ?? "");
      break;
    case "status": {
      const aVal = a.is_active ? 1 : 0;
      const bVal = b.is_active ? 1 : 0;
      cmp = aVal - bVal;
      break;
    }
  }
  return dir === "desc" ? -cmp : cmp;
}

export function VenuesTable({ venues }: { venues: VenueRow[] }) {
  const router = useRouter();
  const { countryCode } = useAdminCountry();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>(countryCode);

  useEffect(() => {
    setCountryFilter(countryCode);
  }, [countryCode]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    let list = venues;

    if (countryFilter !== "all") {
      list = list.filter((v) => v.countries?.code === countryFilter);
    }

    if (activeFilter !== "all") {
      list = list.filter((v) =>
        activeFilter === "active" ? v.is_active : !v.is_active
      );
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter((v) =>
        v.name.toLowerCase().includes(term) ||
        (v.cities?.name ?? "").toLowerCase().includes(term) ||
        (v.countries?.name ?? "").toLowerCase().includes(term) ||
        (v.venue_type ?? "").toLowerCase().includes(term) ||
        (v.address ?? "").toLowerCase().includes(term)
      );
    }

    return list;
  }, [venues, search, activeFilter, countryFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => compareFn(a, b, sortKey, sortDir));
  }, [filtered, sortKey, sortDir]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search venues..."
        />
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="gb">United Kingdom</SelectItem>
            <SelectItem value="il">Israel</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {sorted.length} of {venues.length} venues
        </span>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="City" sortKey="city" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Country" sortKey="country" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
              <SortableHeader label="Type" sortKey="type" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
              <TableHead className="hidden md:table-cell">Address</TableHead>
              <SortableHeader label="Status" sortKey="status" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <EmptyTableRow colSpan={6} search={search} entityName="venues" />
            ) : (
              sorted.map((venue) => (
                <TableRow
                  key={venue.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/admin/venues/${venue.id}`)}
                >
                  <TableCell>
                    <span className="font-medium">{venue.name}</span>
                  </TableCell>
                  <TableCell>{venue.cities?.name ?? "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell">{venue.countries?.name ?? "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {venue.venue_type ? (
                      <Badge variant="outline" className="text-xs">{venue.venue_type}</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                    {venue.address ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={venue.is_active ? "default" : "secondary"}>
                      {venue.is_active ? "Active" : "Archived"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
