import { describe, it, expect } from "vitest";

// Test the domain mapping logic (extracted from middleware)
const DOMAIN_COUNTRY_MAP: Record<string, string> = {
  "thespeeddating.co.uk": "gb",
  "thespeeddating.co.il": "il",
};

const COUNTRY_LOCALE_MAP: Record<string, string> = {
  gb: "en",
  il: "he",
};

function detectCountryFromHostname(hostname: string): string {
  const bare = hostname.split(":")[0];
  return DOMAIN_COUNTRY_MAP[bare] || "gb";
}

function getLocale(country: string): string {
  return COUNTRY_LOCALE_MAP[country] || "en";
}

describe("country detection", () => {
  it("maps .co.uk domain to gb", () => {
    expect(detectCountryFromHostname("thespeeddating.co.uk")).toBe("gb");
  });

  it("maps .co.il domain to il", () => {
    expect(detectCountryFromHostname("thespeeddating.co.il")).toBe("il");
  });

  it("strips port from hostname", () => {
    expect(detectCountryFromHostname("thespeeddating.co.il:3000")).toBe("il");
  });

  it("defaults to gb for localhost", () => {
    expect(detectCountryFromHostname("localhost")).toBe("gb");
  });

  it("defaults to gb for unknown domains", () => {
    expect(detectCountryFromHostname("example.com")).toBe("gb");
  });
});

describe("locale mapping", () => {
  it("returns en for gb", () => {
    expect(getLocale("gb")).toBe("en");
  });

  it("returns he for il", () => {
    expect(getLocale("il")).toBe("he");
  });

  it("defaults to en for unknown country", () => {
    expect(getLocale("us")).toBe("en");
  });
});
