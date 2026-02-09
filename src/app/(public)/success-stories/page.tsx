import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default async function SuccessStoriesPage() {
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select(
      `id, name, gallery_images(id, storage_path, caption, sort_order)`
    )
    .eq("category", "success_stories")
    .eq("is_active", true)
    .limit(1)
    .single();

  const images = (gallery?.gallery_images as any[]) ?? [];

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <Heart className="h-12 w-12 mx-auto text-pink-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Success Stories</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Real couples who found love through TheSpeedDating. Your story could
          be next!
        </p>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Success stories coming soon. Be the first to share yours!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((img: any) => (
              <Card key={img.id}>
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted rounded mb-4 flex items-center justify-center">
                    {img.storage_path}
                  </div>
                  {img.caption && (
                    <p className="text-sm italic text-center">
                      &ldquo;{img.caption}&rdquo;
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
