"use client";

import DOMPurify from "isomorphic-dompurify";

interface CmsContentProps {
  html: string;
  className?: string;
}

// Only allow safe CSS properties in style attributes
const ALLOWED_STYLE_PROPS = ["color", "background-color"];

if (typeof window !== "undefined" || typeof globalThis !== "undefined") {
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
}

export function CmsContent({ html, className = "" }: CmsContentProps) {
  const sanitized = DOMPurify.sanitize(html, {
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
  });

  return (
    <div
      className={`cms-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
