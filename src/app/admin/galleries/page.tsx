import Link from "next/link";
import { getGalleries, getCountries } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Image } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";
import { GalleryDialog } from "@/components/admin/gallery-dialog";

export default async function AdminGalleriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const [{ galleries, total, page, perPage }, countries] = await Promise.all([
    getGalleries({
      page: params.page ? Number(params.page) : 1,
      category: params.category,
      country: params.country,
    }),
    getCountries(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Galleries</h1>
        <GalleryDialog countries={countries} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            No galleries yet
          </p>
        ) : (
          galleries.map((gallery: any) => (
            <Link key={gallery.id} href={`/admin/galleries/${gallery.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {gallery.name}
                    <Badge variant="outline">{gallery.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Image className="h-4 w-4" />
                    {gallery.gallery_images?.length ?? 0} images
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gallery.countries?.name}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <AdminPagination total={total} page={page} perPage={perPage} />
    </div>
  );
}
