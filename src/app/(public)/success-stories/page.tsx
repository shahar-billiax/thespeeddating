import { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getTranslations } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { CmsContent } from "@/components/cms/cms-content";
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
  const page = await getPage("success-stories");
  return {
    title: page?.meta_title || page?.title || "Success Stories",
    description:
      page?.meta_description ||
      "120 weddings worldwide! Read real love stories from couples who met through TheSpeedDating.",
  };
}

export default async function SuccessStoriesPage() {
  const page = await getPage("success-stories");
  const { country } = await getTranslations();
  const supabase = await createClient();

  const { data: countryData } = await supabase
    .from("countries")
    .select("id")
    .eq("code", country)
    .single();

  const { data: stories } = await supabase
    .from("success_stories")
    .select("*")
    .eq("country_id", countryData?.id ?? 0)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

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
              {page?.title || "Success Stories"}
            </h1>
            <p className="text-xl text-white/90">
              120 weddings worldwide! Goes to show Speed Dating works!
            </p>
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-4xl font-bold">120+</div>
                <div className="text-sm text-white/70">Weddings</div>
              </div>
              <div className="w-px h-12 bg-white/30" />
              <div className="text-center">
                <div className="text-4xl font-bold">20+</div>
                <div className="text-sm text-white/70">Years</div>
              </div>
              <div className="w-px h-12 bg-white/30" />
              <div className="text-center">
                <div className="text-4xl font-bold">5,000+</div>
                <div className="text-sm text-white/70">Singles</div>
              </div>
            </div>
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
              Featured Stories
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
                        <span className="ml-1 capitalize">
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
              More Testimonials
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
                        <span className="ml-1 capitalize">
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

        {/* No stories fallback */}
        {(!stories || stories.length === 0) && !page?.content_html && (
          <p className="text-muted-foreground text-center py-12">
            Content coming soon.
          </p>
        )}
      </div>
    </div>
  );
}
