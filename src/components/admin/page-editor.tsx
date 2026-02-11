"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link2,
  Image as ImageIcon,
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
} from "lucide-react";
import { EditorLinkDialog } from "./editor-link-dialog";
import { EditorImageDialog } from "./editor-image-dialog";
import { EditorColorPicker } from "./editor-color-picker";

interface PageEditorProps {
  content: string;
  onChange: (html: string) => void;
}

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

function FormatIndicator({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const parts: string[] = [];

  if (editor.isActive("heading", { level: 2 })) parts.push("Heading 2");
  else if (editor.isActive("heading", { level: 3 })) parts.push("Heading 3");
  else if (editor.isActive("blockquote")) parts.push("Blockquote");
  else if (editor.isActive("bulletList")) parts.push("Bullet List");
  else if (editor.isActive("orderedList")) parts.push("Ordered List");
  else parts.push("Paragraph");

  if (editor.isActive("bold")) parts.push("Bold");
  if (editor.isActive("italic")) parts.push("Italic");
  if (editor.isActive("underline")) parts.push("Underline");
  if (editor.isActive("strike")) parts.push("Strikethrough");
  if (editor.isActive("superscript")) parts.push("Superscript");
  if (editor.isActive("subscript")) parts.push("Subscript");
  if (editor.isActive("link")) parts.push("Link");

  const textColor = editor.getAttributes("textStyle").color;
  if (textColor) parts.push(`Color: ${textColor}`);

  const hlColor = editor.getAttributes("highlight").color;
  if (hlColor) parts.push(`Highlight: ${hlColor}`);
  else if (editor.isActive("highlight")) parts.push("Highlight");

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

export function PageEditor({ content, onChange }: PageEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkInitialUrl, setLinkInitialUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
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
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "cms-content p-4 min-h-[400px] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

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

  return (
    <TooltipProvider delayDuration={300}>
      <div className="border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/50">
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

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            tooltip="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            tooltip="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
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
            tooltip="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>

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
      />
    </TooltipProvider>
  );
}
