import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.body_html
      .replace(/<[^>]*>/g, "")
      .slice(0, 160)
      .trim(),
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTranslations();
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div>
      {/* Hero header */}
      <section className="page-hero">
        <div className="section-container max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {t("blog.back")}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-3">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.published_at ?? undefined}>
              {new Date(post.published_at ?? post.created_at).toLocaleDateString(
                locale === "en" ? "en-GB" : "he-IL",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </time>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 sm:py-20">
        <div className="section-container max-w-4xl">
          {/* Featured Image */}
          {post.featured_image && (
            <div className="aspect-video bg-muted rounded-xl mb-10" />
          )}

          <article>
            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: post.body_html }}
            />
          </article>

          {/* Back Button at Bottom */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <Button asChild variant="outline">
              <Link href="/blog" className="gap-2">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {t("blog.back")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
