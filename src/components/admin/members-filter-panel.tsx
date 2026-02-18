"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CityMultiSelect } from "./city-multi-select";
import { RotateCcw, Search } from "lucide-react";

// ─── Types & Constants ──────────────────────────────────────

export type MembersFilterState = {
  search: string;
  countryFilter: string;
  genderFilter: string;
  roleFilter: string;
  statusFilter: string;
  selectedCities: string[];
  ageMin: number | null;
  ageMax: number | null;
  faithFilter: string;
  relationshipFilter: string;
  hasChildrenFilter: string;
  lookingForFilter: string;
  educationFilter: string;
  occupationSearch: string;
  subscribedEmail: string;
  subscribedPhone: string;
  subscribedSms: string;
  registeredWithinMonths: number | null;
  eventWithinMonths: number | null;
  hasComments: string;
  vipFilter: string;
  hasPhoto: string;
  hasBio: string;
  eventCountFilter: string;
  updatedWithinMonths: number | null;
};

export const DEFAULT_FILTERS: MembersFilterState = {
  search: "",
  countryFilter: "all",
  genderFilter: "all",
  roleFilter: "all",
  statusFilter: "all",
  selectedCities: [],
  ageMin: null,
  ageMax: null,
  faithFilter: "all",
  relationshipFilter: "all",
  hasChildrenFilter: "all",
  lookingForFilter: "all",
  educationFilter: "all",
  occupationSearch: "",
  subscribedEmail: "all",
  subscribedPhone: "all",
  subscribedSms: "all",
  registeredWithinMonths: null,
  eventWithinMonths: null,
  hasComments: "all",
  vipFilter: "all",
  hasPhoto: "all",
  hasBio: "all",
  eventCountFilter: "all",
  updatedWithinMonths: null,
};

const FAITH_OPTIONS = [
  { value: "secular", label: "Secular" },
  { value: "traditional", label: "Traditional" },
  { value: "conservative", label: "Conservative" },
  { value: "reform", label: "Reform" },
  { value: "liberal", label: "Liberal" },
  { value: "modern_orthodox", label: "Modern Orthodox" },
  { value: "orthodox", label: "Orthodox" },
  { value: "atheist", label: "Atheist" },
] as const;

const RELATIONSHIP_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "separated", label: "Separated" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
] as const;

const LOOKING_FOR_OPTIONS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "both", label: "Both" },
] as const;

type City = { id: number; name: string; country_id: number };

interface MembersFilterPanelProps {
  filters: MembersFilterState;
  onFilterChange: <K extends keyof MembersFilterState>(
    key: K,
    value: MembersFilterState[K]
  ) => void;
  onClearAll: () => void;
  cities: City[];
  resultCount: number;
  totalCount: number;
}

