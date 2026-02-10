"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { Heart, Mail, Phone } from "lucide-react";

export function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">The Speed Dating</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Professional evenings for Professional Jewish People. Running Jewish speed dating events since 2003 in the UK and Israel.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-pink-500" />
              <span>120+ weddings worldwide</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.events")}
                </Link>
              </li>
              <li>
                <Link href="/dating-tips" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dating Tips
                </Link>
              </li>
              <li>
                <Link href="/matchmaking" className="text-muted-foreground hover:text-foreground transition-colors">
                  Matchmaking
                </Link>
              </li>
              <li>
                <Link href="/virtual-events" className="text-muted-foreground hover:text-foreground transition-colors">
                  Virtual Events
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/franchise" className="text-muted-foreground hover:text-foreground transition-colors">
                  Franchise/Jobs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">More</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/what-is-speed-dating" className="text-muted-foreground hover:text-foreground transition-colors">
                  What Is Speed Dating
                </Link>
              </li>
              <li>
                <Link href="/vip" className="text-muted-foreground hover:text-foreground transition-colors">
                  VIP Membership
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>

            <h4 className="font-semibold mb-3 mt-6">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-muted-foreground hover:text-foreground transition-colors">
                  Safety Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:info@TheSpeedDating.co.uk" className="hover:text-foreground transition-colors">
                  info@TheSpeedDating.co.uk
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:07950272671" className="hover:text-foreground transition-colors">
                  07950 272 671
                </a>
              </li>
            </ul>
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Opening Hours</p>
              <p>Mon-Fri: 9:30am - 7:00pm</p>
              <p>Sunday: 9:30am - 7:30pm</p>
              <p className="text-xs mt-1">(Sunday: ticket booking only)</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2003 - {new Date().getFullYear()} TheSpeedDating.co.uk</p>
            <p>Direct Touch Ltd. Production</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
