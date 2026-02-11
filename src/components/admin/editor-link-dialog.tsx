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
import { Switch } from "@/components/ui/switch";

interface EditorLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  initialNewTab?: boolean;
  onSubmit: (url: string, newTab: boolean) => void;
  onRemove?: () => void;
}

export function EditorLinkDialog({
  open,
  onOpenChange,
  initialUrl = "",
  initialNewTab = true,
  onSubmit,
  onRemove,
}: EditorLinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [newTab, setNewTab] = useState(initialNewTab);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), newTab);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialUrl ? "Edit Link" : "Insert Link"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="link-new-tab"
              checked={newTab}
              onCheckedChange={setNewTab}
            />
            <Label htmlFor="link-new-tab">Open in new tab</Label>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {initialUrl && onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onRemove();
                  onOpenChange(false);
                }}
              >
                Remove Link
              </Button>
            )}
            <Button type="submit" disabled={!url.trim()}>
              {initialUrl ? "Update" : "Insert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
