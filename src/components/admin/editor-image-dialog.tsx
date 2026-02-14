"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface EditorImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string, alt: string) => void;
  onImported?: () => void;
}

export function EditorImageDialog({
  open,
  onOpenChange,
  onSubmit,
  onImported,
}: EditorImageDialogProps) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onSubmit(data.file.url, alt.trim() || data.file.alt_text || "");
      onImported?.();
      setUrl("");
      setAlt("");
      setError(null);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to import image");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Image from URL</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={importing}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">
              The image will be downloaded and saved to your media library.
            </p>
          </div>
          <div>
            <Label htmlFor="image-alt">Alt Text</Label>
            <Input
              id="image-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
              disabled={importing}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={!url.trim() || importing}>
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                "Insert Image"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
