import { describe, it, expect } from "vitest";

// Test the translation function logic (extracted from i18n context)
function createTranslationFn(
  translations: Record<string, string>,
  fallback: Record<string, string> = {}
) {
  return (key: string, params?: Record<string, string>): string => {
    let value = translations[key] || fallback[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, v);
      });
    }
    return value;
  };
}

describe("translation function", () => {
  const translations = {
    "nav.home": "Home",
    "nav.events": "Events",
    "footer.copyright": "© {{year}} The Speed Dating",
  };

  it("returns translation for known key", () => {
    const t = createTranslationFn(translations);
    expect(t("nav.home")).toBe("Home");
  });

  it("returns key when translation is missing", () => {
    const t = createTranslationFn(translations);
    expect(t("nav.missing")).toBe("nav.missing");
  });

  it("substitutes template variables", () => {
    const t = createTranslationFn(translations);
    expect(t("footer.copyright", { year: "2026" })).toBe("© 2026 The Speed Dating");
  });

  it("falls back to English when Hebrew is missing", () => {
    const heTranslations = { "nav.home": "דף הבית" };
    const enFallback = { "nav.home": "Home", "nav.events": "Events" };
    const t = createTranslationFn(heTranslations, enFallback);

    expect(t("nav.home")).toBe("דף הבית");
    expect(t("nav.events")).toBe("Events");
  });

  it("returns key when both locale and fallback miss", () => {
    const t = createTranslationFn({}, { "nav.home": "Home" });
    expect(t("nav.unknown")).toBe("nav.unknown");
  });
});
