import { notFound } from "next/navigation";
import { getGallery, getCountries } from "@/lib/admin/actions";
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
  const galleryWithUrls = {
    ...gallery,
    gallery_images: ((gallery.gallery_images as any[]) ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => ({
        ...img,
        url: `${supabaseUrl}/storage/v1/object/public/media/${img.storage_path}`,
      })),
  };

  return (
    <GalleryDetailClient
      gallery={galleryWithUrls as any}
      countries={countries}
    />
  );
}
