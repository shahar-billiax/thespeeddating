import Link from "next/link";
import { getSuccessStories, getCountries } from "@/lib/admin/actions";
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
import { Plus, Pencil, Star } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";

export default async function AdminSuccessStoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { stories, total, page, perPage } = await getSuccessStories({
    page: params.page ? Number(params.page) : 1,
    country: params.country,
    type: params.type,
    featured: params.featured,
  });

  const countries = await getCountries();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Success Stories</h1>
        <Button asChild>
          <Link href="/admin/success-stories/new">
            <Plus className="h-4 w-4 mr-2" />
            New Story
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <form className="flex gap-2 flex-wrap">
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
            name="type"
            defaultValue={params.type}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Types</option>
            <option value="wedding">Wedding</option>
            <option value="testimonial">Testimonial</option>
            <option value="dating">Dating</option>
          </select>
          <select
            name="featured"
            defaultValue={params.featured}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All</option>
            <option value="true">Featured Only</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Couple / Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No stories found. Add your first success story!
                </TableCell>
              </TableRow>
            ) : (
              stories.map((story: any) => (
                <TableRow key={story.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {story.sort_order}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{story.couple_names}</span>
                      {story.is_featured && (
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {story.quote.substring(0, 80)}...
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        story.story_type === "wedding"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {story.story_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {story.location || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {story.year || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={story.is_active ? "default" : "secondary"}
                    >
                      {story.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/success-stories/${story.id}/edit`}>
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
