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
      t("meta.contact_description"),
  };
}

const FALLBACK_HOURS_GB = [
  { days: "Monday - Friday", hours: "9:30am - 7:00pm" },
  { days: "Sunday", hours: "9:30am - 7:30pm", note: "Tickets booking only" },
  { days: "Saturday", hours: "Closed" },
] as { days: string; hours: string; note?: string }[];

const FALLBACK_HOURS_IL = [
  { days: "א'-ה'", hours: "9:30-19:00" },
  { days: "ו'", hours: "9:30-13:00" },
  { days: "שבת", hours: "סגור" },
] as { days: string; hours: string; note?: string }[];

const FALLBACK_CONTACT = {
  gb: { phone: "07950 272 671", email: "info@TheSpeedDating.co.uk" },
  il: { phone: "052-8809879", email: "Info@TheSpeedDating.co.il" },
};

export default async function ContactPage() {
  const { t, country } = await getTranslations();
  const page = await getPage("contact");

  const cmsContact = page?.content_json as {
    openingHours?: { days: string; hours: string; note?: string }[];
    phone?: string;
    email?: string;
  } | null;

  const fallbackHours = country === "il" ? FALLBACK_HOURS_IL : FALLBACK_HOURS_GB;
  const fallbackContact = FALLBACK_CONTACT[country as keyof typeof FALLBACK_CONTACT] || FALLBACK_CONTACT.gb;

  const openingHours = (cmsContact?.openingHours && cmsContact.openingHours.length > 0)
    ? cmsContact.openingHours
    : fallbackHours;
  const phone = cmsContact?.phone || fallbackContact.phone;
  const email = cmsContact?.email || fallbackContact.email;

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
                    {t("contact.opening_hours")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {openingHours.map((slot) => (
                      <div
                        key={slot.days}
                        className="flex items-start justify-between gap-4"
                      >
                        <span className="text-sm font-medium">
                          {slot.days}
                        </span>
                        <div className="text-end">
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
                    {t("contact.contact_details")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t("contact.email_label")}</p>
                        <a
                          href={`mailto:${email}`}
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t("contact.telephone")}</p>
                        <a
                          href={`tel:${phone.replace(/\s/g, "")}`}
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {phone}
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          {t("contact.text_preferred")}
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
                  <CardTitle className="text-2xl">{t("contact.send_message")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("contact.send_message_text")}
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
