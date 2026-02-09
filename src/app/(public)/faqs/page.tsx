import { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("faqs.title"),
    description: "Frequently asked questions about our Jewish speed dating events",
  };
}

export default async function FAQsPage() {
  const { t } = await getTranslations();

  const faqs = [
    {
      question: "What is speed dating?",
      answer:
        "Speed dating is a fun and efficient way to meet multiple potential partners in one evening. You'll have a series of short, timed conversations (usually 5 minutes) with each person. After the event, you select who you'd like to see again, and if there's a mutual match, we share your contact details.",
    },
    {
      question: "How does the matching process work?",
      answer:
        "After the event, you'll receive an email with a link to submit your choices. Simply select who you'd like to meet again. If someone you selected also selected you, it's a match! We'll send both of you an email with each other's contact information within 24-48 hours.",
    },
    {
      question: "What age groups do you cater to?",
      answer:
        "We run events for various age groups, typically: 21-31, 28-38, 35-45, 43-55, and 50+. Each event is clearly labeled with its age range. We recommend choosing an event where you fall comfortably within the range for the best experience.",
    },
    {
      question: "How many people attend each event?",
      answer:
        "Our events typically have 20-30 participants (10-15 of each gender). This means you'll meet 10-15 people during the evening. We work hard to maintain a balanced gender ratio, though this can sometimes vary slightly.",
    },
    {
      question: "What should I wear?",
      answer:
        "Dress smart casual or however you'd dress for a first date. You want to look and feel your best! Most venues are upscale bars or restaurants, so avoid overly casual clothing like sportswear. When in doubt, it's better to be slightly overdressed than underdressed.",
    },
    {
      question: "How long does each date last?",
      answer:
        "Each speed date lasts approximately 5 minutes. This gives you enough time to get a first impression and see if there's chemistry, without the pressure of a longer conversation. The entire event typically lasts 2-3 hours including registration and breaks.",
    },
    {
      question: "When will I find out my matches?",
      answer:
        "You'll receive an email the day after the event with a link to submit your choices. Once everyone has submitted their selections (usually within 48 hours), we'll email you your matches. VIP ticket holders receive their matches faster and get additional perks.",
    },
    {
      question: "What if no one matches with me?",
      answer:
        "While we can't guarantee matches, most participants get at least one or two matches per event. If you don't get any matches at your first event, don't be discouraged! Speed dating is a numbers game, and we offer discounts for returning participants. Each event brings different people and different opportunities.",
    },
    {
      question: "Can I cancel my booking?",
      answer:
        "Yes, you can cancel up to 48 hours before the event for a full refund. Cancellations made less than 48 hours before the event are non-refundable, though you may be able to transfer your ticket to another event (subject to availability). Please see our Terms & Conditions for full details.",
    },
    {
      question: "Is this only for Jewish people?",
      answer:
        "Our events are primarily designed for Jewish singles, and most participants are Jewish. However, we welcome people of all backgrounds who are interested in meeting Jewish partners and are respectful of Jewish culture and traditions.",
    },
    {
      question: "Do you run events in Israel?",
      answer:
        "Yes! We run regular events in major Israeli cities including Tel Aviv, Jerusalem, Haifa, and more. Our Israeli events follow the same format as our UK events and are just as popular. Check our Events page to see what's coming up in Israel.",
    },
    {
      question: "What are the VIP benefits?",
      answer:
        "VIP ticket holders enjoy several perks: priority registration, guaranteed seat even if the event is full, reserved seating at the venue, a welcome drink, faster match results, and a discount code for future events. VIP tickets are limited and often sell out quickly.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("faqs.title")}</h1>
          <p className="text-xl text-muted-foreground">{t("faqs.subtitle")}</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg px-6 bg-card"
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

        <div className="mt-12 text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? Get in touch with our team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
