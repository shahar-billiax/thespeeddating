"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  SortableHeader, EmptyTableRow,
  type SortDir,
} from "./admin-data-table";
import {
  Sheet, SheetContent, SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown, Crown, ExternalLink, Filter, LayoutGrid, List, X } from "lucide-react";
import { useAdminCountry } from "@/lib/admin-country-context";
import {
  MembersFilterPanel,
  countActiveFilters,
  DEFAULT_FILTERS,
  type MembersFilterState,
} from "./members-filter-panel";
import { MembersCardView } from "./members-card-view";

// ─── Types ──────────────────────────────────────────────────

type MemberRow = {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone: string | null;
  home_phone: string | null;
  mobile_phone: string | null;
  work_phone: string | null;
  gender: string;
  date_of_birth: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  faith: string | null;
  relationship_status: string | null;
  has_children: boolean | null;
  subscribed_email: boolean;
  subscribed_phone: boolean;
  subscribed_sms: boolean;
  occupation: string | null;
  education: string | null;
  sexual_preference: string | null;
  admin_comments: string | null;
  bio: string | null;
  city_id: number | null;
  cities: { name: string } | null;
  countries: { name: string; code: string } | null;
};

type City = { id: number; name: string; country_id: number };

type SortKey = "name" | "email" | "gender" | "age" | "city" | "role" | "joined" | "status";

type ViewMode = "table" | "grid";

// ─── Helpers ────────────────────────────────────────────────