// ─── Helper Components ──────────────────────────────────────

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
        {title}
      </h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function GenderToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { value: "all", label: "All" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];
  return (
    <div className="flex rounded-md border overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 text-xs py-1.5 px-2 transition-colors ${
            value === opt.value
              ? opt.value === "male"
                ? "bg-blue-50 text-blue-700 font-medium border-blue-200"
                : opt.value === "female"
                  ? "bg-pink-50 text-pink-700 font-medium border-pink-200"
                  : "bg-primary text-primary-foreground font-medium"
              : "hover:bg-muted text-muted-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TriStateToggle({
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  value: string;
  onChange: (v: string) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  const options = [
    { value: "all", label: "All" },
    { value: "yes", label: yesLabel },
    { value: "no", label: noLabel },
  ];
  return (
    <div className="flex rounded-md border overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 text-xs py-1.5 px-2 transition-colors ${
            value === opt.value
              ? "bg-primary text-primary-foreground font-medium"
              : "hover:bg-muted text-muted-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Filter Panel ──────────────────────────────────────

export function MembersFilterPanel({
  filters,
  onFilterChange,
  onClearAll,
  cities,
  resultCount,
  totalCount,
}: MembersFilterPanelProps) {
  const ageRange = [filters.ageMin ?? 18, filters.ageMax ?? 90];
  const activeCount = countActiveFilters(filters);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Filters</h3>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs h-6 px-2 gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tabular-nums">{resultCount}</span>
          <span className="text-xs text-muted-foreground">
            of {totalCount} members
          </span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-auto">
              {activeCount} active
            </Badge>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Name, email, phone..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="h-8 text-xs pl-8"
          />
        </div>
      </div>

      {/* Scrollable filter sections */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
        {/* ── Basic Info ── */}
        <FilterSection title="Basic Info">
          <FilterField label="Gender">
            <GenderToggle
              value={filters.genderFilter}
              onChange={(v) => onFilterChange("genderFilter", v)}
            />
          </FilterField>

          <FilterField label={`Age Range: ${ageRange[0]} – ${ageRange[1]}`}>
            <Slider
              min={18}
              max={90}
              step={1}
              value={ageRange}
              onValueChange={([min, max]) => {
                onFilterChange("ageMin", min === 18 ? null : min);
                onFilterChange("ageMax", max === 90 ? null : max);
              }}
              className="py-1"
            />
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                min={18}
                max={90}
                placeholder="Min"
                value={filters.ageMin ?? ""}
                onChange={(e) =>
                  onFilterChange(
                    "ageMin",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="h-7 text-xs"
              />
              <span className="text-muted-foreground self-center text-xs">–</span>
              <Input
                type="number"
                min={18}
                max={90}
                placeholder="Max"
                value={filters.ageMax ?? ""}
                onChange={(e) =>
                  onFilterChange(
                    "ageMax",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="h-7 text-xs"
              />
            </div>
          </FilterField>

          <FilterField label="Country">
            <Select
              value={filters.countryFilter}
              onValueChange={(v) => onFilterChange("countryFilter", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="gb">United Kingdom</SelectItem>
                <SelectItem value="il">Israel</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="City">
            <CityMultiSelect
              cities={cities}
              selected={filters.selectedCities}
              onChange={(v) => onFilterChange("selectedCities", v)}
              countryFilter={filters.countryFilter}
            />
          </FilterField>

          <FilterField label="Role">
            <Select
              value={filters.roleFilter}
              onValueChange={(v) => onFilterChange("roleFilter", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="host">Host</SelectItem>
                <SelectItem value="host_plus">Host Plus</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Account Status">
            <TriStateToggle
              value={filters.statusFilter}
              onChange={(v) => onFilterChange("statusFilter", v)}
              yesLabel="Active"
              noLabel="Inactive"
            />
          </FilterField>

          <FilterField label="VIP Status">
            <TriStateToggle
              value={filters.vipFilter}
              onChange={(v) => onFilterChange("vipFilter", v)}
              yesLabel="VIP"
              noLabel="Non-VIP"
            />
          </FilterField>
        </FilterSection>

        <Separator />

        {/* ── Personal Details ── */}
        <FilterSection title="Personal Details">
          <FilterField label="Relationship Status">
            <Select
              value={filters.relationshipFilter}
              onValueChange={(v) => onFilterChange("relationshipFilter", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {RELATIONSHIP_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Religious Level">
            <Select
              value={filters.faithFilter}
              onValueChange={(v) => onFilterChange("faithFilter", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {FAITH_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Has Children">
            <TriStateToggle
              value={filters.hasChildrenFilter}
              onChange={(v) => onFilterChange("hasChildrenFilter", v)}
            />
          </FilterField>

          <FilterField label="Looking For">
            <Select
              value={filters.lookingForFilter}
              onValueChange={(v) => onFilterChange("lookingForFilter", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {LOOKING_FOR_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Education">
            <Input
              placeholder="Search education..."
              value={filters.educationFilter === "all" ? "" : filters.educationFilter}
              onChange={(e) =>
                onFilterChange(
                  "educationFilter",
                  e.target.value || "all"
                )
              }
              className="h-8 text-xs"
            />
          </FilterField>

          <FilterField label="Profession">
            <Input
              placeholder="Search profession..."
              value={filters.occupationSearch}
              onChange={(e) =>
                onFilterChange("occupationSearch", e.target.value)
              }
              className="h-8 text-xs"
            />
          </FilterField>
        </FilterSection>

        <Separator />

        {/* ── Activity ── */}
        <FilterSection title="Activity">
          <FilterField label="Registered within last">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  placeholder="—"
                  value={filters.registeredWithinMonths ?? ""}
                  onChange={(e) =>
                    onFilterChange(
                      "registeredWithinMonths",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="h-8 text-xs w-16"
                />
                <span className="text-xs text-muted-foreground">months</span>
              </div>
              <TimePresetButtons
                value={filters.registeredWithinMonths}
                onChange={(v) => onFilterChange("registeredWithinMonths", v)}
              />
            </div>
          </FilterField>

          <FilterField label="Attended event within last">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  placeholder="—"
                  value={filters.eventWithinMonths ?? ""}
                  onChange={(e) =>
                    onFilterChange(
                      "eventWithinMonths",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="h-8 text-xs w-16"
                />
                <span className="text-xs text-muted-foreground">months</span>
              </div>
              <TimePresetButtons
                value={filters.eventWithinMonths}
                onChange={(v) => onFilterChange("eventWithinMonths", v)}
              />
            </div>
          </FilterField>

          <FilterField label="Total events attended">
            <Select
              value={filters.eventCountFilter}
              onValueChange={(v) => onFilterChange("eventCountFilter", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">Never attended</SelectItem>
                <SelectItem value="1+">1+ events</SelectItem>
                <SelectItem value="3+">3+ events</SelectItem>
                <SelectItem value="5+">5+ events</SelectItem>
                <SelectItem value="10+">10+ events</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Profile updated within last">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  placeholder="—"
                  value={filters.updatedWithinMonths ?? ""}
                  onChange={(e) =>
                    onFilterChange(
                      "updatedWithinMonths",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="h-8 text-xs w-16"
                />
                <span className="text-xs text-muted-foreground">months</span>
              </div>
              <TimePresetButtons
                value={filters.updatedWithinMonths}
                onChange={(v) => onFilterChange("updatedWithinMonths", v)}
              />
            </div>
          </FilterField>
        </FilterSection>

        <Separator />

        {/* ── Profile Completeness ── */}
        <FilterSection title="Profile">
          <FilterField label="Has Profile Photo">
            <TriStateToggle
              value={filters.hasPhoto}
              onChange={(v) => onFilterChange("hasPhoto", v)}
            />
          </FilterField>

          <FilterField label="Has Bio">
            <TriStateToggle
              value={filters.hasBio}
              onChange={(v) => onFilterChange("hasBio", v)}
            />
          </FilterField>
        </FilterSection>

        <Separator />

        {/* ── Subscriptions ── */}
        <FilterSection title="Subscriptions">
          <FilterField label="Email Newsletter">
            <TriStateToggle
              value={filters.subscribedEmail}
              onChange={(v) => onFilterChange("subscribedEmail", v)}
              yesLabel="Subscribed"
              noLabel="Not Sub."
            />
          </FilterField>

          <FilterField label="Phone Contact">
            <TriStateToggle
              value={filters.subscribedPhone}
              onChange={(v) => onFilterChange("subscribedPhone", v)}
              yesLabel="Subscribed"
              noLabel="Not Sub."
            />
          </FilterField>

          <FilterField label="SMS Messages">
            <TriStateToggle
              value={filters.subscribedSms}
              onChange={(v) => onFilterChange("subscribedSms", v)}
              yesLabel="Subscribed"
              noLabel="Not Sub."
            />
          </FilterField>
        </FilterSection>

        <Separator />

        {/* ── Admin ── */}
        <FilterSection title="Admin">
          <FilterField label="Has Admin Comments">
            <TriStateToggle
              value={filters.hasComments}
              onChange={(v) => onFilterChange("hasComments", v)}
            />
          </FilterField>
        </FilterSection>

        {/* Bottom spacer for scroll comfort */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ─── Time preset buttons ────────────────────────────────────

function TimePresetButtons({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const presets = [
    { label: "1mo", months: 1 },
    { label: "3mo", months: 3 },
    { label: "6mo", months: 6 },
    { label: "1yr", months: 12 },
  ];
  return (
    <div className="flex gap-1">
      {presets.map((p) => (
        <button
          key={p.months}
          type="button"
          onClick={() => onChange(value === p.months ? null : p.months)}
          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
            value === p.months
              ? "bg-primary text-primary-foreground border-primary"
              : "text-muted-foreground hover:text-foreground hover:border-foreground/30"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── Count active filters ───────────────────────────────────

export function countActiveFilters(filters: MembersFilterState): number {
  let count = 0;
  if (filters.countryFilter !== "all") count++;
  if (filters.genderFilter !== "all") count++;
  if (filters.roleFilter !== "all") count++;
  if (filters.statusFilter !== "all") count++;
  if (filters.selectedCities.length > 0) count++;
  if (filters.ageMin !== null) count++;
  if (filters.ageMax !== null) count++;
  if (filters.faithFilter !== "all") count++;
  if (filters.relationshipFilter !== "all") count++;
  if (filters.hasChildrenFilter !== "all") count++;
  if (filters.lookingForFilter !== "all") count++;
  if (filters.educationFilter !== "all") count++;
  if (filters.occupationSearch !== "") count++;
  if (filters.subscribedEmail !== "all") count++;
  if (filters.subscribedPhone !== "all") count++;
  if (filters.subscribedSms !== "all") count++;
  if (filters.registeredWithinMonths !== null) count++;
  if (filters.eventWithinMonths !== null) count++;
  if (filters.hasComments !== "all") count++;
  if (filters.vipFilter !== "all") count++;
  if (filters.hasPhoto !== "all") count++;
  if (filters.hasBio !== "all") count++;
  if (filters.eventCountFilter !== "all") count++;
  if (filters.updatedWithinMonths !== null) count++;
  return count;
}
