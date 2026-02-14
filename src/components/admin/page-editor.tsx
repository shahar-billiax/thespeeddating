"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ResizableImage } from "./editor-resizable-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  AccentColor,
  getActiveAccentColor,
  isInAccentableBlock,
} from "./editor-accent-extension";
import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Link2,
  Image as ImageIcon,
  ImagePlus,
  Undo,
  Redo,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  SuperscriptIcon,
  SubscriptIcon,
  Type,
  Highlighter,
  RemoveFormatting,
  Code,
  Indent,
  Outdent,
  Table as TableIcon,
  ChevronDown,
  Palette,
  Rows3,
  Columns3,
  Trash2,
  ToggleLeft,
} from "lucide-react";
import { EditorLinkDialog } from "./editor-link-dialog";
import { EditorImageDialog } from "./editor-image-dialog";
import { EditorColorPicker } from "./editor-color-picker";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PageEditorProps {
  content: string;
  onChange: (html: string) => void;
  onOpenMediaGallery?: () => void;
  onImageImported?: () => void;
}

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "h4" | "codeBlock";

const BLOCK_TYPES: { value: BlockType; label: string; icon: React.ReactNode }[] = [
  { value: "paragraph", label: "Normal Text", icon: <Type className="h-4 w-4" /> },
  { value: "h1", label: "Heading 1", icon: <Heading1 className="h-4 w-4" /> },
  { value: "h2", label: "Heading 2", icon: <Heading2 className="h-4 w-4" /> },
  { value: "h3", label: "Heading 3", icon: <Heading3 className="h-4 w-4" /> },
  { value: "h4", label: "Heading 4", icon: <Heading4 className="h-4 w-4" /> },
  { value: "codeBlock", label: "Code Block", icon: <Code className="h-4 w-4" /> },
];

/* ------------------------------------------------------------------ */
/*  Shared small components                                            */
/* ------------------------------------------------------------------ */

