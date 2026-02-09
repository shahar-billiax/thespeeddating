import { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/server";
import { Heart, Users, Shield, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("about.title"),
    description: "Learn about TheSpeedDating - Running Jewish speed dating events since 2003 in the UK and Israel",
  };
}

export default async function AboutPage() {
  const { t } = await getTranslations();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("about.title")}</h1>

        {/* Company Story */}
        <section className="mb-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              {t("about.since_text", { year: "2003" })}
            </p>
            <p className="mb-4">
              TheSpeedDating has been bringing Jewish singles together since 2003. What started as a small
              gathering in London has grown into the UK and Israel's premier Jewish speed dating service,
              hosting hundreds of events each year.
            </p>
            <p className="mb-4">
              We've helped thousands of people meet their perfect match through our carefully organized events.
              Our success comes from understanding what Jewish singles are looking for: meaningful connections
              in a comfortable, respectful environment.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">{t("about.mission_title")}</h2>
          <div className="bg-primary/5 p-8 rounded-lg">
            <p className="text-lg">
              Our mission is to create welcoming, safe, and enjoyable environments where Jewish singles can meet
              face-to-face and form genuine connections. We believe in the power of personal interaction and
              strive to make every event a positive experience for all participants.
            </p>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <Heart className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community Focused</h3>
              <p className="text-muted-foreground">
                We understand the unique needs of Jewish singles and create events that respect traditions
                while being inclusive and welcoming to all levels of observance.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Carefully Curated</h3>
              <p className="text-muted-foreground">
                Every participant is verified, and we carefully balance our events by age group and
                gender ratio to ensure the best possible experience for everyone.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Safe & Professional</h3>
              <p className="text-muted-foreground">
                Your safety and privacy are our top priorities. All events are hosted by experienced
                coordinators in reputable venues with strict safety protocols.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <Sparkles className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Proven Success</h3>
              <p className="text-muted-foreground">
                With over 20 years of experience and thousands of successful matches, we've refined
                our process to maximize your chances of meeting someone special.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Our Values</h2>
          <div className="prose prose-lg max-w-none">
            <ul className="space-y-3">
              <li>
                <strong>Respect:</strong> We treat every participant with dignity and respect, creating
                a judgment-free zone where people can be themselves.
              </li>
              <li>
                <strong>Authenticity:</strong> We encourage genuine connections and honest interactions,
                not superficial encounters.
              </li>
              <li>
                <strong>Inclusivity:</strong> While we serve the Jewish community, we welcome all levels
                of religious observance and cultural backgrounds.
              </li>
              <li>
                <strong>Excellence:</strong> We're committed to delivering high-quality events with
                attention to every detail.
              </li>
              <li>
                <strong>Privacy:</strong> Your personal information is protected, and we never share
                your data without consent.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
