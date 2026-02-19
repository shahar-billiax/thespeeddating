"use client";

import { Node, mergeAttributes } from "@tiptap/react";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Pencil,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & config                                                     */
/* ------------------------------------------------------------------ */

type ImageAlign = "none" | "left" | "center" | "right";

const ALIGN_OPTIONS: { value: ImageAlign; title: string; icon: React.ReactNode }[] = [
  { value: "none",   title: "Block — no text wrap",          icon: <Maximize2   className="h-3 w-3" /> },
  { value: "left",   title: "Float left — text wraps right", icon: <AlignLeft   className="h-3 w-3" /> },
  { value: "center", title: "Center",                        icon: <AlignCenter className="h-3 w-3" /> },
  { value: "right",  title: "Float right — text wraps left", icon: <AlignRight  className="h-3 w-3" /> },
];

const SIZE_PRESETS = [
  { label: "S",    title: "Small (200 px)",                  px: 200 },
  { label: "M",    title: "Medium (400 px)",                 px: 400 },
  { label: "L",    title: "Large (600 px)",                  px: 600 },
  { label: "Full", title: "Full width (remove size limit)",  px: 0   },
] as const;

/* ------------------------------------------------------------------ */
/*  React NodeView component                                           */
/* ------------------------------------------------------------------ */

