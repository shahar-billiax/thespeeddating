"use client";

import { Node, mergeAttributes } from "@tiptap/react";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  React NodeView component                                           */
/* ------------------------------------------------------------------ */

function ResizableImageView({
  node,
  updateAttributes,
  deleteNode,
}: {
  node: any;
  updateAttributes: (attrs: Record<string, any>) => void;
  deleteNode: () => void;
  selected: boolean;
}) {
  const { src, alt, title, width } = node.attrs;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const [liveWidth, setLiveWidth] = useState<number | null>(null);
  const [isRtl, setIsRtl] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    if (wrapperRef.current) {
      const dir = getComputedStyle(wrapperRef.current).direction;
      setIsRtl(dir === "rtl");
    }
  }, []);

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(true);
      startX.current = e.clientX;
      startWidth.current = wrapperRef.current?.offsetWidth ?? 300;
      // In RTL the handle is on the left, so dragging left (negative diff) should grow
      const direction = isRtl ? -1 : 1;

      const onMouseMove = (ev: MouseEvent) => {
        const diff = (ev.clientX - startX.current) * direction;
        const newWidth = Math.max(60, startWidth.current + diff);
        setLiveWidth(newWidth);
        if (wrapperRef.current) {
          wrapperRef.current.style.width = `${newWidth}px`;
        }
      };

      const onMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        setResizing(false);
        setLiveWidth(null);
        const diff = (ev.clientX - startX.current) * direction;
        const newWidth = Math.max(60, startWidth.current + diff);
        updateAttributes({ width: newWidth });
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes, isRtl]
  );

  return (
    <NodeViewWrapper
      as="div"
      className="relative my-2"
      data-drag-handle=""
      draggable
    >
      <div
        ref={wrapperRef}
        className="relative inline-block group"
        style={{ width: width ? `${width}px` : undefined }}
      >
        {/* Image - clean, no decoration by default */}
        <img
          src={src}
          alt={alt || ""}
          title={title || ""}
          className="w-full h-auto rounded-md block select-none"
          draggable={false}
        />

        {/* Hover/selection outline */}
        <div className="absolute inset-0 rounded-md ring-2 ring-primary/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Delete button - hover only */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteNode}
          className={`absolute -top-2 z-10 h-5 w-5 flex items-center justify-center rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-all opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 ${isRtl ? "-left-2" : "-right-2"}`}
          title="Remove image"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Resize handle - bottom-end corner, hover only */}
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
          const w =
            el.getAttribute("width") ||
            el.style.width?.replace("px", "");
          return w ? Number(w) : null;
        },
        renderHTML: (attrs: Record<string, any>) => {
          if (!attrs.width) return {};
          return { width: attrs.width, style: `width: ${attrs.width}px` };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(
        { class: "max-w-full h-auto rounded-md" },
        HTMLAttributes
      ),
    ];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
