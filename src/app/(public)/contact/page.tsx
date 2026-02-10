import { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/server";
import { getPage } from "@/lib/pages";
import { ContactForm } from "@/components/contact-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CmsContent } from "@/components/cms/cms-content";
import { Mail, Phone, Clock, MessageSquare } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  const page = await getPage("contact");
  return {
    title: page?.meta_title || t("contact.title"),
    description:
      page?.meta_description ||
      "Get in touch with TheSpeedDating. Call 07950272671, email info@TheSpeedDating.co.uk, or fill in our contact form.",
  };
}

const OPENING_HOURS = [
  { days: "Monday - Friday", hours: "9:30am - 7:00pm" },
  {
    days: "Sunday",
    hours: "9:30am - 7:30pm",
    note: "Tickets booking only",
  },
  { days: "Saturday", hours: "Closed" },
] as { days: string; hours: string; note?: string }[];

export default async function ContactPage() {
  const { t } = await getTranslations();
  const page = await getPage("contact");

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {page?.title || t("contact.title")}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              {t("contact.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* CMS Content */}
      {page?.content_html && (
        <section className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <CmsContent html={page.content_html} />
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Contact Info Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Opening Hours Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {OPENING_HOURS.map((slot) => (
                      <div
                        key={slot.days}
                        className="flex items-start justify-between gap-4"
                      >
                        <span className="text-sm font-medium">
                          {slot.days}
                        </span>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">
                            {slot.hours}
                          </span>
                          {slot.note && (
                            <p className="text-xs text-muted-foreground/70">
                              ({slot.note})
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a
                          href="mailto:info@TheSpeedDating.co.uk"
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          info@TheSpeedDating.co.uk
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Telephone</p>
                        <a
                          href="tel:07950272671"
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          07950 272 671
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          Text messages preferred
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Or please fill in your details below and send &mdash; we
                    will reply shortly!
                  </p>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