function ResizableImageView({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
}: {
  node: any;
  updateAttributes: (attrs: Record<string, any>) => void;
  deleteNode: () => void;
  selected: boolean;
  editor: any;
}) {
  const { src, alt, title, width, align } = node.attrs as {
    src: string;
    alt: string | null;
    title: string | null;
    width: number | null;
    align: ImageAlign;
  };

  // Derive RTL directly from the editor's DOM element on every render —
  // avoids the one-shot useEffect missing direction changes on language switch.
  const isRtl: boolean = editor?.view?.dom
    ? getComputedStyle(editor.view.dom).direction === "rtl"
    : false;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing]     = useState(false);
  const [liveWidth, setLiveWidth]   = useState<number | null>(null);
  const [editingAlt, setEditingAlt] = useState(false);
  const [altInput, setAltInput]     = useState(alt ?? "");
  const startX                      = useRef(0);
  const startWidth                  = useRef(0);

  // Keep altInput in sync when not actively editing
  useEffect(() => {
    if (!editingAlt) setAltInput(alt ?? "");
  }, [alt, editingAlt]);

  /* ── Resize drag ── */
  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(true);
      startX.current = e.clientX;
      startWidth.current = wrapperRef.current?.offsetWidth ?? 300;
      // Re-read direction at drag start so we always have the current value
      const rtl = editor?.view?.dom
        ? getComputedStyle(editor.view.dom).direction === "rtl"
        : false;
      const direction = rtl ? -1 : 1;

      const onMouseMove = (ev: MouseEvent) => {
        const diff = (ev.clientX - startX.current) * direction;
        const newWidth = Math.max(60, startWidth.current + diff);
        setLiveWidth(newWidth);
        if (wrapperRef.current) wrapperRef.current.style.width = `${newWidth}px`;
      };

      const onMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        setResizing(false);
        setLiveWidth(null);
        const diff = (ev.clientX - startX.current) * direction;
        updateAttributes({ width: Math.max(60, startWidth.current + diff) });
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes, editor]
  );

  /* ── Helpers ── */
  function setAlign(newAlign: ImageAlign) {
    updateAttributes({ align: newAlign });
  }

  function setWidth(px: number) {
    updateAttributes({ width: px || null });
  }

  function commitAlt() {
    updateAttributes({ alt: altInput });
    setEditingAlt(false);
  }

  /* ── Outer wrapper styling (drives float) ── */
  const outerStyle: React.CSSProperties =
    align === "left"
      ? { float: "left",  marginRight: "1.5rem", marginBottom: "0.5rem" }
      : align === "right"
        ? { float: "right", marginLeft: "1.5rem",  marginBottom: "0.5rem" }
        : {};

  const outerClass =
    align === "center" ? "relative my-2 flex justify-center" : "relative my-2";

  return (
    <NodeViewWrapper
      as="div"
      className={outerClass}
      style={outerStyle}
      data-drag-handle=""
      draggable
    >
      <div
        ref={wrapperRef}
        className="relative inline-block group"
        style={{ width: width ? `${width}px` : undefined }}
      >
        {/* Image */}
        <img
          src={src}
          alt={alt || ""}
          title={title || ""}
          className="w-full h-auto rounded-md block select-none"
          draggable={false}
        />

        {/* Selection / hover outline */}
        <div
          className={`absolute inset-0 rounded-md ring-2 pointer-events-none transition-opacity ${
            selected
              ? "ring-primary opacity-100"
              : "ring-primary/40 opacity-0 group-hover:opacity-100"
          }`}
        />

        {/* ── Inline selection toolbar ── */}
        {selected && (
          <div
            className="absolute bottom-[calc(100%+6px)] left-0 z-30 flex items-center gap-0.5 rounded-lg border bg-background shadow-lg p-1 select-none"
            onMouseDown={(e) => e.preventDefault()}
          >
            {/* Alignment */}
            {ALIGN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                title={opt.title}
                onClick={() => setAlign(opt.value)}
                className={`h-6 w-6 flex items-center justify-center rounded text-foreground hover:bg-muted transition-colors ${
                  (align ?? "none") === opt.value ? "bg-muted ring-1 ring-border" : ""
                }`}
              >
                {opt.icon}
              </button>
            ))}

            <div className="w-px h-4 bg-border mx-0.5" />

            {/* Size presets */}
            {SIZE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                title={preset.title}
                onClick={() => setWidth(preset.px)}
                className="h-6 px-1 flex items-center justify-center rounded text-foreground text-[10px] font-semibold hover:bg-muted transition-colors"
              >
                {preset.label}
              </button>
            ))}

            <div className="w-px h-4 bg-border mx-0.5" />

            {/* Alt text — inline editor */}
            {editingAlt ? (
              <input
                className="h-6 text-[11px] px-1.5 border rounded bg-background w-28 focus:outline-none focus:ring-1 focus:ring-ring"
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
                placeholder="Alt text…"
                autoFocus
                onBlur={commitAlt}
                onKeyDown={(e) => {
                  if (e.key === "Enter")  { e.preventDefault(); commitAlt(); }
                  if (e.key === "Escape") { setEditingAlt(false); setAltInput(alt ?? ""); }
                }}
              />
            ) : (
              <button
                type="button"
                title={alt ? `Alt: "${alt}" — click to edit` : "Add alt text"}
                onClick={() => setEditingAlt(true)}
                className={`h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors ${
                  alt ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* Delete button — hover corner */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteNode}
          className={`absolute -top-2 z-10 h-5 w-5 flex items-center justify-center rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-all opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 ${isRtl ? "-left-2" : "-right-2"}`}
          title="Remove image"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          className={`absolute -bottom-1 z-10 h-3 w-3 rounded-full bg-background border-2 border-primary/60 transition-all opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 ${isRtl ? "-left-1 cursor-sw-resize" : "-right-1 cursor-se-resize"}`}
          title="Drag to resize"
        />

        {/* Width badge while resizing */}
        {resizing && liveWidth !== null && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap">
            {Math.round(liveWidth)}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

/* ------------------------------------------------------------------ */
/*  Extension                                                          */
/* ------------------------------------------------------------------ */

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: number;
        align?: ImageAlign;
      }) => ReturnType;
    };
  }
}

export const ResizableImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const w = el.getAttribute("width") || el.style.width?.replace("px", "");
          return w ? Number(w) : null;
        },
        renderHTML: (attrs: Record<string, any>) =>
          attrs.width ? { width: attrs.width } : {},
      },
      align: {
        default: "none" as ImageAlign,
        parseHTML: (el: HTMLElement) =>
          (el.getAttribute("data-align") as ImageAlign) ?? "none",
        renderHTML: (attrs: Record<string, any>) =>
          attrs.align && attrs.align !== "none" ? { "data-align": attrs.align } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { width, "data-align": align, ...rest } = HTMLAttributes;

    const styleParts: string[] = [];
    if (width) styleParts.push(`width: ${width}px`);
    if (align === "left")
      styleParts.push("float: left; margin-right: 1.5rem; margin-bottom: 0.5rem");
    else if (align === "right")
      styleParts.push("float: right; margin-left: 1.5rem; margin-bottom: 0.5rem");
    else if (align === "center")
      styleParts.push("display: block; margin-left: auto; margin-right: auto");

    const attrs: Record<string, unknown> = {
      ...rest,
      class: "max-w-full h-auto rounded-md",
    };
    if (width) attrs.width = width;
    if (align && align !== "none") attrs["data-align"] = align;
    if (styleParts.length) attrs.style = styleParts.join("; ");

    return ["img", attrs];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
