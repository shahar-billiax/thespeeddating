"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { Heart, Mail, Phone } from "lucide-react";

export function PublicFooter() {
  const { t, country } = useTranslation();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">{t("footer.brand")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-pink-500" aria-hidden="true" />
              <span>{t("footer.weddings_worldwide")}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("footer.quick_links")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.events")}
                </Link>
              </li>
              <li>
                <Link href="/dating-tips" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.dating_tips")}
                </Link>
              </li>
              <li>
                <Link href="/matchmaking" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.matchmaking")}
                </Link>
              </li>
              <li>
                <Link href="/virtual-events" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.virtual_events")}
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.success_stories")}
                </Link>
              </li>
              <li>
                <Link href="/franchise-jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.franchise")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("footer.more")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about-us" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/what-is-speed-dating" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.what_is_speed_dating")}
                </Link>
              </li>
              <li>
                <Link href="/vip" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.vip")}
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("faqs.title")}
                </Link>
              </li>
            </ul>

            <h4 className="font-semibold mb-3 mt-6">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("terms.title")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("privacy.title")}
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("safety.title")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("contact.contact_details")}</h4>
            <ul className="space-y-3 text-sm">
              {(() => {
                const email = country === "il" ? "Info@TheSpeedDating.co.il" : "info@TheSpeedDating.co.uk";
                const phone = country === "il" ? "052-8809879" : "07950 272 671";
                return (
                  <>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <a href={`mailto:${email}`} className="hover:text-foreground transition-colors">
                        {email}
                      </a>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <a href={`tel:${phone.replace(/[\s-]/g, "")}`} className="hover:text-foreground transition-colors">
                        {phone}
                      </a>
                    </li>
                  </>
                );
              })()}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>{t("footer.copyright", { year: String(new Date().getFullYear()) })}</p>
            <p>{t("footer.production")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
