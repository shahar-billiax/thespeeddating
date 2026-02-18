"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Trash2,
  Upload,
  Library,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MediaGallerySheet } from "./media-gallery-sheet";
import { GalleryDialog } from "./gallery-dialog";
import { deleteGallery } from "@/lib/admin/actions";
import { SortableImageCard } from "./sortable-image-card";
import type { MediaFile } from "./media-gallery-panel";
import Link from "next/link";

interface GalleryImage {
  id: number;
  gallery_id: number;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  url: string;
  created_at: string;
  venue_id?: number | null;
  event_id?: number | null;
}

interface GalleryData {
  id: number;
  name: string;
  category: string;
  country_id: number;
  is_active: boolean;
  countries: { id: number; name: string; code: string };
  gallery_images: GalleryImage[];
}

interface GalleryDetailClientProps {
  gallery: GalleryData;
  countries: { id: number; name: string; code: string }[];
  entityNames?: Record<number, string>;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function GalleryDetailClient({
  gallery,
  countries,
  entityNames = {},
}: GalleryDetailClientProps) {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>(gallery.gallery_images);
  const [uploading, setUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /* ── Upload files directly ── */
  const handleUpload = async (fileList: FileList) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      for (const file of Array.from(fileList)) {
        formData.append("files", file);
      }
      const res = await fetch(`/api/admin/galleries/${gallery.id}/images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImages((prev) => [...prev, ...data.images]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  /* ── Add from media library ── */
  const handlePickImage = useCallback(
    async (file: MediaFile) => {
      setError(null);
      try {
        const res = await fetch(`/api/admin/galleries/${gallery.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: [{ storage_path: file.storage_path }],
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setImages((prev) => [...prev, ...data.images]);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [gallery.id]
  );

  /* ── Delete image ── */
  const handleDeleteImage = async (imageId: number) => {
    try {
      const res = await fetch(
        `/api/admin/galleries/${gallery.id}/images/${imageId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* ── Update caption ── */
  const handleCaptionSave = async (imageId: number, caption: string) => {
    try {
      const res = await fetch(
        `/api/admin/galleries/${gallery.id}/images/${imageId}`,
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

  /* ── Drag end (reorder) ── */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);

    // Optimistic update
    setImages(reordered);

    const order = reordered.map((img, idx) => ({
      id: img.id,
      sort_order: idx,
    }));

    try {
      const res = await fetch(
        `/api/admin/galleries/${gallery.id}/images/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
    } catch (err: any) {
      // Revert on error
      setImages(gallery.gallery_images);
      setError(err.message);
    }
  };

  /* ── Delete gallery ── */
  const handleDeleteGallery = async () => {
    setDeleting(true);
    try {
      await deleteGallery(gallery.id);
    } catch {
      setDeleting(false);
      setError("Failed to delete gallery");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/galleries">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{gallery.name}</h1>
            <p className="text-sm text-muted-foreground">
              {gallery.countries?.name} &middot;{" "}
              {gallery.category.replace("_", " ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={gallery.is_active ? "default" : "secondary"}>
            {gallery.is_active ? "Active" : "Inactive"}
          </Badge>
          <GalleryDialog
            countries={countries}
            gallery={gallery}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete gallery?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &ldquo;{gallery.name}&rdquo; and
                  remove all images from this gallery. The image files will
                  remain in the media library.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteGallery}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete Gallery"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Images</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-1.5" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="library">
                <Library className="h-4 w-4 mr-1.5" />
                Browse All Images
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? "Uploading..." : "Choose Files"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  PNG, JPEG, GIF, WebP, SVG — max 10MB
                </span>
              </div>
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
            </TabsContent>
            <TabsContent value="library" className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMediaPickerOpen(true)}
              >
                <Library className="h-4 w-4 mr-2" />
                Browse All Images
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Pick from all images across the site to add to this gallery.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Image grid — grouped by entity for venues/events galleries */}
      {(() => {
        const isGrouped =
          (gallery.category === "venues" || gallery.category === "events") &&
          Object.keys(entityNames).length > 0;
        const entityKey = gallery.category === "venues" ? "venue_id" : "event_id";

        // Group images by entity
        const groups: { key: string; label: string; imgs: GalleryImage[] }[] = [];
        if (isGrouped) {
          const byEntity = new Map<number | null, GalleryImage[]>();
          for (const img of images) {
            const eid = (img as any)[entityKey] ?? null;
            if (!byEntity.has(eid)) byEntity.set(eid, []);
            byEntity.get(eid)!.push(img);
          }
          // Named folders first, then unlinked
          for (const [eid, imgs] of byEntity) {
            if (eid != null) {
              groups.push({
                key: String(eid),
                label: entityNames[eid] ?? `#${eid}`,
                imgs,
              });
            }
          }
          const unlinked = byEntity.get(null);
          if (unlinked?.length) {
            groups.push({ key: "unlinked", label: "Other / Unlinked", imgs: unlinked });
          }
        }

        return isGrouped ? (
          groups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No images yet. Upload files or browse all images to add.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <Card key={group.key}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">
                        {group.label}
                        <span className="text-muted-foreground font-normal ml-2">
                          ({group.imgs.length})
                        </span>
                      </CardTitle>
                      {group.key !== "unlinked" && (
                        <Link
                          href={`/admin/${gallery.category === "venues" ? "venues" : "events"}/${group.key}`}
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          View {gallery.category === "venues" ? "venue" : "event"}
                          <ArrowLeft className="h-3 w-3 rotate-180" />
                        </Link>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={group.imgs.map((i) => i.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {group.imgs.map((image) => (
                            <SortableImageCard
                              key={image.id}
                              image={image}
                              onDelete={handleDeleteImage}
                              onCaptionSave={handleCaptionSave}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Images ({images.length})
                </CardTitle>
                {images.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Drag to reorder &middot; Click caption to edit
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No images yet. Upload files or browse all images to add.</p>
                </div>
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
                      {images.map((image) => (
                        <SortableImageCard
                          key={image.id}
                          image={image}
                          onDelete={handleDeleteImage}
                          onCaptionSave={handleCaptionSave}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Media picker sheet */}
      <MediaGallerySheet
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        mode="pick"
        onPickImage={handlePickImage}
      />
    </div>
  );
}
