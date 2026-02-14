"use client";

import { useState, useRef, useEffect } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./media-image-crop.css";
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop as CropIcon,
  Save,
  Loader2,
  Undo2,
  Info,
  Sun,
  Contrast,
  Droplets,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

interface MediaImageEditorProps {
  file: MediaFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (file: MediaFile) => void;
  initialTab?: "details" | "edit";
}

function formatSize(bytes: number | null) {
  if (!bytes) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DEFAULT_ADJUSTMENTS = { brightness: 100, contrast: 100, saturate: 100 };
type Adjustments = typeof DEFAULT_ADJUSTMENTS;

const ASPECTS: { label: string; value: number | undefined }[] = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "9:16", value: 9 / 16 },
];

export function MediaImageEditor({
  file,
  open,
  onOpenChange,
  onUpdate,
  initialTab = "details",
}: MediaImageEditorProps) {
  const [filename, setFilename] = useState("");
  const [altText, setAltText] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsDirty, setDetailsDirty] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectIdx, setAspectIdx] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [adjustments, setAdjustments] =
    useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const [savingImage, setSavingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  // Reset state when opening a file (including reopening the same file)
  useEffect(() => {
    if (open && file) {
      setFilename(file.filename);
      setAltText(file.alt_text || "");
      setDetailsDirty(false);
      setDetailsError(null);
      setActiveTab(initialTab);
      resetEdits();
      loadDimensions(file.url);
    }
  }, [open, file?.id]);

  function loadDimensions(url: string) {
    const img = new window.Image();
    img.onload = () =>
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
  }

  function initFullCrop() {
    setCrop({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
    setCompletedCrop(undefined);
  }

  function resetEdits() {
    setAspectIdx(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setShowAdjustments(false);
    setImageError(null);
    initFullCrop();
  }

  // Crop is "significant" only if user actually adjusted it away from full image
  const isCropSignificant =
    completedCrop &&
    imgRef.current &&
    (completedCrop.width < imgRef.current.width * 0.98 ||
      completedCrop.height < imgRef.current.height * 0.98 ||
      completedCrop.x > imgRef.current.width * 0.02 ||
      completedCrop.y > imgRef.current.height * 0.02);
  const hasAdjustments =
    adjustments.brightness !== 100 ||
    adjustments.contrast !== 100 ||
    adjustments.saturate !== 100;
  const hasEdits = !!isCropSignificant || aspectIdx !== 0 || rotation !== 0 || flipH || flipV || hasAdjustments;

  useEffect(() => {
    if (!file) return;
    setDetailsDirty(filename !== file.filename || altText !== (file.alt_text || ""));
  }, [filename, altText, file]);

  function selectAspect(idx: number) {
    setAspectIdx(idx);
    const aspect = ASPECTS[idx].value;
    if (imgRef.current) {
      const { naturalWidth: w, naturalHeight: h } = imgRef.current;
      const dispW = imgRef.current.width;
      const dispH = imgRef.current.height;
      let newCrop: Crop;
      if (aspect !== undefined) {
        newCrop = centerCrop(
          makeAspectCrop({ unit: "%", width: 90 }, aspect, w, h),
          w,
          h
        );
      } else {
        newCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };
      }
      setCrop(newCrop);
      // Compute pixel crop so Save works without needing an extra drag
      if (newCrop.unit === "%") {
        setCompletedCrop({
          unit: "px",
          x: (newCrop.x / 100) * dispW,
          y: (newCrop.y / 100) * dispH,
          width: (newCrop.width / 100) * dispW,
          height: (newCrop.height / 100) * dispH,
        });
      }
    }
  }

  async function handleSaveDetails() {
    if (!file) return;
    setSavingDetails(true);
    setDetailsError(null);
    try {
      const res = await fetch(`/api/admin/media/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, alt_text: altText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onUpdate(data.file);
      setDetailsDirty(false);
      toast.success("Details saved");
    } catch (err: any) {
      setDetailsError(err.message);
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleSaveImage() {
    if (!file || !imgRef.current) return;
    setSavingImage(true);
    setImageError(null);
    try {
      // Load a fresh image via fetch → blob → object URL to avoid CORS/cache tainting
      const freshImg = await loadImageForCanvas(file.url);
      const displayW = imgRef.current.width;
      const displayH = imgRef.current.height;

      const applyCrop =
        (isCropSignificant || aspectIdx !== 0) && completedCrop
          ? completedCrop
          : null;
      const canvas = renderToCanvas(
        freshImg,
        displayW,
        displayH,
        applyCrop,
        rotation,
        flipH,
        flipV,
        adjustments
      );
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
          file.mime_type || "image/jpeg",
          0.92
        )
      );
      const formData = new FormData();
      formData.append("file", blob, file.filename);
      const res = await fetch(`/api/admin/media/${file.id}/edit`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onUpdate(data.file);
      resetEdits();
      onOpenChange(false);
      toast.success("Image saved", {
        description: "Your edits have been applied successfully.",
      });
    } catch (err: any) {
      setImageError(err.message || "Failed to save image");
      toast.error("Failed to save image", {
        description: err.message || "Something went wrong.",
      });
    } finally {
      setSavingImage(false);
    }
  }

  if (!file) return null;

  const aspect = ASPECTS[aspectIdx].value;

  // Compute display size: scale up tiny images, cap tall ones
  const imageDisplayStyle = (() => {
    if (!dimensions) return {};
    const { width: natW, height: natH } = dimensions;
    const MIN_SIZE = 180; // ensure the larger side is at least this
    const maxDim = Math.max(natW, natH);
    if (maxDim < MIN_SIZE) {
      const scale = MIN_SIZE / maxDim;
      return { width: Math.round(natW * scale), height: Math.round(natH * scale) };
    }
    return {};
  })();

  const filterCSS = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%)`;
  const transformParts: string[] = [];
  if (rotation) transformParts.push(`rotate(${rotation}deg)`);
  if (flipH) transformParts.push("scaleX(-1)");
  if (flipV) transformParts.push("scaleY(-1)");
  const transformCSS = transformParts.join(" ") || undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="truncate pr-8">{file.filename}</SheetTitle>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-[calc(100vh-80px)]"
        >
          <TabsList className="mx-6 mt-4 grid w-auto grid-cols-2">
            <TabsTrigger value="details" className="gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Details
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-1.5">
              <CropIcon className="h-3.5 w-3.5" />
              Edit Image
            </TabsTrigger>
          </TabsList>

          {/* ── Details ── */}
          <TabsContent
            value="details"
            className="flex-1 overflow-y-auto px-6 pb-6 mt-0"
          >
            <div className="space-y-6 pt-4">
              <div className="rounded-lg overflow-hidden border bg-muted/30">
                <img
                  src={file.url}
                  alt={file.alt_text || file.filename}
                  className="w-full max-h-64 object-contain"
                />
              </div>

              {detailsError && (
                <p className="text-sm text-destructive">{detailsError}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="media-filename">Filename</Label>
                <Input
                  id="media-filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-alt">
                  Alt Text
                  <span className="text-muted-foreground font-normal ml-1.5">
                    (accessibility)
                  </span>
                </Label>
                <textarea
                  id="media-alt"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe what this image shows for screen readers and SEO..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {altText.length > 0
                    ? `${altText.length} characters`
                    : "No alt text set"}
                  {altText.length > 125 && " — consider keeping under 125 chars"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>File Information</Label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm rounded-lg border p-3 bg-muted/20">
                  <span className="text-muted-foreground">Size</span>
                  <span>{formatSize(file.file_size)}</span>
                  <span className="text-muted-foreground">Type</span>
                  <span>{file.mime_type || "Unknown"}</span>
                  {dimensions && (
                    <>
                      <span className="text-muted-foreground">Dimensions</span>
                      <span>
                        {dimensions.width} x {dimensions.height} px
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground">Uploaded</span>
                  <span>{formatDate(file.created_at)}</span>
                  <span className="text-muted-foreground">Path</span>
                  <span className="truncate text-xs font-mono">
                    {file.storage_path}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSaveDetails}
                disabled={savingDetails || !detailsDirty}
                className="w-full"
              >
                {savingDetails ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {savingDetails ? "Saving..." : "Save Details"}
              </Button>
            </div>
          </TabsContent>

          {/* ── Edit Image ── */}
          <TabsContent
            value="edit"
            className="flex-1 overflow-y-auto px-6 pb-6 mt-0"
          >
            <div className="space-y-4 pt-4">
              {/* Canvas area */}
              <div className="crop-modern rounded-lg border bg-neutral-950 flex items-center justify-center p-3 overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-w-full"
                  ruleOfThirds
                >
                  <img
                    ref={imgRef}
                    src={file.url}
                    alt={file.alt_text || file.filename}
                    onLoad={(e) => {
                      const { naturalWidth: w, naturalHeight: h } =
                        e.currentTarget;
                      setDimensions({ width: w, height: h });
                      // Auto-init crop so handles are visible immediately
                      if (!crop || crop.width === 0) {
                        const a = ASPECTS[aspectIdx].value;
                        if (a !== undefined) {
                          setCrop(
                            centerCrop(
                              makeAspectCrop({ unit: "%", width: 90 }, a, w, h),
                              w,
                              h
                            )
                          );
                        } else {
                          setCrop({
                            unit: "%",
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 100,
                          });
                        }
                      }
                    }}
                    className="block w-auto max-w-full"
                    style={{ maxHeight: "35vh", ...imageDisplayStyle, filter: filterCSS, transform: transformCSS }}
                    draggable={false}
                  />
                </ReactCrop>
              </div>

              {/* Crop info */}
              {isCropSignificant && completedCrop && dimensions && imgRef.current && (
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {Math.round(completedCrop.width * (dimensions.width / imgRef.current.width))} x{" "}
                    {Math.round(completedCrop.height * (dimensions.height / imgRef.current.height))} px
                  </span>
                </div>
              )}

              {imageError && (
                <p className="text-sm text-destructive">{imageError}</p>
              )}

              {/* Aspect presets */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Crop Ratio
                </p>
                <div className="flex flex-wrap gap-1">
                  {ASPECTS.map((a, idx) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => selectAspect(idx)}
                      className={cn(
                        "h-7 px-2.5 rounded-md text-xs font-medium transition-colors",
                        aspectIdx === idx
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transform buttons */}
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                  Rotate
                </Button>
                <Button
                  variant={flipH ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFlipH((v) => !v)}
                >
                  <FlipHorizontal className="h-3.5 w-3.5 mr-1.5" />
                  Flip H
                </Button>
                <Button
                  variant={flipV ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFlipV((v) => !v)}
                >
                  <FlipVertical className="h-3.5 w-3.5 mr-1.5" />
                  Flip V
                </Button>
                {hasEdits && (
                  <Button variant="ghost" size="sm" onClick={resetEdits}>
                    <Undo2 className="h-3.5 w-3.5 mr-1.5" />
                    Reset
                  </Button>
                )}
              </div>

              {/* Adjustments — collapsible */}
              <div className="rounded-lg border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdjustments((v) => !v)}
                  className={cn(
                    "flex items-center justify-between w-full p-3 text-sm font-medium transition-colors hover:bg-muted/30",
                    hasAdjustments && "text-primary"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Adjustments
                    {hasAdjustments && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        modified
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      showAdjustments && "rotate-180"
                    )}
                  />
                </button>
                {showAdjustments && (
                  <div className="px-3 pb-4 pt-1 space-y-3 border-t">
                    <AdjSlider
                      icon={Sun}
                      label="Brightness"
                      value={adjustments.brightness}
                      onChange={(v) =>
                        setAdjustments((a) => ({ ...a, brightness: v }))
                      }
                    />
                    <AdjSlider
                      icon={Contrast}
                      label="Contrast"
                      value={adjustments.contrast}
                      onChange={(v) =>
                        setAdjustments((a) => ({ ...a, contrast: v }))
                      }
                    />
                    <AdjSlider
                      icon={Droplets}
                      label="Saturation"
                      value={adjustments.saturate}
                      onChange={(v) =>
                        setAdjustments((a) => ({ ...a, saturate: v }))
                      }
                    />
                  </div>
                )}
              </div>

              {/* Save */}
              <Button
                onClick={handleSaveImage}
                disabled={savingImage || !hasEdits}
                className="w-full"
              >
                {savingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {savingImage ? "Saving..." : "Save Edited Image"}
              </Button>
              {hasEdits && (
                <p className="text-[11px] text-muted-foreground text-center -mt-2">
                  Overwrites the original with your edits
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

/* ── adjustment slider ── */

function AdjSlider({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: any;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <button
          type="button"
          onClick={() => onChange(100)}
          className={cn(
            "text-[11px] tabular-nums font-medium",
            value !== 100
              ? "text-primary hover:underline cursor-pointer"
              : "text-muted-foreground"
          )}
        >
          {value}%
        </button>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={200}
        step={1}
        className="[&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5"
      />
    </div>
  );
}

/* ── load image via fetch to avoid CORS cache tainting ── */

function loadImageForCanvas(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Fetch as blob to completely bypass browser CORS cache issues
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch image");
        return r.blob();
      })
      .then((blob) => {
        const objUrl = URL.createObjectURL(blob);
        const img = new window.Image();
        img.onload = () => {
          URL.revokeObjectURL(objUrl);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objUrl);
          reject(new Error("Failed to load image for editing"));
        };
        img.src = objUrl;
      })
      .catch(reject);
  });
}

/* ── canvas renderer ── */

function renderToCanvas(
  image: HTMLImageElement,
  displayW: number,
  displayH: number,
  cropPx: PixelCrop | null,
  rotation: number,
  flipH: boolean,
  flipV: boolean,
  adj: Adjustments
): HTMLCanvasElement {
  // Scale from displayed crop coords to natural image coords
  const scaleX = image.naturalWidth / displayW;
  const scaleY = image.naturalHeight / displayH;
  const sx = cropPx ? cropPx.x * scaleX : 0;
  const sy = cropPx ? cropPx.y * scaleY : 0;
  const sw = cropPx ? cropPx.width * scaleX : image.naturalWidth;
  const sh = cropPx ? cropPx.height * scaleY : image.naturalHeight;

  const rad = (rotation * Math.PI) / 180;
  const absSin = Math.abs(Math.sin(rad));
  const absCos = Math.abs(Math.cos(rad));
  const outW = Math.round(sw * absCos + sh * absSin);
  const outH = Math.round(sw * absSin + sh * absCos);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;

  ctx.filter = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturate}%)`;
  ctx.translate(outW / 2, outH / 2);
  if (flipH) ctx.scale(-1, 1);
  if (flipV) ctx.scale(1, -1);
  ctx.rotate(rad);
  ctx.drawImage(image, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);

  return canvas;
}
