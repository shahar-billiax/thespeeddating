import { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("faqs.title"),
    description: "Frequently asked questions about our Jewish speed dating events",
  };
}

export default async function FAQsPage() {
  const { t } = await getTranslations();

  const generalFaqs = [
    {
      question: "What is speed dating?",
      answer:
        "Speed dating is a fun and efficient way to meet multiple potential partners in one evening. You'll have a series of 7-minute conversations with each person. For a modest fee, you meet around 12 professional Jewish singles in your age group at trendy bar venues. It's a cool way of having a selection of people to choose from and say 'YES' to the potentially right one without wasting time on the wrong one!",
    },
    {
      question: "How does it work?",
      answer:
        "Women stay seated while men rotate between tables when a bell signals the time change. Each conversation lasts 7 minutes. You receive a score card and mark whether you'd like to meet each person again as a 'Date' or 'Friend'. If both people select 'Date' for each other, it's a mutual match and contact details are revealed.",
    },
    {
      question: "What happens during the evening?",
      answer:
        "You arrive and check in at the venue, receive your score card, and have some time to mingle. The speed dating begins at 7pm — you'll have 7-minute dates with each person, with short breaks in between for refreshments. After all the dates, there's time for more mingling and drinks. The typical schedule is: 6:30pm Reception & Registration, 7:00-9:00pm Speed Dating, 9:00pm onwards Mingle and Drinks.",
    },
    {
      question: "What age groups do you cater to?",
      answer:
        "We run events for various age groups: 20s, 30s, 40s, 50s, and 60s. Each event is clearly labeled with its age range. We carefully segment events to ensure the best possible experience for everyone.",
    },
    {
      question: "What event types do you offer?",
      answer:
        "We offer several types of events: Jewish General (our most common), Singles, Traditional, Divorcees, Single Parents, Conservative, Virtual Events, Israeli, and Party/Mixer events. Each event type is clearly labeled so you can choose what suits you best.",
    },
    {
      question: "What should I wear?",
      answer:
        "The dress code is smart casual. You want to look and feel your best! Our events are held at high-class venues with a nice vibe, so avoid overly casual clothing like sportswear.",
    },
  ];

  const matchingFaqs = [
    {
      question: "How do I submit my choices?",
      answer:
        "After the event, log in to the website with your username and password (provided when you purchased your ticket). Select the event date, view the list of people you met, and choose 'Date' or 'Friend' for each person. You can also select which contact details to reveal — email, phone, or both.",
    },
    {
      question: "How do I get my match results?",
      answer:
        "Log in to the website to view your matches. We recommend submitting your choices promptly and checking back multiple times. An email reminder is sent after 3 days if you haven't submitted your choices. Final results are sent via email after 1 week.",
    },
    {
      question: "What does 'No match yet' mean?",
      answer:
        "It simply means the other person hasn't entered their choices yet. Once they do, if you've both selected 'Date' for each other, you'll see the match and receive their contact details. Be patient — not everyone submits right away!",
    },
    {
      question: "What if I can't submit my choices online?",
      answer:
        "You have several options: hand your completed score card to the hostess at the end of the event, email your choices to info@TheSpeedDating.co.uk, or call us at 0700 3401347.",
    },
    {
      question: "When will I find out my matches?",
      answer:
        "Matches appear as soon as both people have submitted their choices. If the other person hasn't submitted yet, you'll see 'No match yet'. We send an email reminder after 3 days and final results after 1 week.",
    },
  ];

  const practicalFaqs = [
    {
      question: "Do I need to book in advance?",
      answer:
        "Yes! We accept advance bookings only to ensure the evening's success. This allows us to balance the number of men and women and ensure the right age group mix. Book online or contact us to reserve your spot.",
    },
    {
      question: "Can I cancel my booking?",
      answer:
        "Yes, you can cancel up to 48 hours before the event for a full refund. Cancellations made less than 48 hours before are non-refundable, though you may be able to transfer your ticket to another event (subject to availability).",
    },
    {
      question: "Is this only for Jewish people?",
      answer:
        "Our events are primarily designed for Jewish singles, and most participants are Jewish. However, we welcome people of all backgrounds who are interested in meeting Jewish partners and are respectful of Jewish culture and traditions. All our events are Jewish-focused.",
    },
    {
      question: "Where do you hold events?",
      answer:
        "We hold events in London (primarily), Manchester, and Leeds in the UK, as well as Tel Aviv and Jerusalem in Israel. Our venues are high-class bars and restaurants with a nice vibe. People even travel from other European countries — Holland, Denmark, Belgium — to attend our London events!",
    },
    {
      question: "What are the VIP benefits?",
      answer:
        "VIP members enjoy discounted event tickets at a special price, we reveal who chose you at events you participated in, 15% off our matchmaking service, and access to special offers and promotions. VIP membership starts from just £6 per month.",
    },
    {
      question: "Why do so many people come to speed dating?",
      answer:
        "You can meet many singles in one evening rather than spending months meeting people separately. The evening isn't just about finding a date — it's also about meeting new people, making friends, networking, and practicing your communication skills in a fun, relaxed atmosphere. With 120+ weddings to date, speed dating clearly works!",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-accent py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-white space-y-4 max-w-3xl mx-auto">
            <HelpCircle className="h-12 w-12 mx-auto text-white/80" />
            <h1 className="text-4xl sm:text-5xl font-bold">{t("faqs.title")}</h1>
            <p className="text-lg text-white/80">
              Everything you need to know about our Jewish speed dating events
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* General Questions */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
              About Speed Dating
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {generalFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`general-${index}`}
                  className="border rounded-lg px-6 bg-card hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Matching Questions */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
              Matching &amp; Results
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {matchingFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`matching-${index}`}
                  className="border rounded-lg px-6 bg-card hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Practical Questions */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
              Practical Information
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {practicalFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`practical-${index}`}
                  className="border rounded-lg px-6 bg-card hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can&apos;t find the answer you&apos;re looking for? Get in touch with our friendly team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Contact Us
              </a>
              <a
                href="/what-is-speed-dating"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                What Is Speed Dating?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
