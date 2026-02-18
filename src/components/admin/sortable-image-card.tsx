"use client";

import { useState, useRef } from "react";
import {
  GripVertical,
  Trash2,
  Pencil,
  X,
  Check,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SortableImageData {
  id: number;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  url: string;
  created_at: string;
}

interface SortableImageCardProps {
  image: SortableImageData;
  onDelete: (id: number) => void;
  onCaptionSave: (id: number, caption: string) => void;
  onSetAsCover?: (id: number) => void;
  isCover?: boolean;
}

export function SortableImageCard({
  image,
  onDelete,
  onCaptionSave,
  onSetAsCover,
  isCover = false,
}: SortableImageCardProps) {
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
      className={`group relative rounded-lg overflow-hidden bg-background shadow-sm ${isCover ? "border-2 border-amber-400/70" : "border border-border"}`}
    >
      {/* Hover overlay with actions */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <div
            {...attributes}
            {...listeners}
            className="p-1 rounded bg-black/50 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5 text-white" />
          </div>
          {onSetAsCover && !isCover && (
            <button
              type="button"
              onClick={() => onSetAsCover(image.id)}
              className="p-1 rounded bg-black/50 hover:bg-amber-500/80 transition-colors"
              title="Set as cover image"
            >
              <Star className="h-3.5 w-3.5 text-white" />
            </button>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="p-1 rounded bg-destructive/80 hover:bg-destructive text-white"
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
      </div>

      {/* Cover badge — always visible */}
      {isCover && (
        <div className="absolute top-1.5 left-1.5 z-[5] px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-semibold leading-tight flex items-center gap-1 shadow-sm group-hover:opacity-0 transition-opacity">
          <Star className="h-2.5 w-2.5 fill-white" />
          Cover
        </div>
      )}

      {/* Image */}
      <div className="aspect-[4/3] bg-muted">
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
