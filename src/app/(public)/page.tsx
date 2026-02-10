import { getTranslations } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { getPage } from "@/lib/pages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CmsContent } from "@/components/cms/cms-content";
import { UserPlus, Calendar, Heart, Crown, Users, Sparkles, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const { t, locale, country: countryCode } = await getTranslations();
  const supabase = await createClient();
  const page = await getPage("home");

  // Get country record
  const { data: countryData } = await supabase
    .from("countries")
    .select("id, currency")
    .eq("code", countryCode)
    .single();

  // Fetch upcoming events for the current country
  const { data: events } = await supabase
    .from("events")
    .select(`
      id,
      event_date,
      start_time,
      price,
      event_type,
      age_min,
      age_max,
      cities (name),
      venues (name)
    `)
    .eq("country_id", countryData?.id ?? 0)
    .eq("is_published", true)
    .eq("is_cancelled", false)
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(6);

  // Date and currency formatting
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const priceFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: countryData?.currency ?? "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-accent py-24 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-4xl text-center space-y-8 text-white">
            <p className="text-sm sm:text-base uppercase tracking-widest text-white/70 font-medium">
              Jewish Speed Dating in the UK &amp; Israel since 2003
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Professional Evenings for{" "}
              <span className="text-yellow-300">Professional Jewish People</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Getting a chance to meet one-on-one in a fun, classy, yet relaxed evening.
              Join the worldwide success! Speed Dating offers a chance to meet new people
              and have a 7-minute date with each one.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary" className="text-base px-8" asChild>
                <Link href="/events">
                  <Calendar className="mr-2 h-5 w-5" />
                  {t("home.browse_events")}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-base px-8"
                asChild
              >
                <Link href="/register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign Up Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">120+</div>
              <div className="text-sm text-muted-foreground mt-1">Weddings Worldwide</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">20+</div>
              <div className="text-sm text-muted-foreground mt-1">Years of Experience</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-muted-foreground mt-1">Singles on Our Books</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground mt-1">Minutes Per Date</div>
            </div>
          </div>
        </div>
      </section>

      {/* CMS Welcome Content */}
      {page?.content_html && (
        <section className="py-16 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <CmsContent html={page.content_html} />
            </div>
          </div>
        </section>
      )}

      {/* Quick Links Grid */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <Link href="/vip" className="group">
              <Card className="h-full hover:shadow-lg transition-all hover:border-yellow-500/50 group-hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <Crown className="h-10 w-10 mx-auto mb-3 text-yellow-500" />
                  <h3 className="font-semibold text-lg">VIP Membership</h3>
                  <p className="text-sm text-muted-foreground mt-1">Discounts &amp; exclusive perks</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/matchmaking" className="group">
              <Card className="h-full hover:shadow-lg transition-all group-hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <Heart className="h-10 w-10 mx-auto mb-3 text-pink-500" />
                  <h3 className="font-semibold text-lg">Jewish Matches</h3>
                  <p className="text-sm text-muted-foreground mt-1">Personal matchmaking service</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/success-stories" className="group">
              <Card className="h-full hover:shadow-lg transition-all group-hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold text-lg">Success Stories</h3>
                  <p className="text-sm text-muted-foreground mt-1">120+ weddings and counting</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/what-is-speed-dating" className="group">
              <Card className="h-full hover:shadow-lg transition-all group-hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold text-lg">What Is Speed Dating</h3>
                  <p className="text-sm text-muted-foreground mt-1">Everything you need to know</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              {t("home.upcoming_title")}
            </h2>
            <p className="text-muted-foreground">
              Please note: We accept advance bookings only to ensure the evening&apos;s success.
            </p>
          </div>

          {events && events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {events.map((event) => {
                  const eventDate = new Date(event.event_date);

                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-all hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">
                            {dateFormatter.format(eventDate)}
                          </CardTitle>
                          {event.event_type && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                              {event.event_type.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <div className="font-medium text-foreground">
                            {event.cities?.name}
                          </div>
                          <div>{event.venues?.name}</div>
                          {event.age_min && event.age_max && (
                            <div className="mt-1">Ages {event.age_min}-{event.age_max}</div>
                          )}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {event.price ? priceFormatter.format(event.price) : t("events.free")}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/events/${event.id}`}>
                            {t("home.view_event")}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              <div className="text-center">
                <Button variant="default" size="lg" asChild>
                  <Link href="/events">
                    {t("home.see_all_events")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg mb-4">
                {t("home.no_events")}
              </p>
              <Button asChild>
                <Link href="/register">Sign up to get notified</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Recent Weddings Banner */}
      <section className="py-12 bg-pink-50 dark:bg-pink-950/20 border-y">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              <span className="text-2xl font-bold">Mazal Tov!!!</span>
            </div>
            <p className="text-muted-foreground">
              2 recent WEDDINGS from our London Speed Dating events:
              Josh B and Naomi W and Jonny Simmons with Mia S. Mazal Tov!!!
            </p>
            <Button variant="outline" asChild>
              <Link href="/success-stories">Read Their Stories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Our evenings are about meeting new like-minded people in friendly fun evening.
            </h2>
            <p className="text-white/80 text-lg">
              Sign up now for the next event. All our events are Jewish.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-base px-8" asChild>
                <Link href="/register">Sign Up Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-base px-8"
                asChild
              >
                <Link href="/events">View Upcoming Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
