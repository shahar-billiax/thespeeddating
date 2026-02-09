import { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/server";
import { UserPlus, Search, CreditCard, Users, Heart, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("how_it_works.title"),
    description: "Learn how our speed dating events work - from registration to getting matched",
  };
}

export default async function HowItWorksPage() {
  const { t } = await getTranslations();

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: "Register",
      description:
        "Create your free profile with basic information about yourself. This helps us match you with the right age groups and events.",
    },
    {
      number: 2,
      icon: Search,
      title: "Browse Events",
      description:
        "Explore upcoming speed dating events in your city. Filter by age group, location, and date to find the perfect event for you.",
    },
    {
      number: 3,
      icon: CreditCard,
      title: "Book a Ticket",
      description:
        "Secure your spot with our easy online booking. Choose between Standard and VIP tickets. Your booking is confirmed instantly.",
    },
    {
      number: 4,
      icon: Users,
      title: "Attend the Event",
      description:
        "Arrive at the venue and check in. You'll meet 10-15 people through 5-minute speed dates. Our host will guide you through the evening.",
    },
    {
      number: 5,
      icon: Heart,
      title: "Submit Your Choices",
      description:
        "After the event, log in and select who you'd like to see again. Be honest - mutual interest is what creates a match!",
    },
    {
      number: 6,
      icon: Sparkles,
      title: "Get Matched",
      description:
        "If someone you liked also liked you back, it's a match! We'll send you both an email with contact details to arrange your first date.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("how_it_works.title")}</h1>
          <p className="text-xl text-muted-foreground">{t("how_it_works.subtitle")}</p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -ml-px" />

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 1;

              return (
                <div key={step.number} className="relative">
                  <div
                    className={`flex flex-col md:flex-row items-center gap-8 ${
                      isEven ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${isEven ? "md:text-right" : ""}`}>
                      <div
                        className={`bg-card border rounded-lg p-6 shadow-sm ${
                          isEven ? "md:ml-8" : "md:mr-8"
                        }`}
                      >
                        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>

                    {/* Icon circle */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <Icon className="w-10 h-10 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-sm">
                        {step.number}
                      </div>
                    </div>

                    {/* Spacer for alignment */}
                    <div className="hidden md:block flex-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of singles who have found meaningful connections through our events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/events"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Browse Events
            </a>
            <a
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
