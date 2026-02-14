"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";

interface CoverImageUploadProps {
  currentImage: string | null;
  onSave: (storagePath: string | null) => Promise<any>;
  label?: string;
}

export function CoverImageUpload({
  currentImage,
  onSave,
  label = "Cover Image",
}: CoverImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const imageUrl = currentImage
    ? `${supabaseUrl}/storage/v1/object/public/media/${currentImage}`
    : null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      // Upload via media API
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { files } = await res.json();
      const storagePath = files[0].storage_path;

      // Save to the entity
      startTransition(async () => {
        await onSave(storagePath);
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
      });
    } catch {
      setPreview(null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleRemove() {
    startTransition(async () => {
      await onSave(null);
    });
  }

  const displayUrl = preview || imageUrl;
  const busy = uploading || isPending;

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      {displayUrl ? (
        <div className="relative group rounded-lg overflow-hidden border border-border/40 bg-muted/20">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={displayUrl}
              alt="Cover"
              fill
              className="object-cover"
              unoptimized
            />
            {busy && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          {!busy && (
            <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs shadow-sm"
                onClick={() => fileRef.current?.click()}
              >
                Change
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 w-7 p-0 shadow-sm"
                onClick={handleRemove}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary cursor-pointer"
        >
          {busy ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm font-medium">Upload image</span>
            </>
          )}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
