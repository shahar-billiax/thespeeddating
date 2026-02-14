"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Link2,
  Trash2,
  Loader2,
  Search,
  ImagePlus,
  X,
  GripVertical,
  Pencil,
  Check,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface MediaFile {
  id: number;
  filename: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  alt_text: string | null;
  url: string;
  created_at: string;
}

interface MediaGalleryPanelProps {
  onInsertImage?: (url: string, alt: string) => void;
  onPickImage?: (file: MediaFile) => void;
  variant?: "sidebar" | "sheet";
  mode?: "insert" | "pick";
  refreshKey?: number;
  disableDrag?: boolean;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

export function MediaGalleryPanel({
  onInsertImage,
  onPickImage,
  variant = "sidebar",
  mode = "insert",
  refreshKey,
  disableDrag = false,
}: MediaGalleryPanelProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [urlImporting, setUrlImporting] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOverUpload, setDragOverUpload] = useState(false);

  // Alt text editing
  const [editingAlt, setEditingAlt] = useState<number | null>(null);
  const [altValue, setAltValue] = useState("");
  const altInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Bulk selection
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles(data.files);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Re-fetch when refreshKey changes (e.g. after importing via URL dialog)
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      fetchFiles();
    }
  }, [refreshKey, fetchFiles]);

  const handleUpload = async (fileList: FileList) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      for (const file of Array.from(fileList)) {
        formData.append("files", file);
      }
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles((prev) => [...data.files, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlImport = async () => {
    if (!urlValue.trim()) return;
    setUrlImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlValue.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles((prev) => [data.file, ...prev]);
      setUrlValue("");
      setShowUrlInput(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUrlImporting(false);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    try {
      const res = await fetch(`/api/admin/media/${file.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveAlt = async (file: MediaFile) => {
    try {
      const res = await fetch(`/api/admin/media/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt_text: altValue }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, alt_text: altValue } : f))
      );
      setEditingAlt(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    setError(null);
    try {
      const ids = Array.from(selected);
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/media/${id}`, { method: "DELETE" }).then((r) =>
            r.json()
          )
        )
      );
      setFiles((prev) => prev.filter((f) => !selected.has(f.id)));
      setSelected(new Set());
      setSelectMode(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, file: MediaFile) => {
    if (selectMode) return;
    e.dataTransfer.setData("text/x-media-url", file.url);
    e.dataTransfer.setData("text/plain", file.url);
    e.dataTransfer.effectAllowed = "copy";
    const img = e.currentTarget.querySelector("img");
    if (img) {
      e.dataTransfer.setDragImage(img, 40, 40);
    }
  };

  // Upload drop zone handlers
  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setDragOverUpload(true);
    }
  };

  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setDragOverUpload(false);
    }
  };

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverUpload(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const filteredFiles = search
    ? files.filter((f) =>
        f.filename.toLowerCase().includes(search.toLowerCase())
      )
    : files;

  return (
    <div className={cn(
      "flex flex-col border rounded-lg bg-background shadow-sm",
      variant === "sheet"
        ? "h-full"
        : "sticky top-2 h-[calc(100vh-1rem)]"
    )}>
      {/* Header */}
      <div className="p-3 border-b shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-primary" />
            Media Gallery
          </h3>
          {mode === "insert" && files.length > 0 && (
            <Button
              type="button"
              variant={selectMode ? "secondary" : "ghost"}
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={() => {
                setSelectMode(!selectMode);
                setSelected(new Set());
              }}
            >
              {selectMode ? "Cancel" : "Select"}
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {selectMode
            ? `${selected.size} selected`
            : mode === "pick"
              ? "Click an image to select it"
              : "Drag images into the editor or click to insert"}
        </p>
      </div>

      {/* Actions */}
      <div className="p-3 border-b space-y-2 shrink-0">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <Upload className="h-3 w-3 mr-1.5" />
            )}
            Upload
          </Button>
          <Button
            type="button"
            variant={showUrlInput ? "secondary" : "outline"}
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={() => setShowUrlInput((prev) => !prev)}
          >
            <Link2 className="h-3 w-3 mr-1.5" />
            From URL
          </Button>
        </div>

        {showUrlInput && (
          <div className="flex gap-1.5">
            <Input
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="text-xs h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUrlImport();
                }
              }}
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 shrink-0"
              onClick={handleUrlImport}
              disabled={urlImporting || !urlValue.trim()}
            >
              {urlImporting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        )}

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

        {/* Search */}
        {files.length > 4 && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images..."
              className="text-xs h-8 pl-7 pr-7"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-2 text-xs text-destructive bg-destructive/10 mx-3 mt-2 rounded flex items-start gap-1.5">
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 hover:text-destructive/80"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Image grid with upload drop zone */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-3 min-h-0 relative",
          dragOverUpload && "ring-2 ring-inset ring-primary/40 bg-primary/5"
        )}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={handleDropZoneDragLeave}
        onDrop={handleDropZoneDrop}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-10 px-4">
            <ImagePlus className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              {search
                ? "No images match your search"
                : "No images yet. Upload files or add from URL."}
            </p>
            {!search && (
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                You can also drop files here
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 2xl:grid-cols-5 gap-1">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                draggable={!selectMode && !disableDrag}
                onDragStart={(e) => handleDragStart(e, file)}
                onClick={() => {
                  if (selectMode) {
                    toggleSelect(file.id);
                  } else if (mode === "pick") {
                    onPickImage?.(file);
                  } else {
                    onInsertImage?.(file.url, file.alt_text || file.filename);
                  }
                }}
                className={cn(
                  "group relative aspect-square rounded overflow-hidden border bg-muted/30",
                  selectMode || disableDrag
                    ? "cursor-pointer"
                    : "cursor-grab active:cursor-grabbing",
                  selected.has(file.id)
                    ? "ring-2 ring-primary border-primary"
                    : "hover:ring-2 hover:ring-primary/50 hover:border-primary/30",
                  "transition-all duration-150"
                )}
                title={`${file.filename}\n${formatSize(file.file_size)}${file.alt_text ? `\nAlt: ${file.alt_text}` : ""}`}
              >
                <img
                  src={file.url}
                  alt={file.alt_text || file.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />

                {/* Selection checkbox */}
                {selectMode && (
                  <div className="absolute top-1 left-1 z-10">
                    {selected.has(file.id) ? (
                      <CheckSquare className="h-5 w-5 text-primary drop-shadow" />
                    ) : (
                      <Square className="h-5 w-5 text-white/80 drop-shadow" />
                    )}
                  </div>
                )}

                {/* Hover overlay */}
                {!selectMode && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-1.5">
                      <span className="text-[10px] text-white truncate flex-1 mr-1 leading-tight">
                        {file.filename}
                        {file.file_size && (
                          <span className="block text-white/70">
                            {formatSize(file.file_size)}
                          </span>
                        )}
                      </span>
                      <div className="flex gap-0.5 shrink-0">
                        {/* Edit alt text */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAltValue(file.alt_text || "");
                            setEditingAlt(file.id);
                            setTimeout(() => altInputRef.current?.focus(), 0);
                          }}
                          className="p-1 rounded bg-white/80 hover:bg-white text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit alt text"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(file);
                          }}
                          className="p-1 rounded bg-destructive/80 hover:bg-destructive text-white transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Drag hint icon */}
                {!selectMode && !disableDrag && (
                  <div className="absolute top-1 right-1 hidden group-hover:flex p-0.5 rounded bg-white/90 shadow-sm">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}

                {/* Alt text badge */}
                {file.alt_text && !selectMode && (
                  <div className="absolute top-1 left-1 hidden group-hover:block">
                    <span className="text-[9px] bg-black/60 text-white px-1 py-0.5 rounded">
                      ALT
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Drop overlay message */}
        {dragOverUpload && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5 pointer-events-none">
            <div className="bg-background border-2 border-dashed border-primary/40 rounded-lg px-6 py-4 shadow-sm">
              <Upload className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-sm font-medium text-primary">
                Drop files to upload
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Alt text editor popover */}
      {editingAlt !== null && (
        <div className="p-3 border-t shrink-0 bg-muted/30 space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Alt Text
          </label>
          <div className="flex gap-1.5">
            <Input
              ref={altInputRef}
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              placeholder="Describe this image..."
              className="text-xs h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const file = files.find((f) => f.id === editingAlt);
                  if (file) handleSaveAlt(file);
                }
                if (e.key === "Escape") setEditingAlt(null);
              }}
            />
            <Button
              type="button"
              size="sm"
              className="h-8 px-2 shrink-0"
              onClick={() => {
                const file = files.find((f) => f.id === editingAlt);
                if (file) handleSaveAlt(file);
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 shrink-0"
              onClick={() => setEditingAlt(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {selectMode && selected.size > 0 && (
        <div className="p-2 border-t shrink-0 bg-muted/30 flex items-center justify-between">
          <span className="text-xs font-medium">
            {selected.size} selected
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setBulkDeleteOpen(true)}
            disabled={bulkDeleting}
          >
            {bulkDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-3 w-3 mr-1" />
            )}
            Delete
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t text-[10px] text-muted-foreground text-center shrink-0">
        {filteredFiles.length} image{filteredFiles.length !== 1 ? "s" : ""}
        {search && files.length !== filteredFiles.length
          ? ` (filtered from ${files.length})`
          : ""}
      </div>

      {/* Single delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1.5 overflow-hidden">
                <p className="truncate font-medium text-foreground/80">
                  {deleteTarget?.filename}
                </p>
                <p>
                  This image will be permanently deleted. This action cannot
                  be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteTarget) handleDelete(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size} image{selected.size !== 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The selected images will be permanently deleted. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setBulkDeleteOpen(false);
                handleBulkDelete();
              }}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
