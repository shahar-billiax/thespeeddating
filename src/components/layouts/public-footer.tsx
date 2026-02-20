"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCountry } from "@/lib/country-context";
import { Heart, Mail, Phone } from "lucide-react";

export function PublicFooter() {
  const t = useTranslations();
  const country = useCountry();

  const linkClass = "text-white/65 hover:text-white transition-colors duration-150";
  const headingClass = "text-[11px] font-semibold text-white/45 uppercase tracking-widest mb-4";

  return (
    <footer
      className="relative overflow-hidden text-white/80"
      style={{ background: "oklch(0.22 0.04 12)" }}
    >
      {/* Warm gradient glow from top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% -10%, oklch(0.48 0.16 12 / 0.12) 0%, transparent 100%)",
        }}
      />

      {/* Rose accent top border */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, oklch(0.48 0.16 12 / 0.5) 30%, oklch(0.48 0.16 12 / 0.5) 70%, transparent)",
        }}
      />

      <div className="section-container py-14 sm:py-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.48 0.16 12 / 0.2)" }}
              >
                <Heart className="h-3.5 w-3.5 fill-current" style={{ color: "oklch(0.75 0.12 12)" }} />
              </div>
              <h3 className="font-semibold text-base text-white tracking-tight">{t("footer.brand")}</h3>
            </div>
            <p className="text-sm leading-relaxed text-white/50 mb-5 max-w-xs">
              {t("footer.description")}
            </p>
            <div
              className="inline-flex items-center gap-2 text-xs rounded-full px-3 py-1.5"
              style={{ background: "oklch(0.48 0.16 12 / 0.12)", color: "oklch(0.75 0.12 12)" }}
            >
              <Heart className="h-3 w-3 fill-current shrink-0" aria-hidden="true" />
              <span>{t("footer.weddings_worldwide")}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={headingClass}>{t("footer.quick_links")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/events" className={linkClass}>{t("nav.events")}</Link></li>
              <li><Link href="/dating-tips" className={linkClass}>{t("nav.dating_tips")}</Link></li>
              <li><Link href="/matchmaking" className={linkClass}>{t("nav.matchmaking")}</Link></li>
              <li><Link href="/virtual-events" className={linkClass}>{t("nav.virtual_events")}</Link></li>
              <li><Link href="/success-stories" className={linkClass}>{t("nav.success_stories")}</Link></li>
              <li><Link href="/franchise-jobs" className={linkClass}>{t("nav.franchise")}</Link></li>
            </ul>
          </div>

          {/* More + Legal */}
          <div>
            <h4 className={headingClass}>{t("footer.more")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about-us" className={linkClass}>{t("nav.about")}</Link></li>
              <li><Link href="/what-is-speed-dating" className={linkClass}>{t("nav.what_is_speed_dating")}</Link></li>
              <li><Link href="/vip" className={linkClass}>{t("nav.vip")}</Link></li>
              <li><Link href="/faqs" className={linkClass}>{t("faqs.title")}</Link></li>
            </ul>

            <h4 className={`${headingClass} mt-8`}>{t("footer.legal")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms" className={linkClass}>{t("terms.title")}</Link></li>
              <li><Link href="/privacy" className={linkClass}>{t("privacy.title")}</Link></li>
              <li><Link href="/safety" className={linkClass}>{t("safety.title")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={headingClass}>{t("contact.contact_details")}</h4>
            <ul className="space-y-3.5 text-sm">
              {(() => {
                const email = country === "il" ? "Info@TheSpeedDating.co.il" : "info@TheSpeedDating.co.uk";
                const phone = country === "il" ? "052-8809879" : "07950 272 671";
                return (
                  <>
                    <li>
                      <a
                        href={`mailto:${email}`}
                        className="flex items-center gap-3 text-white/55 hover:text-white transition-colors duration-150 group"
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150"
                          style={{ background: "oklch(0.48 0.16 12 / 0.15)" }}
                        >
                          <Mail className="h-3.5 w-3.5" style={{ color: "oklch(0.75 0.12 12)" }} aria-hidden="true" />
                        </div>
                        <span className="group-hover:text-white transition-colors">{email}</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href={`tel:${phone.replace(/[\s-]/g, "")}`}
                        className="flex items-center gap-3 text-white/55 hover:text-white transition-colors duration-150 group"
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "oklch(0.48 0.16 12 / 0.15)" }}
                        >
                          <Phone className="h-3.5 w-3.5" style={{ color: "oklch(0.75 0.12 12)" }} aria-hidden="true" />
                        </div>
                        <span className="group-hover:text-white transition-colors">{phone}</span>
                      </a>
                    </li>
                  </>
                );
              })()}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.07)" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/30">
            <p>{t("footer.copyright", { year: String(new Date().getFullYear()) })}</p>
            <p>{t("footer.production")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
