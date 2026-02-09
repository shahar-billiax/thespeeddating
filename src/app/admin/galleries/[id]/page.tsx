import { notFound } from "next/navigation";
import { getGallery } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let gallery;
  try {
    gallery = await getGallery(Number(id));
  } catch {
    notFound();
  }

  const images = (gallery.gallery_images as any[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{gallery.name}</h1>
          <p className="text-muted-foreground">
            {(gallery.countries as any)?.name} - {gallery.category.replace("_", " ")}
          </p>
        </div>
        <Badge variant={gallery.is_active ? "default" : "secondary"}>
          {gallery.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No images in this gallery yet. Image upload will be available when
            Supabase Storage is configured.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((img: any) => (
              <Card key={img.id}>
                <CardContent className="pt-4">
                  <div className="aspect-square bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                    {img.storage_path}
                  </div>
                  {img.caption && (
                    <p className="text-sm mt-2">{img.caption}</p>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
