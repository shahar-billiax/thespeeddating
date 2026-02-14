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
  Pencil,
  CheckSquare,
  Square,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import Link from "next/link";
import { MediaImageEditor } from "./media-image-editor";

interface MediaFile {
  id: number;
  filename: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  alt_text: string | null;
  url: string;
  created_at: string;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

export function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [urlImporting, setUrlImporting] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image editor
  const [editorFile, setEditorFile] = useState<MediaFile | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<"details" | "edit">("details");

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

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    setError(null);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
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

  const handleFileUpdate = (updated: MediaFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
    // Also update the editor file reference so the sheet shows fresh data
    setEditorFile(updated);
  };

  const filteredFiles = search
    ? files.filter((f) =>
        f.filename.toLowerCase().includes(search.toLowerCase())
      )
    : files;

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
            <h1 className="text-2xl font-bold">Media Library</h1>
            <p className="text-sm text-muted-foreground">
              Central image library. Click any image to edit details, crop, or
              adjust.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <Button
              type="button"
              variant={selectMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setSelectMode(!selectMode);
                setSelected(new Set());
              }}
            >
              {selectMode ? "Cancel Selection" : "Select"}
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload + Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 items-center">
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
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
            <Button
              type="button"
              variant={showUrlInput ? "secondary" : "outline"}
              onClick={() => setShowUrlInput((prev) => !prev)}
            >
              <Link2 className="h-4 w-4 mr-2" />
              From URL
            </Button>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search images..."
                  className="pl-9"
                />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredFiles.length} image
              {filteredFiles.length !== 1 ? "s" : ""}
              {search ? ` (filtered from ${files.length})` : ""}
            </span>
          </div>

          {showUrlInput && (
            <div className="flex gap-2 mt-3 max-w-lg">
              <Input
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://example.com/image.jpg"
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
                onClick={handleUrlImport}
                disabled={urlImporting || !urlValue.trim()}
              >
                {urlImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Import"
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
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectMode && selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
            disabled={bulkDeleting}
          >
            {bulkDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1.5" />
            )}
            Delete Selected
          </Button>
        </div>
      )}

      {/* Image grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20">
          <ImagePlus className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search
              ? "No images match your search"
              : "No images yet. Upload files or import from URL."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => {
                if (selectMode) {
                  toggleSelect(file.id);
                } else {
                  setEditorTab("details");
                  setEditorFile(file);
                  setEditorOpen(true);
                }
              }}
              className={cn(
                "group relative aspect-square rounded-lg overflow-hidden border bg-muted/30 cursor-pointer",
                selected.has(file.id)
                  ? "ring-2 ring-primary border-primary"
                  : "hover:ring-2 hover:ring-primary/50 hover:border-primary/30",
                "transition-all duration-150"
              )}
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
                <div className="absolute top-2 left-2 z-10">
                  {selected.has(file.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary drop-shadow" />
                  ) : (
                    <Square className="h-5 w-5 text-white/80 drop-shadow" />
                  )}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-[11px] text-white truncate leading-tight">
                    {file.filename}
                  </p>
                  <p className="text-[10px] text-white/70">
                    {formatSize(file.file_size)}
                    {file.alt_text && " · ALT"}
                  </p>
                </div>
                {!selectMode && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorTab("edit");
                        setEditorFile(file);
                        setEditorOpen(true);
                      }}
                      className="p-1.5 rounded bg-white/90 hover:bg-white text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit image"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(file);
                      }}
                      className="p-1.5 rounded bg-destructive/90 hover:bg-destructive text-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image editor sheet */}
      <MediaImageEditor
        file={editorFile}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onUpdate={handleFileUpdate}
        initialTab={editorTab}
      />

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
