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

type EventRow = {
  id: number;
  event_date: string;
  start_time: string | null;
  event_type: string | null;
  is_published: boolean;
  is_cancelled: boolean;
  limit_male: number | null;
  limit_female: number | null;
  price: number | null;
  currency: string | null;
  enable_gendered_age: boolean;
  age_min: number | null;
  age_max: number | null;
  age_min_male: number | null;
  age_max_male: number | null;
  age_min_female: number | null;
  age_max_female: number | null;
  cities: { name: string } | null;
  countries: { name: string; code: string } | null;
  venues: { id: number; name: string } | null;
  _regCounts?: { males: number; females: number; total: number };
};

type SortKey = "event_date" | "city" | "venue" | "type" | "status" | "participants";

function getStatus(e: EventRow): string {
  if (e.is_cancelled) return "cancelled";
  if (!e.is_published) return "draft";
  if (e.event_date < new Date().toISOString().split("T")[0]) return "past";
  return "published";
}

function statusLabel(s: string) {
  switch (s) {
    case "cancelled": return "Cancelled";
    case "draft": return "Draft";
    case "past": return "Past";
    case "published": return "Published";
    default: return s;
  }
}

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "cancelled": return "destructive";
    case "draft": return "secondary";
    case "past": return "outline";
    default: return "default";
  }
}

function compareFn(a: EventRow, b: EventRow, key: SortKey, dir: SortDir): number {
  let cmp = 0;
  switch (key) {
    case "event_date":
      cmp = a.event_date.localeCompare(b.event_date);
      break;
    case "city":
      cmp = (a.cities?.name ?? "").localeCompare(b.cities?.name ?? "");
      break;
    case "venue":
      cmp = (a.venues?.name ?? "").localeCompare(b.venues?.name ?? "");
      break;
    case "type":
      cmp = (a.event_type ?? "").localeCompare(b.event_type ?? "");
      break;
    case "status":
      cmp = getStatus(a).localeCompare(getStatus(b));
      break;
    case "participants":
      cmp = (a._regCounts?.total ?? 0) - (b._regCounts?.total ?? 0);
      break;
  }
  return dir === "desc" ? -cmp : cmp;
}

export function EventsTable({
  events,
  regCounts,
}: {
  events: EventRow[];
  regCounts: Record<number, { males: number; females: number; total: number }>;
}) {
  const router = useRouter();
  const { countryCode } = useAdminCountry();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>("event_date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const enriched = useMemo(() =>
    events.map((e) => ({ ...e, _regCounts: regCounts[e.id] })),
    [events, regCounts]
  );

  const filtered = useMemo(() => {
    let list = enriched;

    if (countryFilter !== "all") {
      list = list.filter((e) => e.countries?.code === countryFilter);
    }

    if (statusFilter !== "all") {
      list = list.filter((e) => getStatus(e) === statusFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter((e) =>
        e.event_date.includes(term) ||
        (e.cities?.name ?? "").toLowerCase().includes(term) ||
        (e.venues?.name ?? "").toLowerCase().includes(term) ||
        (e.event_type ?? "").toLowerCase().replace("_", " ").includes(term) ||
        getStatus(e).includes(term)
      );
    }

    return list;
  }, [enriched, search, statusFilter, countryFilter]);

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
          placeholder="Search events..."
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="past">Past</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {sorted.length} of {events.length} events
        </span>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Date" sortKey="event_date" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="City" sortKey="city" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Venue" sortKey="venue" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
              <SortableHeader label="Type" sortKey="type" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
              <TableHead className="hidden md:table-cell">Age Range</TableHead>
              <SortableHeader label="M/F" sortKey="participants" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="text-center hidden md:table-cell" />
              <SortableHeader label="Status" sortKey="status" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <EmptyTableRow colSpan={7} search={search} entityName="events" />
            ) : (
              sorted.map((event) => {
                const status = getStatus(event);
                const counts = event._regCounts;
                return (
                  <TableRow
                    key={event.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/admin/events/${event.id}`)}
                  >
                    <TableCell>
                      <span className="font-medium">
                        {event.event_date}
                        {event.start_time && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            {event.start_time}
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{event.cities?.name ?? "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {event.venues ? (
                        <Link
                          href={`/admin/venues/${event.venues.id}`}
                          className="hover:underline text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {event.venues.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {event.event_type?.replace(/_/g, " ") ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {event.enable_gendered_age
                        ? `M: ${event.age_min_male ?? "?"}–${event.age_max_male ?? "?"} / F: ${event.age_min_female ?? "?"}–${event.age_max_female ?? "?"}`
                        : event.age_min || event.age_max
                          ? `${event.age_min ?? "?"}–${event.age_max ?? "?"}`
                          : "—"}
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      {counts ? (
                        <span className="text-sm">
                          <span className="text-blue-600">{counts.males}</span>
                          {" / "}
                          <span className="text-pink-600">{counts.females}</span>
                          <span className="text-muted-foreground ml-1">({counts.total})</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {event.limit_male ?? "—"}/{event.limit_female ?? "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(status)}>
                        {statusLabel(status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
