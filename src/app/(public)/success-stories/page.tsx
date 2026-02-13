import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { CmsContent } from "@/components/cms/cms-content";
import { getPageFallbackHtml } from "@/lib/i18n/page-fallbacks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Quote,
  MapPin,
  Calendar,
  Gem,
  Sparkles,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const page = await getPage("success-stories");
  return {
    title: page?.meta_title || page?.title || t("meta.success_stories_title"),
    description:
      page?.meta_description ||
      t("meta.success_stories_description"),
  };
}

export default async function SuccessStoriesPage() {
  const page = await getPage("success-stories");
  const t = await getTranslations();
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("success_stories")
    .select("*")
    .eq("language_code", locale)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
    .limit(50);

  const fallbackHtml =
    (!stories || stories.length === 0) && !page?.content_html
      ? getPageFallbackHtml("success-stories", locale)
      : null;

  const featured = stories?.filter((s) => s.is_featured) ?? [];
  const rest = stories?.filter((s) => !s.is_featured) ?? [];
  const totalWeddings = stories?.filter((s) => s.story_type === "wedding").length ?? 0;

  const typeIcon = (type: string) => {
    switch (type) {
      case "wedding":
        return <Gem className="h-4 w-4" />;
      case "dating":
        return <Heart className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "wedding":
        return "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300";
      case "dating":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-pink-500 via-pink-400 to-rose-400 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center text-white space-y-6 max-w-3xl mx-auto">
            <Heart className="h-16 w-16 mx-auto text-white/90 fill-white/30" />
            <h1 className="text-4xl sm:text-5xl font-bold">
              {page?.title || t("success_stories.title")}
            </h1>
            {(() => {
              const cmsStories = page?.content_json as {
                heroSubtitle?: string;
                heroStats?: { value: string; label: string }[];
              } | null;
              const subtitle = cmsStories?.heroSubtitle || t("success_stories.hero_subtitle");
              const FALLBACK_HERO = [
                { value: "120+", label: t("home.stat_weddings") },
                { value: "20+", label: t("home.stat_experience") },
                { value: "5,000+", label: t("home.stat_singles") },
              ];
              const heroStats = (cmsStories?.heroStats && cmsStories.heroStats.length > 0)
                ? cmsStories.heroStats : FALLBACK_HERO;
              return (
                <>
                  <p className="text-xl text-white/90">{subtitle}</p>
                  <div className="flex items-center justify-center gap-8 pt-4">
                    {heroStats.map((stat, i) => (
                      <div key={i} className="flex items-center gap-8">
                        {i > 0 && <div className="w-px h-12 bg-white/30" />}
                        <div className="text-center">
                          <div className="text-4xl font-bold">{stat.value}</div>
                          <div className="text-sm text-white/70">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* CMS Intro */}
        {page?.content_html && (
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <CmsContent html={page.content_html} />
          </div>
        )}

        {/* Featured Stories */}
        {featured.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              {t("success_stories.featured")}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map((story) => (
                <Card
                  key={story.id}
                  className="relative overflow-hidden border-pink-200 dark:border-pink-900 bg-gradient-to-br from-pink-50/50 to-background dark:from-pink-950/20"
                >
                  <CardContent className="pt-8 pb-6 px-8">
                    <Quote className="h-10 w-10 text-pink-300 dark:text-pink-800 mb-4" />
                    <p className="text-base leading-relaxed mb-6">
                      {story.quote}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-semibold text-lg">
                          {story.couple_names}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {story.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {story.location}
                            </span>
                          )}
                          {story.year && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {story.year}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={typeColor(story.story_type)}
                      >
                        {typeIcon(story.story_type)}
                        <span className="ms-1 capitalize">
                          {story.story_type}
                        </span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Other Stories */}
        {rest.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-8">
              {t("success_stories.more")}
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {rest.map((story) => (
                <Card
                  key={story.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6 pb-5 px-6">
                    <Quote className="h-7 w-7 text-muted-foreground/30 mb-3" />
                    <p className="text-sm leading-relaxed mb-4">
                      {story.quote}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-medium text-sm">
                          {story.couple_names}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          {story.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {story.location}
                            </span>
                          )}
                          {story.year && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {story.year}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${typeColor(story.story_type)}`}
                      >
                        {typeIcon(story.story_type)}
                        <span className="ms-1 capitalize">
                          {story.story_type}
                        </span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No stories fallback — show CMS testimonies or coming soon */}
        {(!stories || stories.length === 0) && !page?.content_html && (
          fallbackHtml ? (
            <div className="max-w-3xl mx-auto">
              <CmsContent html={fallbackHtml} />
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              {t("common.content_coming_soon")}
            </p>
          )
        )}
      </div>
    </div>
  );
}
