import { notFound } from "next/navigation";
import { getGallery, getCountries, getGalleryEntityNames } from "@/lib/admin/actions";
import { GalleryDetailClient } from "@/components/admin/gallery-detail-client";

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

  const countries = await getCountries();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Compute full URLs for gallery images
  const galleryImages = ((gallery.gallery_images as any[]) ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((img: any) => ({
      ...img,
      url: `${supabaseUrl}/storage/v1/object/public/media/${img.storage_path}`,
    }));

  // For venues/events galleries, resolve entity names for folder headers
  let entityNames: Record<number, string> = {};
  const category = gallery.category;
  if (category === "venues" || category === "events") {
    const key = category === "venues" ? "venue_id" : "event_id";
    const entityIds = [
      ...new Set(
        galleryImages
          .map((img: any) => img[key])
          .filter((id: any): id is number => id != null)
      ),
    ];
    entityNames = await getGalleryEntityNames(category, entityIds);
  }

  const galleryWithUrls = {
    ...gallery,
    gallery_images: galleryImages,
  };

  return (
    <GalleryDetailClient
      gallery={galleryWithUrls as any}
      countries={countries}
      entityNames={entityNames}
    />
  );
}
