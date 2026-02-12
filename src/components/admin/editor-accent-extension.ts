import { Extension } from "@tiptap/react";
import type { useEditor } from "@tiptap/react";

/**
 * Adds an `accentColor` attribute to heading, bulletList, orderedList, and
 * blockquote nodes. The value is rendered as an inline CSS custom-property
 * `--cms-accent` so that CMS-content styles can pick it up via
 * `var(--cms-accent, var(--primary))`.
 */
export const AccentColor = Extension.create({
  name: "accentColor",

  addGlobalAttributes() {
    return [
      {
        types: ["heading", "bulletList", "orderedList", "blockquote"],
        attributes: {
          accentColor: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.style.getPropertyValue("--cms-accent")?.trim() || null,
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.accentColor) return {};
              return { style: `--cms-accent: ${attributes.accentColor}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return ({
      setAccentColor:
        (color: string) =>
        ({ tr, state, dispatch }: { tr: any; state: any; dispatch: any }) => {
          const { from } = state.selection;
          const $pos = state.doc.resolve(from);

          for (let depth = $pos.depth; depth > 0; depth--) {
            const node = $pos.node(depth);
            if (node.attrs.accentColor !== undefined) {
              if (dispatch) {
                const pos = $pos.before(depth);
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  accentColor: color,
                });
              }
              return true;
            }
          }
          return false;
        },

      unsetAccentColor:
        () =>
        ({ tr, state, dispatch }: { tr: any; state: any; dispatch: any }) => {
          const { from } = state.selection;
          const $pos = state.doc.resolve(from);

          for (let depth = $pos.depth; depth > 0; depth--) {
            const node = $pos.node(depth);
            if (node.attrs.accentColor !== undefined) {
              if (dispatch) {
                const pos = $pos.before(depth);
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  accentColor: null,
                });
              }
              return true;
            }
          }
          return false;
        },
    }) as any;
  },
});

type EditorInstance = ReturnType<typeof useEditor>;

/**
 * Walk up the document tree from the cursor position and return the
 * accent colour of the nearest heading / list / blockquote ancestor.
 */
export function getActiveAccentColor(editor: EditorInstance): string | null {
  if (!editor) return null;
  const { from } = editor.state.selection;
  const $pos = editor.state.doc.resolve(from);

  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (node.attrs.accentColor !== undefined) {
      return node.attrs.accentColor || null;
    }
  }
  return null;
}

/**
 * Check whether the cursor is currently inside a node that supports
 * accent colour (heading, bulletList, orderedList, blockquote).
 */
export function isInAccentableBlock(editor: EditorInstance): boolean {
  if (!editor) return false;
  const { from } = editor.state.selection;
  const $pos = editor.state.doc.resolve(from);

  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (node.attrs.accentColor !== undefined) return true;
  }
  return false;
}
