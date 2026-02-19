"use client";

import { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { AdminPagination } from "@/components/admin/pagination";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  language_code: string;
  is_published: boolean;
  created_at: string;
}

type SortKey = "title" | "slug" | "language_code" | "is_published" | "created_at";
type SortDir = "asc" | "desc";

/* ------------------------------------------------------------------ */
/*  Sorting helpers                                                    */
/* ------------------------------------------------------------------ */

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

function compareFn(a: BlogPost, b: BlogPost, key: SortKey, dir: SortDir): number {
  let cmp = 0;
  switch (key) {
    case "title":         cmp = a.title.localeCompare(b.title); break;
    case "slug":          cmp = a.slug.localeCompare(b.slug); break;
    case "language_code": cmp = a.language_code.localeCompare(b.language_code); break;
    case "is_published":  cmp = (a.is_published ? 1 : 0) - (b.is_published ? 1 : 0); break;
    case "created_at":    cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
  }
  return dir === "desc" ? -cmp : cmp;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BlogPostsTable({
  posts,
  total,
  page,
  perPage,
}: {
  posts: BlogPost[];
  total: number;
  page: number;
  perPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Current URL-driven filter values
  const q        = searchParams.get("q") ?? "";
  const language = searchParams.get("language") ?? "";
  const published = searchParams.get("published") ?? "";

  // Local search input state (immediate, decoupled from URL debounce)
  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => { setSearchInput(q); }, [q]);

  // Client-side sort (applied to the current page of results)
  const [sortKey, setSortKey] = useState<SortKey | null>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page"); // reset to page 1 on filter change
    startTransition(() => router.push(`?${params.toString()}`));
  }

  function handleSearch(value: string) {
    setSearchInput(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => updateParams({ q: value }), 400);
  }

  const sorted = useMemo(() => {
    if (!sortKey) return posts;
    return [...posts].sort((a, b) => compareFn(a, b, sortKey, sortDir));
  }, [posts, sortKey, sortDir]);

  return (
    <div className="space-y-4">
      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search posts..."
            className="pl-9"
          />
        </div>

        <Select
          value={language || "all"}
          onValueChange={(v) => updateParams({ language: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="he">Hebrew</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={published || "all"}
          onValueChange={(v) => updateParams({ published: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Title"    sortKey="title"         currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Slug"     sortKey="slug"          currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
              <SortableHeader label="Language" sortKey="language_code" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
              <SortableHeader label="Status"   sortKey="is_published"  currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Date"     sortKey="created_at"    currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {q || language || published
                    ? "No posts match your filters."
                    : "No blog posts yet. Create your first post!"}
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((post) => (
                <TableRow
                  key={post.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                >
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground hidden md:table-cell">
                    {post.slug}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={post.language_code === "en" ? "default" : "secondary"}>
                      {post.language_code === "en" ? "EN" : "HE"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.is_published ? "default" : "secondary"}>
                      {post.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(post.created_at).toLocaleDateString("en-GB")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <AdminPagination total={total} page={page} perPage={perPage} />
    </div>
  );
}
