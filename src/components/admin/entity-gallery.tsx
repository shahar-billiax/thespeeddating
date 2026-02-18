"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Upload,
  Library,
  Loader2,
  X,
  ExternalLink,
  ImagePlus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaGallerySheet } from "./media-gallery-sheet";
import { SortableImageCard, type SortableImageData } from "./sortable-image-card";
import {
  setEntityCoverImage,
  syncEntityCover,
  migrateCoverToGallery,
} from "@/lib/admin/actions";
import type { MediaFile } from "./media-gallery-panel";

/* ------------------------------------------------------------------ */
/*  Main EntityGallery component                                       */
/* ------------------------------------------------------------------ */

interface EntityGalleryProps {
  entityType: "venue" | "event";
  entityId: number;
  /** Current cover_image storage_path on the entity (for legacy migration) */
  currentCoverImage?: string | null;
  /** Server action that returns { galleryId: number, images: [...] } */
  getGalleryData: (entityId: number) => Promise<{
    galleryId: number;
    images: { id: number; storage_path: string; caption: string | null; sort_order: number; created_at: string }[];
  }>;
}

export function EntityGallery({
  entityType,
  entityId,
  currentCoverImage,
  getGalleryData,
}: EntityGalleryProps) {
  const [galleryId, setGalleryId] = useState<number | null>(null);
  const [images, setImages] = useState<SortableImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const migratedRef = useRef(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const entityKey = entityType === "venue" ? "venue_id" : "event_id";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load gallery data on mount, migrate legacy cover if needed
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getGalleryData(entityId);
        if (cancelled) return;
        setGalleryId(data.galleryId);

        let imgs = data.images ?? [];

        // Legacy migration: if entity has a cover_image but gallery is empty, migrate it
        if (
          imgs.length === 0 &&
          currentCoverImage &&
          !migratedRef.current
        ) {
          migratedRef.current = true;
          await migrateCoverToGallery(entityType, entityId, currentCoverImage);
          // Reload after migration
          const refreshed = await getGalleryData(entityId);
          if (cancelled) return;
          imgs = refreshed.images ?? [];
        }

        const sorted = imgs
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => ({
            ...img,
            url: `${supabaseUrl}/storage/v1/object/public/media/${img.storage_path}`,
          }));
        setImages(sorted);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [entityId, entityType, currentCoverImage, getGalleryData, supabaseUrl]);

  /* ── Upload files directly ── */
  const handleUpload = async (fileList: FileList) => {
    if (!galleryId) return;
    setUploading(true);
    setError(null);
    const wasEmpty = images.length === 0;
    try {
      const formData = new FormData();
      for (const file of Array.from(fileList)) {
        formData.append("files", file);
      }
      formData.append(entityKey, String(entityId));
      const res = await fetch(`/api/admin/galleries/${galleryId}/images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImages((prev) => [...prev, ...data.images]);

      // If this was the first upload, sync cover_image on entity
      if (wasEmpty && data.images?.length > 0) {
        await syncEntityCover(entityType, entityId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  /* ── Add from media library ── */
  const handlePickImage = useCallback(
    async (file: MediaFile) => {
      if (!galleryId) return;
      setError(null);
      const wasEmpty = images.length === 0;
      try {
        const res = await fetch(`/api/admin/galleries/${galleryId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: [{ storage_path: file.storage_path }],
            [entityKey]: entityId,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setImages((prev) => [...prev, ...data.images]);

        if (wasEmpty && data.images?.length > 0) {
          await syncEntityCover(entityType, entityId);
        }
      } catch (err: any) {
        setError(err.message);
      }
    },
    [galleryId, entityKey, entityId, entityType, images.length]
  );

  /* ── Delete image ── */
  const handleDeleteImage = async (imageId: number) => {
    if (!galleryId) return;
    const deletedIndex = images.findIndex((img) => img.id === imageId);
    try {
      const res = await fetch(
        `/api/admin/galleries/${galleryId}/images/${imageId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImages((prev) => prev.filter((img) => img.id !== imageId));

      // If we deleted the cover (first image), sync cover on entity
      if (deletedIndex === 0) {
        await syncEntityCover(entityType, entityId);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* ── Update caption ── */
  const handleCaptionSave = async (imageId: number, caption: string) => {
    if (!galleryId) return;
    try {
      const res = await fetch(
        `/api/admin/galleries/${galleryId}/images/${imageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caption }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, caption } : img
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* ── Set as cover ── */
  const handleSetAsCover = async (imageId: number) => {
    try {
      // Optimistic UI: reorder locally
      const idx = images.findIndex((i) => i.id === imageId);
      if (idx <= 0) return; // already first
      const reordered = [images[idx], ...images.filter((_, i) => i !== idx)];
      setImages(reordered);

      await setEntityCoverImage(entityType, entityId, imageId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* ── Drag end (reorder) ── */
  const handleDragEnd = async (event: DragEndEvent) => {
    if (!galleryId) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);

    setImages(reordered);

    const order = reordered.map((img, idx) => ({
      id: img.id,
      sort_order: idx,
    }));

    try {
      const res = await fetch(
        `/api/admin/galleries/${galleryId}/images/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Sync cover_image if first position changed
      if (oldIndex === 0 || newIndex === 0) {
        await syncEntityCover(entityType, entityId);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {entityType === "venue" ? "Venue" : "Event"} Photos ({images.length})
            </CardTitle>
            {galleryId && (
              <Link
                href={`/admin/galleries/${galleryId}`}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                Open full gallery
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !galleryId}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Upload className="h-4 w-4 mr-1.5" />
              )}
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMediaPickerOpen(true)}
              disabled={!galleryId}
            >
              <Library className="h-4 w-4 mr-1.5" />
              Browse Library
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleUpload(e.target.files);
                  e.target.value = "";
                }
              }}
            />
          </div>

          {images.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !galleryId}
              className="w-full py-8 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary cursor-pointer"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm font-medium">
                Add {entityType} photos
              </span>
              <span className="text-xs">
                First image becomes the cover photo
              </span>
            </button>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((i) => i.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {images.map((image, index) => (
                    <SortableImageCard
                      key={image.id}
                      image={image}
                      isCover={index === 0}
                      onSetAsCover={handleSetAsCover}
                      onDelete={handleDeleteImage}
                      onCaptionSave={handleCaptionSave}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {images.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              Drag to reorder. First image = cover photo. Click star to set as cover.
            </p>
          )}
        </CardContent>
      </Card>

      <MediaGallerySheet
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        mode="pick"
        onPickImage={handlePickImage}
      />
    </div>
  );
}
