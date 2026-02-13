"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GroupedPage {
  page_key: string;
  page_type: string;
  title: string;
  languages: string[];
  is_published: boolean;
  updated_at: string;
}

type SortKey = "page_key" | "title" | "page_type" | "languages" | "is_published" | "updated_at";
type SortDir = "asc" | "desc";

function getTypeLabel(type: string): string {
  switch (type) {
    case "testimony": return "Testimony";
    case "faq": return "FAQ";
    case "contact": return "Contact";
    default: return "Standard";
  }
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
  return direction === "asc"
    ? <ArrowUp className="h-3.5 w-3.5" />
    : <ArrowDown className="h-3.5 w-3.5" />;
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey | null;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
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

function compareFn(a: GroupedPage, b: GroupedPage, key: SortKey, dir: SortDir): number {
  let cmp = 0;
  switch (key) {
    case "page_key":
      cmp = a.page_key.localeCompare(b.page_key);
      break;
    case "title":
      cmp = a.title.localeCompare(b.title);
      break;
    case "page_type":
      cmp = getTypeLabel(a.page_type).localeCompare(getTypeLabel(b.page_type));
      break;
    case "languages":
      cmp = a.languages.length - b.languages.length || a.languages.join(",").localeCompare(b.languages.join(","));
      break;
    case "is_published": {
      const aVal = a.is_published ? 1 : 0;
      const bVal = b.is_published ? 1 : 0;
      cmp = aVal - bVal;
      break;
    }
    case "updated_at":
      cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      break;
  }
  return dir === "desc" ? -cmp : cmp;
}

export function PagesTable({ pages }: { pages: GroupedPage[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>("page_key");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return pages;
    const term = search.toLowerCase().trim();
    return pages.filter(
      (entry) =>
        entry.page_key.toLowerCase().includes(term) ||
        entry.title.toLowerCase().includes(term) ||
        getTypeLabel(entry.page_type).toLowerCase().includes(term) ||
        (entry.is_published ? "published" : "draft").includes(term)
    );
  }, [pages, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => compareFn(a, b, sortKey, sortDir));
  }, [filtered, sortKey, sortDir]);

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pages..."
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Page Key" sortKey="page_key" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Title" sortKey="title" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Type" sortKey="page_type" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Languages" sortKey="languages" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Status" sortKey="is_published" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Updated" sortKey="updated_at" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  {search
                    ? "No pages match your search."
                    : "No pages found. Create your first page!"}
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((entry) => (
                <TableRow key={entry.page_key}>
                  <TableCell className="font-mono text-sm">
                    {entry.page_key}
                  </TableCell>
                  <TableCell className="font-medium">{entry.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.page_type === "testimony" ? "outline" : "secondary"
                      }
                    >
                      {getTypeLabel(entry.page_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge
                        variant={
                          entry.languages.includes("en") ? "default" : "outline"
                        }
                        className={
                          entry.languages.includes("en")
                            ? ""
                            : "text-muted-foreground border-dashed"
                        }
                      >
                        EN
                      </Badge>
                      <Badge
                        variant={
                          entry.languages.includes("he") ? "default" : "outline"
                        }
                        className={
                          entry.languages.includes("he")
                            ? ""
                            : "text-muted-foreground border-dashed"
                        }
                      >
                        HE
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={entry.is_published ? "default" : "secondary"}
                    >
                      {entry.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(entry.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/pages/${entry.page_key}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
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