function getAge(dob: string): number | null {
  if (!dob) return null;
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

function compareFn(a: MemberRow, b: MemberRow, key: SortKey, dir: SortDir): number {
  let cmp = 0;
  switch (key) {
    case "name":
      cmp = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      break;
    case "email":
      cmp = a.email.localeCompare(b.email);
      break;
    case "gender":
      cmp = a.gender.localeCompare(b.gender);
      break;
    case "age": {
      const aAge = getAge(a.date_of_birth) ?? 0;
      const bAge = getAge(b.date_of_birth) ?? 0;
      cmp = aAge - bAge;
      break;
    }
    case "city":
      cmp = (a.cities?.name ?? "").localeCompare(b.cities?.name ?? "");
      break;
    case "role":
      cmp = a.role.localeCompare(b.role);
      break;
    case "joined":
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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

// ─── Table row ──────────────────────────────────────────────

function MemberRowItem({ member: m, isVip }: { member: MemberRow; isVip: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const age = getAge(m.date_of_birth);

  return (
    <>
      <TableRow
        className="cursor-pointer lg:cursor-default"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <TableCell>
          <div className="flex items-center gap-1">
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform lg:hidden ${
                expanded ? "rotate-180" : ""
              }`}
            />
            <Link
              href={`/admin/members/${m.id}`}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {m.first_name} {m.last_name}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </Link>
            {isVip && (
              <span className="inline-flex items-center text-amber-600 text-[10px] font-semibold leading-none" title="Active VIP subscription">
                <Crown className="h-3 w-3" />
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-sm hidden lg:table-cell max-w-[150px] truncate">{m.email}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant="outline"
            className={m.gender === "male" ? "border-blue-300 text-blue-600" : "border-pink-300 text-pink-600"}
          >
            {m.gender}
          </Badge>
        </TableCell>
        <TableCell className="hidden lg:table-cell">{age ?? "—"}</TableCell>
        <TableCell className="hidden lg:table-cell">{m.cities?.name ?? "—"}</TableCell>
        <TableCell>
          <Badge variant={m.role === "admin" ? "default" : m.role === "host" || m.role === "host_plus" ? "outline" : "secondary"}>
            {m.role}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge variant={m.is_active ? "default" : "destructive"} className="text-xs">
            {m.is_active ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground hidden xl:table-cell">
          {new Date(m.created_at).toLocaleDateString("en-GB")}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="lg:hidden bg-muted/30">
          <TableCell colSpan={8} className="py-2 px-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="break-all">{m.email}</span>
              </div>
              <div className="md:hidden">
                <span className="text-muted-foreground">Gender: </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${m.gender === "male" ? "border-blue-300 text-blue-600" : "border-pink-300 text-pink-600"}`}
                >
                  {m.gender}
                </Badge>
              </div>
              <div className="md:hidden">
                <span className="text-muted-foreground">Status: </span>
                <Badge variant={m.is_active ? "default" : "destructive"} className="text-xs">
                  {m.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Age: </span>
                <span>{age ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">City: </span>
                <span>{m.cities?.name ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Joined: </span>
                <span>{new Date(m.created_at).toLocaleDateString("en-GB")}</span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Active filter chips ────────────────────────────────────

function ActiveFilterChips({
  filters,
  onFilterChange,
  onClearAll,
}: {
  filters: MembersFilterState;
  onFilterChange: <K extends keyof MembersFilterState>(key: K, value: MembersFilterState[K]) => void;
  onClearAll: () => void;
}) {
  const chips: { label: string; clear: () => void }[] = [];

  if (filters.countryFilter !== "all") {
    chips.push({
      label: `Country: ${filters.countryFilter.toUpperCase()}`,
      clear: () => onFilterChange("countryFilter", "all"),
    });
  }
  if (filters.genderFilter !== "all") {
    chips.push({
      label: `Gender: ${filters.genderFilter}`,
      clear: () => onFilterChange("genderFilter", "all"),
    });
  }
  if (filters.roleFilter !== "all") {
    chips.push({
      label: `Role: ${filters.roleFilter}`,
      clear: () => onFilterChange("roleFilter", "all"),
    });
  }
  if (filters.statusFilter !== "all") {
    chips.push({
      label: `${filters.statusFilter === "yes" ? "Active" : "Inactive"}`,
      clear: () => onFilterChange("statusFilter", "all"),
    });
  }
  if (filters.selectedCities.length > 0) {
    chips.push({
      label: `Cities: ${filters.selectedCities.join(", ")}`,
      clear: () => onFilterChange("selectedCities", []),
    });
  }
  if (filters.ageMin !== null || filters.ageMax !== null) {
    chips.push({
      label: `Age: ${filters.ageMin ?? 18}–${filters.ageMax ?? 90}`,
      clear: () => {
        onFilterChange("ageMin", null);
        onFilterChange("ageMax", null);
      },
    });
  }
  if (filters.faithFilter !== "all") {
    chips.push({
      label: `Faith: ${filters.faithFilter.replace(/_/g, " ")}`,
      clear: () => onFilterChange("faithFilter", "all"),
    });
  }
  if (filters.relationshipFilter !== "all") {
    chips.push({
      label: `Relationship: ${filters.relationshipFilter}`,
      clear: () => onFilterChange("relationshipFilter", "all"),
    });
  }
  if (filters.hasChildrenFilter !== "all") {
    chips.push({
      label: `Children: ${filters.hasChildrenFilter}`,
      clear: () => onFilterChange("hasChildrenFilter", "all"),
    });
  }
  if (filters.lookingForFilter !== "all") {
    chips.push({
      label: `Looking for: ${filters.lookingForFilter}`,
      clear: () => onFilterChange("lookingForFilter", "all"),
    });
  }
  if (filters.educationFilter !== "all") {
    chips.push({
      label: `Education: ${filters.educationFilter}`,
      clear: () => onFilterChange("educationFilter", "all"),
    });
  }
  if (filters.occupationSearch) {
    chips.push({
      label: `Profession: ${filters.occupationSearch}`,
      clear: () => onFilterChange("occupationSearch", ""),
    });
  }
  if (filters.subscribedEmail !== "all") {
    chips.push({
      label: `Email: ${filters.subscribedEmail}`,
      clear: () => onFilterChange("subscribedEmail", "all"),
    });
  }
  if (filters.subscribedPhone !== "all") {
    chips.push({
      label: `Phone sub: ${filters.subscribedPhone}`,
      clear: () => onFilterChange("subscribedPhone", "all"),
    });
  }
  if (filters.subscribedSms !== "all") {
    chips.push({
      label: `SMS: ${filters.subscribedSms}`,
      clear: () => onFilterChange("subscribedSms", "all"),
    });
  }
  if (filters.registeredWithinMonths !== null) {
    chips.push({
      label: `Registered: last ${filters.registeredWithinMonths}mo`,
      clear: () => onFilterChange("registeredWithinMonths", null),
    });
  }
  if (filters.eventWithinMonths !== null) {
    chips.push({
      label: `Event: last ${filters.eventWithinMonths}mo`,
      clear: () => onFilterChange("eventWithinMonths", null),
    });
  }
  if (filters.hasComments !== "all") {
    chips.push({
      label: `Comments: ${filters.hasComments}`,
      clear: () => onFilterChange("hasComments", "all"),
    });
  }
  if (filters.vipFilter !== "all") {
    chips.push({
      label: `VIP: ${filters.vipFilter === "yes" ? "Yes" : "No"}`,
      clear: () => onFilterChange("vipFilter", "all"),
    });
  }
  if (filters.hasPhoto !== "all") {
    chips.push({
      label: `Photo: ${filters.hasPhoto === "yes" ? "Yes" : "No"}`,
      clear: () => onFilterChange("hasPhoto", "all"),
    });
  }
  if (filters.hasBio !== "all") {
    chips.push({
      label: `Bio: ${filters.hasBio === "yes" ? "Yes" : "No"}`,
      clear: () => onFilterChange("hasBio", "all"),
    });
  }
  if (filters.eventCountFilter !== "all") {
    const labels: Record<string, string> = {
      "0": "Never attended",
      "1+": "1+ events",
      "3+": "3+ events",
      "5+": "5+ events",
      "10+": "10+ events",
    };
    chips.push({
      label: `Events: ${labels[filters.eventCountFilter] ?? filters.eventCountFilter}`,
      clear: () => onFilterChange("eventCountFilter", "all"),
    });
  }
  if (filters.updatedWithinMonths !== null) {
    chips.push({
      label: `Updated: last ${filters.updatedWithinMonths}mo`,
      clear: () => onFilterChange("updatedWithinMonths", null),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {chips.map((chip) => (
        <Badge
          key={chip.label}
          variant="secondary"
          className="text-xs gap-1 pr-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={chip.clear}
        >
          {chip.label}
          <X className="h-3 w-3" />
        </Badge>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-destructive ml-1 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────

export function MembersTable({
  members,
  cities,
  eventActivity,
  eventCounts = {},
  vipUserIds = [],
}: {
  members: MemberRow[];
  cities: City[];
  eventActivity: Record<string, string>;
  eventCounts?: Record<string, number>;
  vipUserIds?: string[];
}) {
  const vipSet = useMemo(() => new Set(vipUserIds), [vipUserIds]);
  const { countryCode } = useAdminCountry();

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey | null>("joined");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // View state — always init as "table" to avoid hydration mismatch
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  useEffect(() => {
    const saved = localStorage.getItem("members-view") as ViewMode | null;
    if (saved === "table" || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  // Filter state
  const [filters, setFilters] = useState<MembersFilterState>({
    ...DEFAULT_FILTERS,
    countryFilter: countryCode,
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, countryFilter: countryCode }));
  }, [countryCode]);

  useEffect(() => {
    localStorage.setItem("members-view", viewMode);
  }, [viewMode]);

  // Clear city selections when country changes
  useEffect(() => {
    if (filters.countryFilter === "all") return;
    const COUNTRY_CODE_TO_ID: Record<string, number> = { gb: 1, il: 2 };
    const cid = COUNTRY_CODE_TO_ID[filters.countryFilter];
    if (!cid) return;
    const validCityNames = new Set(
      cities.filter((c) => c.country_id === cid).map((c) => c.name)
    );
    const cleaned = filters.selectedCities.filter((name) =>
      validCityNames.has(name)
    );
    if (cleaned.length !== filters.selectedCities.length) {
      setFilters((prev) => ({ ...prev, selectedCities: cleaned }));
    }
  }, [filters.countryFilter, filters.selectedCities, cities]);

  const handleFilterChange = useCallback(
    <K extends keyof MembersFilterState>(key: K, value: MembersFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleClearAll = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, countryFilter: countryCode });
  }, [countryCode]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // ─── Filtering ──────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = members;

    if (filters.countryFilter !== "all") {
      list = list.filter((m) => m.countries?.code === filters.countryFilter);
    }
    if (filters.genderFilter !== "all") {
      list = list.filter((m) => m.gender === filters.genderFilter);
    }
    if (filters.roleFilter !== "all") {
      list = list.filter((m) => m.role === filters.roleFilter);
    }
    if (filters.statusFilter !== "all") {
      list = list.filter((m) =>
        filters.statusFilter === "yes" ? m.is_active : !m.is_active
      );
    }
    if (filters.selectedCities.length > 0) {
      list = list.filter(
        (m) => m.cities?.name && filters.selectedCities.includes(m.cities.name)
      );
    }
    if (filters.ageMin !== null || filters.ageMax !== null) {
      list = list.filter((m) => {
        const age = getAge(m.date_of_birth);
        if (age === null) return false;
        if (filters.ageMin !== null && age < filters.ageMin) return false;
        if (filters.ageMax !== null && age > filters.ageMax) return false;
        return true;
      });
    }
    if (filters.faithFilter !== "all") {
      list = list.filter((m) => m.faith === filters.faithFilter);
    }
    if (filters.relationshipFilter !== "all") {
      list = list.filter((m) => m.relationship_status === filters.relationshipFilter);
    }
    if (filters.hasChildrenFilter !== "all") {
      list = list.filter((m) =>
        filters.hasChildrenFilter === "yes"
          ? m.has_children === true
          : m.has_children !== true
      );
    }
    if (filters.lookingForFilter !== "all") {
      list = list.filter((m) => m.sexual_preference === filters.lookingForFilter);
    }
    if (filters.educationFilter !== "all") {
      const term = filters.educationFilter.toLowerCase();
      list = list.filter((m) =>
        (m.education ?? "").toLowerCase().includes(term)
      );
    }
    if (filters.occupationSearch) {
      const term = filters.occupationSearch.toLowerCase();
      list = list.filter((m) =>
        (m.occupation ?? "").toLowerCase().includes(term)
      );
    }
    if (filters.subscribedEmail !== "all") {
      list = list.filter((m) =>
        filters.subscribedEmail === "yes" ? m.subscribed_email : !m.subscribed_email
      );
    }
    if (filters.subscribedPhone !== "all") {
      list = list.filter((m) =>
        filters.subscribedPhone === "yes" ? m.subscribed_phone : !m.subscribed_phone
      );
    }
    if (filters.subscribedSms !== "all") {
      list = list.filter((m) =>
        filters.subscribedSms === "yes" ? m.subscribed_sms : !m.subscribed_sms
      );
    }
    if (filters.registeredWithinMonths !== null && filters.registeredWithinMonths > 0) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - filters.registeredWithinMonths);
      list = list.filter((m) => new Date(m.created_at) >= cutoff);
    }
    if (filters.eventWithinMonths !== null && filters.eventWithinMonths > 0) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - filters.eventWithinMonths);
      list = list.filter((m) => {
        const lastEvent = eventActivity[m.id];
        return lastEvent ? new Date(lastEvent) >= cutoff : false;
      });
    }
    if (filters.hasComments !== "all") {
      list = list.filter((m) =>
        filters.hasComments === "yes"
          ? m.admin_comments && m.admin_comments.trim().length > 0
          : !m.admin_comments || m.admin_comments.trim().length === 0
      );
    }
    if (filters.vipFilter !== "all") {
      list = list.filter((m) =>
        filters.vipFilter === "yes" ? vipSet.has(m.id) : !vipSet.has(m.id)
      );
    }
    if (filters.hasPhoto !== "all") {
      list = list.filter((m) =>
        filters.hasPhoto === "yes"
          ? m.avatar_url && m.avatar_url.trim().length > 0
          : !m.avatar_url || m.avatar_url.trim().length === 0
      );
    }
    if (filters.hasBio !== "all") {
      list = list.filter((m) =>
        filters.hasBio === "yes"
          ? m.bio && m.bio.trim().length > 0
          : !m.bio || m.bio.trim().length === 0
      );
    }
    if (filters.eventCountFilter !== "all") {
      list = list.filter((m) => {
        const count = eventCounts[m.id] ?? 0;
        switch (filters.eventCountFilter) {
          case "0": return count === 0;
          case "1+": return count >= 1;
          case "3+": return count >= 3;
          case "5+": return count >= 5;
          case "10+": return count >= 10;
          default: return true;
        }
      });
    }
    if (filters.updatedWithinMonths !== null && filters.updatedWithinMonths > 0) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - filters.updatedWithinMonths);
      list = list.filter((m) => new Date(m.updated_at) >= cutoff);
    }
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          (m.phone ?? "").includes(term) ||
          (m.cities?.name ?? "").toLowerCase().includes(term) ||
          m.role.toLowerCase().includes(term) ||
          (m.occupation ?? "").toLowerCase().includes(term) ||
          (m.education ?? "").toLowerCase().includes(term)
      );
    }

    return list;
  }, [members, filters, eventActivity, eventCounts, vipSet]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => compareFn(a, b, sortKey, sortDir));
  }, [filtered, sortKey, sortDir]);

  const activeCount = countActiveFilters(filters);

  // ─── Shared filter panel props ──────────────────────────

  const filterPanelProps = {
    filters,
    onFilterChange: handleFilterChange,
    onClearAll: handleClearAll,
    cities,
    resultCount: sorted.length,
    totalCount: members.length,
  };

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="flex gap-4">
      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Filters
                {activeCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-4 min-w-[16px] px-1 text-[10px] rounded-full"
                  >
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <MembersFilterPanel {...filterPanelProps} />
            </SheetContent>
          </Sheet>

          {/* View mode toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2.5 rounded-r-none"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2.5 rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-sm text-muted-foreground ml-auto whitespace-nowrap tabular-nums">
            <span className="font-semibold text-foreground">{sorted.length}</span>
            {" "}of {members.length} members
          </span>
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="mb-3">
            <ActiveFilterChips
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
            />
          </div>
        )}

        {/* Data view */}
        {viewMode === "table" ? (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Email" sortKey="email" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortableHeader label="Gender" sortKey="gender" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                  <SortableHeader label="Age" sortKey="age" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortableHeader label="City" sortKey="city" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortableHeader label="Role" sortKey="role" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Status" sortKey="status" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                  <SortableHeader label="Joined" sortKey="joined" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden xl:table-cell" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <EmptyTableRow colSpan={8} search={filters.search} entityName="members" />
                ) : (
                  sorted.map((m) => (
                    <MemberRowItem key={m.id} member={m} isVip={vipSet.has(m.id)} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <MembersCardView members={sorted as any} vipUserIds={vipUserIds} />
        )}
      </div>

      {/* ── Desktop filter sidebar (right side, always visible on lg+) ── */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0">
        <div className="sticky top-4 max-h-[calc(100vh-120px)] flex flex-col border rounded-lg overflow-hidden bg-background">
          <MembersFilterPanel {...filterPanelProps} />
        </div>
      </aside>
    </div>
  );
}
