import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thespeeddating.co.uk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/auth/", "/profile", "/my-events", "/matches/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
