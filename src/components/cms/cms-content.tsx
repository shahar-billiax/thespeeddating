"use client";

import { useState, useEffect } from "react";

interface CmsContentProps {
  html: string;
  className?: string;
}

const ALLOWED_STYLE_PROPS = ["color", "background-color"];

export function CmsContent({ html, className = "" }: CmsContentProps) {
  const [sanitized, setSanitized] = useState(html);

  useEffect(() => {
    // Dynamic import ensures DOMPurify (and jsdom) only load in the browser,
    // never during server-side rendering.
    import("isomorphic-dompurify").then(({ default: DOMPurify }) => {
      DOMPurify.addHook("afterSanitizeAttributes", (node) => {
        if (node.hasAttribute("style")) {
          const raw = node.getAttribute("style") || "";
          const filtered = raw
            .split(";")
            .map((decl) => decl.trim())
            .filter((decl) => {
              const prop = decl.split(":")[0]?.trim().toLowerCase();
              return prop && ALLOWED_STYLE_PROPS.includes(prop);
            })
            .join("; ");
          if (filtered) {
            node.setAttribute("style", filtered);
          } else {
            node.removeAttribute("style");
          }
        }
      });

      setSanitized(
        DOMPurify.sanitize(html, {
          ADD_TAGS: ["iframe", "mark"],
          ADD_ATTR: [
            "target",
            "rel",
            "allow",
            "allowfullscreen",
            "frameborder",
            "style",
            "data-color",
          ],
        })
      );

      DOMPurify.removeHook("afterSanitizeAttributes");
    });
  }, [html]);

  return (
    <div
      className={`cms-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
