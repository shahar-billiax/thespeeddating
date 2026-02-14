import Link from "next/link";
import { getGalleries, getCountries } from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Library } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";
import { GalleryDialog } from "@/components/admin/gallery-dialog";
import { GalleryFilters } from "@/components/admin/gallery-filters";

export default async function AdminGalleriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const adminDb = createAdminClient();

  const [{ galleries, total, page, perPage }, countries, mediaCount] =
    await Promise.all([
      getGalleries({
        page: params.page ? Number(params.page) : 1,
        category: params.category,
        country: params.country,
      }),
      getCountries(),
      (adminDb as any)
        .from("media_files")
        .select("*", { count: "exact", head: true })
        .then(({ count }: { count: number | null }) => count ?? 0),
    ]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Galleries</h1>
        <GalleryDialog countries={countries} />
      </div>

      <GalleryFilters countries={countries} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pinned Media Library card */}
        <Link href="/admin/galleries/media">
          <Card className="hover:border-primary transition-colors cursor-pointer overflow-hidden border-dashed">
            <div className="aspect-[16/9] bg-gradient-to-br from-primary/5 to-primary/15 relative flex items-center justify-center">
              <Library className="h-12 w-12 text-primary/40" />
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-background/90 text-xs">
                  all uploads
                </Badge>
              </div>
            </div>
            <CardContent className="pt-3 pb-3">
              <h3 className="font-semibold truncate">Media Library</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-muted-foreground">
                  Central image pool
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" />
                  {mediaCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {galleries.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">
            No galleries yet
          </p>
        )}
        {galleries.map((gallery: any) => {
          const imageCount = gallery.gallery_images?.length ?? 0;
          const firstImage = gallery.gallery_images?.[0];
          const coverUrl = firstImage
            ? `${supabaseUrl}/storage/v1/object/public/media/${firstImage.storage_path}`
            : null;

          return (
            <Link key={gallery.id} href={`/admin/galleries/${gallery.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer overflow-hidden">
                {/* Cover image */}
                <div className="aspect-[16/9] bg-muted relative">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={gallery.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <Badge variant="outline" className="bg-background/90 text-xs">
                      {gallery.category.replace("_", " ")}
                    </Badge>
                    {!gallery.is_active && (
                      <Badge variant="secondary" className="bg-background/90 text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="pt-3 pb-3">
                  <h3 className="font-semibold truncate">{gallery.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">
                      {gallery.countries?.name}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Image className="h-3.5 w-3.5" />
                      {imageCount}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <AdminPagination total={total} page={page} perPage={perPage} />
    </div>
  );
}
