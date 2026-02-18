import { createAdminClient } from "@/lib/supabase/admin";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thespeeddating.co.uk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  const [{ data: events }, { data: posts }] = await Promise.all([
    supabase
      .from("events")
      .select("id, updated_at")
      .eq("is_published", true)
      .eq("is_cancelled", false)
      .order("event_date", { ascending: false })
      .limit(500),
    supabase
      .from("blog_posts")
      .select("slug, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/faqs`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/vip`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/matchmaking`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/safety`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const eventPages: MetadataRoute.Sitemap = (events ?? []).map((e) => ({
    url: `${BASE_URL}/events/${e.id}`,
    lastModified: new Date(e.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...eventPages, ...blogPages];
}
