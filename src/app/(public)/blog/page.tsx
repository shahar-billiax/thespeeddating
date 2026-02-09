import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Calendar } from "lucide-react";

const POSTS_PER_PAGE = 12;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function getExcerpt(html: string, maxLength: number = 150): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { t, locale, country } = await getTranslations();
  const supabase = await createClient();

  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  const { data: countryData } = await supabase
    .from("countries")
    .select("id")
    .eq("code", country)
    .single();

  let posts: any[] = [];
  let totalCount = 0;

  if (countryData) {
    const { data, count } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact" })
      .eq("country_id", countryData.id)
      .eq("language_code", locale)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .range(offset, offset + POSTS_PER_PAGE - 1);

    posts = data || [];
    totalCount = count || 0;
  }

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">{t("blog.title")}</h1>
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">{t("blog.no_posts")}</p>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden flex flex-col">
                {post.featured_image && (
                  <div className="aspect-video bg-muted" />
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString(
                        locale === "en" ? "en-GB" : "he-IL",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </time>
                  </div>
                  <h2 className="text-xl font-bold mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">
                    {getExcerpt(post.body_html)}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/blog/${post.slug}`}>
                      {t("blog.read_more")}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {currentPage > 1 && (
                <Button asChild variant="outline">
                  <Link href={`/blog?page=${currentPage - 1}`}>
                    {locale === "en" ? "Previous" : "הקודם"}
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      asChild
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                    >
                      <Link href={`/blog?page=${page}`}>{page}</Link>
                    </Button>
                  )
                )}
              </div>
              {currentPage < totalPages && (
                <Button asChild variant="outline">
                  <Link href={`/blog?page=${currentPage + 1}`}>
                    {locale === "en" ? "Next" : "הבא"}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
