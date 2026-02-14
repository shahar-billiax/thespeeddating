"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MediaGalleryPanel } from "./media-gallery-panel";
import type { MediaFile } from "./media-gallery-panel";

interface MediaGallerySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage?: (url: string, alt: string) => void;
  onPickImage?: (file: MediaFile) => void;
  mode?: "insert" | "pick";
}

export function MediaGallerySheet({
  open,
  onOpenChange,
  onInsertImage,
  onPickImage,
  mode = "insert",
}: MediaGallerySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0" showCloseButton={false}>
        <MediaGalleryPanel
          variant="sheet"
          mode={mode}
          onInsertImage={
            onInsertImage
              ? (url, alt) => {
                  onInsertImage(url, alt);
                  onOpenChange(false);
                }
              : undefined
          }
          onPickImage={
            onPickImage
              ? (file) => {
                  onPickImage(file);
                  onOpenChange(false);
                }
              : undefined
          }
        />
      </SheetContent>
    </Sheet>
  );
}
