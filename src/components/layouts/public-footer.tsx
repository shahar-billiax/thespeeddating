"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCountry } from "@/lib/country-context";
import { Heart, Mail, Phone } from "lucide-react";

export function PublicFooter() {
  const t = useTranslations();
  const country = useCountry();

  return (
    <footer className="border-t bg-foreground text-white/80">
      <div className="section-container py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary fill-primary/30" />
              <h3 className="font-bold text-lg text-white">{t("footer.brand")}</h3>
            </div>
            <p className="text-sm leading-relaxed text-white/60 mb-5 max-w-xs">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Heart className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>{t("footer.weddings_worldwide")}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">{t("footer.quick_links")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/events" className="text-white/60 hover:text-white transition-colors">
                  {t("nav.events")}
                </Link>
              </li>
              <li>
                <Link href="/dating-tips" className="text-white/60 hover:text-white transition-colors">
                  {t("nav.dating_tips")}
                </Link>
              </li>
              <li>
                <Link href="/matchmaking" className="text-white/60 hover:text-white transition-colors">
                  {t("nav.matchmaking")}
                </Link>
              </li>
              <li>
                <Link href="/virtual-events" className="text-white/60 hover:text-white transition-colors">
                  {t("nav.virtual_events")}
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-white/60 hover:text-white transition-colors">
                  {t("nav.success_stories")}
                </Link>
              </li>
              <li>
                <Link href="/franchise-jobs" className="text-white/60 hover:text-white transition-colors">
                  {t("nav.franchise")}
                </Link>
              </li>
            </ul>
          </div>

          {/* More + Legal */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">{t("footer.more")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about-us" className="text-white/60 hover:text-white transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/what-is-speed-dating" className="text-white/60 hover:text-white transition-colors">
                  {t("nav.what_is_speed_dating")}
                </Link>
              </li>
              <li>
                <Link href="/vip" className="text-white/60 hover:text-white transition-colors">
                  {t("nav.vip")}
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-white/60 hover:text-white transition-colors">
                  {t("faqs.title")}
                </Link>
              </li>
            </ul>

            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4 mt-8">{t("footer.legal")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/terms" className="text-white/60 hover:text-white transition-colors">
                  {t("terms.title")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
                  {t("privacy.title")}
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-white/60 hover:text-white transition-colors">
                  {t("safety.title")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">{t("contact.contact_details")}</h4>
            <ul className="space-y-4 text-sm">
              {(() => {
                const email = country === "il" ? "Info@TheSpeedDating.co.il" : "info@TheSpeedDating.co.uk";
                const phone = country === "il" ? "052-8809879" : "07950 272 671";
                return (
                  <>
                    <li className="flex items-center gap-3 text-white/60">
                      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
                      </div>
                      <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                        {email}
                      </a>
                    </li>
                    <li className="flex items-center gap-3 text-white/60">
                      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Phone className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
                      </div>
                      <a href={`tel:${phone.replace(/[\s-]/g, "")}`} className="hover:text-white transition-colors">
                        {phone}
                      </a>
                    </li>
                  </>
                );
              })()}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <p>{t("footer.copyright", { year: String(new Date().getFullYear()) })}</p>
            <p>{t("footer.production")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
