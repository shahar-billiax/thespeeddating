"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">The Speed Dating</h3>
            <p className="text-sm text-muted-foreground">
              Jewish speed dating events in the UK and Israel.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-muted-foreground hover:text-foreground">
                  {t("nav.events")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/vip" className="text-muted-foreground hover:text-foreground">
                  {t("nav.vip")}
                </Link>
              </li>
              <li>
                <Link href="/matchmaking" className="text-muted-foreground hover:text-foreground">
                  {t("nav.matchmaking")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  {t("nav.blog")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          {t("footer.copyright", { year: new Date().getFullYear().toString() })}
        </div>
      </div>
    </footer>
  );
}