function ToolbarButton({
  onClick,
  active,
  disabled,
  tooltip,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className={`h-8 w-8 p-0 ${active ? "bg-muted border border-border" : ""}`}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-6 bg-border my-auto mx-1" />;
}

/* ------------------------------------------------------------------ */
/*  Block-type selector                                                */
/* ------------------------------------------------------------------ */

function BlockTypeSelector({
  editor,
}: {
  editor: ReturnType<typeof useEditor>;
}) {
  if (!editor) return null;

  const current = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : editor.isActive("heading", { level: 4 })
          ? "h4"
          : editor.isActive("codeBlock")
            ? "codeBlock"
            : "paragraph";

  const activeBlock = BLOCK_TYPES.find((b) => b.value === current) ?? BLOCK_TYPES[0];

  function setBlock(type: BlockType) {
    if (!editor) return;
    const chain = editor.chain().focus();
    switch (type) {
      case "paragraph":
        chain.setParagraph().run();
        break;
      case "h1":
        chain.toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        chain.toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        chain.toggleHeading({ level: 3 }).run();
        break;
      case "h4":
        chain.toggleHeading({ level: 4 }).run();
        break;
      case "codeBlock":
        chain.toggleCodeBlock().run();
        break;
    }
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs font-medium min-w-[120px] justify-between"
            >
              <span className="flex items-center gap-1.5">
                {activeBlock.icon}
                {activeBlock.label}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Block type
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {BLOCK_TYPES.map((bt) => (
          <DropdownMenuItem
            key={bt.value}
            onClick={() => setBlock(bt.value)}
            className={current === bt.value ? "bg-muted" : ""}
          >
            <span className="flex items-center gap-2">
              {bt.icon}
              {bt.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  Table operations dropdown                                          */
/* ------------------------------------------------------------------ */

function TableMenu({
  editor,
}: {
  editor: ReturnType<typeof useEditor>;
}) {
  if (!editor) return null;

  const inTable = editor.isActive("table");

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${inTable ? "bg-muted border border-border" : ""}`}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Table
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        {!inTable ? (
          <DropdownMenuItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableIcon className="h-4 w-4 mr-2" />
            Insert Table
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowBefore().run()}
            >
              <Rows3 className="h-4 w-4 mr-2" />
              Add Row Before
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <Rows3 className="h-4 w-4 mr-2" />
              Add Row After
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Row
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
              <Columns3 className="h-4 w-4 mr-2" />
              Add Column Before
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <Columns3 className="h-4 w-4 mr-2" />
              Add Column After
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Column
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            >
              <ToggleLeft className="h-4 w-4 mr-2" />
              Toggle Header Row
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().mergeCells().run()}
            >
              Merge Cells
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().splitCell().run()}
            >
              Split Cell
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Table
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  Format indicator                                                   */
/* ------------------------------------------------------------------ */

function FormatIndicator({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const parts: string[] = [];

  if (editor.isActive("heading", { level: 1 })) parts.push("Heading 1");
  else if (editor.isActive("heading", { level: 2 })) parts.push("Heading 2");
  else if (editor.isActive("heading", { level: 3 })) parts.push("Heading 3");
  else if (editor.isActive("heading", { level: 4 })) parts.push("Heading 4");
  else if (editor.isActive("codeBlock")) parts.push("Code Block");
  else if (editor.isActive("blockquote")) parts.push("Blockquote");
  else if (editor.isActive("bulletList")) parts.push("Bullet List");
  else if (editor.isActive("orderedList")) parts.push("Ordered List");
  else if (editor.isActive("table")) parts.push("Table");
  else parts.push("Paragraph");

  if (editor.isActive("bold")) parts.push("Bold");
  if (editor.isActive("italic")) parts.push("Italic");
  if (editor.isActive("underline")) parts.push("Underline");
  if (editor.isActive("strike")) parts.push("Strikethrough");
  if (editor.isActive("code")) parts.push("Code");
  if (editor.isActive("superscript")) parts.push("Superscript");
  if (editor.isActive("subscript")) parts.push("Subscript");
  if (editor.isActive("link")) parts.push("Link");

  const textColor = editor.getAttributes("textStyle").color;
  if (textColor) parts.push(`Color: ${textColor}`);

  const hlColor = editor.getAttributes("highlight").color;
  if (hlColor) parts.push(`Highlight: ${hlColor}`);
  else if (editor.isActive("highlight")) parts.push("Highlight");

  const accent = getActiveAccentColor(editor);
  if (accent) parts.push(`Accent: ${accent}`);

  const align = editor.isActive({ textAlign: "center" })
    ? "Center"
    : editor.isActive({ textAlign: "right" })
      ? "Right"
      : "Left";
  parts.push(`${align} aligned`);

  return (
    <div className="px-3 py-1 border-t bg-muted/30 text-xs text-muted-foreground">
      {parts.join(" · ")}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main editor                                                        */
/* ------------------------------------------------------------------ */

export interface PageEditorRef {
  insertImage: (url: string, alt: string) => void;
}

export const PageEditor = forwardRef<PageEditorRef, PageEditorProps>(
  function PageEditor({ content, onChange, onOpenMediaGallery, onImageImported }, ref) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkInitialUrl, setLinkInitialUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        // v3.19 StarterKit bundles Link & Underline — disable them
        // so we can import the separately-configured versions below.
        link: false,
        underline: false,
      }),
      ResizableImage,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Start writing page content...",
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      AccentColor,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "cms-content p-4 min-h-[400px] focus:outline-none",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const url = event.dataTransfer?.getData("text/x-media-url");
        if (!url) return false;
        event.preventDefault();
        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        if (coordinates) {
          const node = view.state.schema.nodes.image.create({ src: url });
          const transaction = view.state.tr.insert(coordinates.pos, node);
          view.dispatch(transaction);
          return true;
        }
        return false;
      },
      handleDOMEvents: {
        dragover: (_view, event) => {
          // Allow drops from gallery by preventing default for our custom type
          if (event.dataTransfer?.types.includes("text/x-media-url")) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useImperativeHandle(ref, () => ({
    insertImage(url: string, alt: string) {
      editor?.chain().focus().setImage({ src: url, alt }).run();
    },
  }), [editor]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href || "";
    setLinkInitialUrl(existing);
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkSubmit = useCallback(
    (url: string, newTab: boolean) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .setLink({
          href: url,
          target: newTab ? "_blank" : null,
        })
        .run();
    },
    [editor]
  );

  const handleLinkRemove = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleImageSubmit = useCallback(
    (url: string, alt: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url, alt }).run();
    },
    [editor]
  );

  const clearFormatting = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .unsetAllMarks()
      .clearNodes()
      .run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const accentable = isInAccentableBlock(editor);
  const currentAccent = getActiveAccentColor(editor);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/50">
          {/* Block type selector */}
          <BlockTypeSelector editor={editor} />

          <ToolbarSeparator />

          {/* Inline formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            tooltip="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            tooltip="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            tooltip="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            tooltip="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            tooltip="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            active={editor.isActive("superscript")}
            tooltip="Superscript"
          >
            <SuperscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            active={editor.isActive("subscript")}
            tooltip="Subscript"
          >
            <SubscriptIcon className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Colors */}
          <EditorColorPicker
            currentColor={editor.getAttributes("textStyle").color}
            onSelectColor={(color) =>
              editor.chain().focus().setColor(color).run()
            }
            onRemoveColor={() =>
              editor.chain().focus().unsetColor().run()
            }
            icon={<Type className="h-4 w-4" />}
            tooltip="Text Color"
          />
          <EditorColorPicker
            currentColor={editor.getAttributes("highlight").color}
            onSelectColor={(color) =>
              editor.chain().focus().toggleHighlight({ color }).run()
            }
            onRemoveColor={() =>
              editor.chain().focus().unsetHighlight().run()
            }
            icon={<Highlighter className="h-4 w-4" />}
            tooltip="Highlight Color"
          />
          <EditorColorPicker
            currentColor={currentAccent ?? undefined}
            onSelectColor={(color) =>
              (editor.chain().focus() as any).setAccentColor(color).run()
            }
            onRemoveColor={() =>
              (editor.chain().focus() as any).unsetAccentColor().run()
            }
            icon={<Palette className="h-4 w-4" />}
            tooltip={
              accentable
                ? "Accent Color (heading / list / blockquote decoration)"
                : "Accent Color (place cursor in a heading, list, or blockquote)"
            }
          />

          <ToolbarSeparator />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            tooltip="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
            disabled={!editor.can().sinkListItem("listItem")}
            tooltip="Indent (Tab)"
          >
            <Indent className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().liftListItem("listItem").run()}
            disabled={!editor.can().liftListItem("listItem")}
            tooltip="Outdent (Shift+Tab)"
          >
            <Outdent className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Blocks */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            tooltip="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            tooltip="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            tooltip="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            tooltip="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Insert */}
          <ToolbarButton
            onClick={openLinkDialog}
            active={editor.isActive("link")}
            tooltip="Insert Link"
          >
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setImageDialogOpen(true)}
            tooltip="Insert Image (URL)"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          {onOpenMediaGallery && (
            <ToolbarButton
              onClick={onOpenMediaGallery}
              tooltip="Media Gallery"
            >
              <ImagePlus className="h-4 w-4" />
            </ToolbarButton>
          )}
          <TableMenu editor={editor} />

          <ToolbarSeparator />

          {/* Utilities */}
          <ToolbarButton
            onClick={clearFormatting}
            tooltip="Clear Formatting"
          >
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            tooltip="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            tooltip="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Editor content with cms-content styling */}
        <EditorContent editor={editor} />

        {/* Format indicator bar */}
        <FormatIndicator editor={editor} />
      </div>

      <EditorLinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        initialUrl={linkInitialUrl}
        onSubmit={handleLinkSubmit}
        onRemove={editor.isActive("link") ? handleLinkRemove : undefined}
      />

      <EditorImageDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onSubmit={handleImageSubmit}
        onImported={onImageImported}
      />
    </TooltipProvider>
  );
});
