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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  GripVertical,
  Trash2,
  Upload,
  Library,
  Loader2,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

/* ------------------------------------------------------------------ */
/*  Sortable image card                                                */
/* ------------------------------------------------------------------ */

function SortableImageCard({
  image,
  onDelete,
  onCaptionSave,
}: {
  image: GalleryImage;
  onDelete: (id: number) => void;
  onCaptionSave: (id: number, caption: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [captionValue, setCaptionValue] = useState(image.caption || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStartEdit = () => {
    setCaptionValue(image.caption || "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveCaption = () => {
    onCaptionSave(image.id, captionValue);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setCaptionValue(image.caption || "");
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative border rounded-lg overflow-hidden bg-background shadow-sm"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 rounded bg-white/90 shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Delete button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="absolute top-2 right-2 z-10 p-1 rounded bg-destructive/80 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the image from this gallery. The file will remain
              in the media library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(image.id)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image */}
      <div className="aspect-square bg-muted">
        <img
          src={image.url}
          alt={image.caption || "Gallery image"}
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>

      {/* Caption */}
      <div className="p-2 border-t min-h-[40px]">
        {editing ? (
          <div className="flex gap-1">
            <Input
              ref={inputRef}
              value={captionValue}
              onChange={(e) => setCaptionValue(e.target.value)}
              className="h-7 text-xs"
              placeholder="Add caption..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveCaption();
                if (e.key === "Escape") handleCancelEdit();
              }}
            />
            <button
              type="button"
              onClick={handleSaveCaption}
              className="shrink-0 p-1 rounded hover:bg-muted"
            >
              <Check className="h-3.5 w-3.5 text-green-600" />
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="shrink-0 p-1 rounded hover:bg-muted"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-1 cursor-pointer group/caption"
            onClick={handleStartEdit}
          >
            <span className="text-xs text-muted-foreground truncate flex-1">
              {image.caption || (
                <span className="italic">No caption</span>
              )}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground/50 group-hover/caption:text-muted-foreground shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function GalleryDetailClient({
  gallery,
  countries,
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

      {/* Image grid */}
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
