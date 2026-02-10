import Link from "next/link";
import { getPages, getCountries } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { pages, total, page, perPage } = await getPages({
    page: params.page ? Number(params.page) : 1,
    country: params.country,
    language: params.language,
    pageKey: params.search,
  });

  const countries = await getCountries();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pages</h1>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <form className="flex gap-2">
          <input
            type="text"
            name="search"
            placeholder="Search page key..."
            defaultValue={params.search}
            className="px-3 py-2 border rounded-md"
          />
          <select
            name="country"
            defaultValue={params.country}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="language"
            defaultValue={params.language}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="he">Hebrew</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page Key</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No pages found. Create your first page!
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page: any) => (
                <TableRow key={page.id}>
                  <TableCell className="font-mono text-sm">
                    {page.page_key}
                  </TableCell>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>{page.countries?.name}</TableCell>
                  <TableCell>{page.language_code.toUpperCase()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={page.is_published ? "default" : "secondary"}
                    >
                      {page.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/pages/${page.id}/edit`}>
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

      <AdminPagination total={total} page={page} perPage={perPage} />
    </div>
  );
}
