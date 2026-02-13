"use client";

import { useMemo, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Sort types ──────────────────────────────────────────────

export type SortDir = "asc" | "desc";

export interface SortState<K extends string = string> {
  key: K | null;
  dir: SortDir;
}

// ─── Sort icon ───────────────────────────────────────────────

function SortIcon({ active, direction }: { active: boolean; direction: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
  return direction === "asc"
    ? <ArrowUp className="h-3.5 w-3.5" />
    : <ArrowDown className="h-3.5 w-3.5" />;
}

// ─── Sortable header ─────────────────────────────────────────

export function SortableHeader<K extends string>({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  sortKey: K;
  currentKey: K | null;
  currentDir: SortDir;
  onSort: (key: K) => void;
  className?: string;
}) {
  const active = currentKey === sortKey;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1.5 hover:text-foreground transition-colors -ml-2 px-2 py-1 rounded",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <SortIcon active={active} direction={currentDir} />
      </button>
    </TableHead>
  );
}

// ─── Search input ────────────────────────────────────────────

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

// ─── Sort hook ───────────────────────────────────────────────

export function useSort<K extends string>(defaultKey: K | null = null, defaultDir: SortDir = "asc") {
  const [sortKey, setSortKey] = useState<K | null>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const handleSort = useCallback((key: K) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }, [sortKey]);

  return { sortKey, sortDir, handleSort };
}

// ─── Generic search + sort hook ──────────────────────────────

export function useSearchSort<T, K extends string>(
  items: T[],
  filterFn: (item: T, term: string) => boolean,
  compareFn: (a: T, b: T, key: K, dir: SortDir) => number,
  defaultSortKey: K | null = null,
  defaultSortDir: SortDir = "asc",
) {
  const [search, setSearch] = useState("");
  const { sortKey, sortDir, handleSort } = useSort<K>(defaultSortKey, defaultSortDir);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.toLowerCase().trim();
    return items.filter((item) => filterFn(item, term));
  }, [items, search, filterFn]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => compareFn(a, b, sortKey, sortDir));
  }, [filtered, sortKey, sortDir, compareFn]);

  return { search, setSearch, sortKey, sortDir, handleSort, filtered: sorted, total: items.length };
}

// ─── Empty state ─────────────────────────────────────────────

export function EmptyTableRow({
  colSpan,
  search,
  entityName = "items",
}: {
  colSpan: number;
  search?: string;
  entityName?: string;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-8">
        {search
          ? `No ${entityName} match your search.`
          : `No ${entityName} found.`}
      </TableCell>
    </TableRow>
  );
}
