"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { MediaGalleryPanel } from "./media-gallery-panel";
import type { MediaFile } from "./media-gallery-panel";

interface MediaGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage?: (url: string, alt: string) => void;
  onPickImage?: (file: MediaFile) => void;
  mode?: "insert" | "pick";
}

export function MediaGalleryDialog({
  open,
  onOpenChange,
  onInsertImage,
  onPickImage,
  mode = "insert",
}: MediaGalleryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl p-0 gap-0 h-[80vh] max-h-[700px]"
        showCloseButton={false}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Media Gallery</DialogTitle>
        </VisuallyHidden.Root>
        <MediaGalleryPanel
          variant="sheet"
          mode={mode}
          disableDrag
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
      </DialogContent>
    </Dialog>
  );
}
