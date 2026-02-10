"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { CountrySwitcher } from "@/components/country-switcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Crown } from "lucide-react";
import { useState } from "react";

export function PublicHeader({ user }: { user: { email: string } | null }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/dating-tips", label: "Dating Tips" },
    { href: "/matchmaking", label: "Matchmaking" },
    { href: "/virtual-events", label: "Virtual Events" },
    { href: "/success-stories", label: "Success Stories" },
    { href: "/contact", label: t("nav.contact") },
    { href: "/franchise", label: "Franchise/Jobs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-primary whitespace-nowrap">
            The Speed Dating
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-700 gap-1.5"
            asChild
          >
            <Link href="/vip">
              <Crown className="h-3.5 w-3.5" />
              VIP
            </Link>
          </Button>
          <CountrySwitcher />
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">{t("nav.my_account")}</Link>
              </Button>
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm" type="submit">
                  {t("nav.logout")}
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium py-2.5 px-3 rounded-md hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-2" />
                <Link
                  href="/events"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium py-2.5 px-3 rounded-md hover:bg-accent"
                >
                  {t("nav.events")}
                </Link>
                <Link
                  href="/vip"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium py-2.5 px-3 rounded-md hover:bg-accent text-yellow-600 flex items-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  VIP Membership
                </Link>
                <Link
                  href="/what-is-speed-dating"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium py-2.5 px-3 rounded-md hover:bg-accent"
                >
                  What Is Speed Dating
                </Link>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium py-2.5 px-3 rounded-md hover:bg-accent"
                >
                  About Us
                </Link>
                {user && (
                  <Link
                    href="/matches"
                    onClick={() => setOpen(false)}
                    className="text-base font-medium py-2.5 px-3 rounded-md hover:bg-accent"
                  >
                    {t("nav.matches")}
                  </Link>
                )}
                <hr className="my-2" />
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setOpen(false)} className="text-base font-medium py-2 px-3">
                      {t("nav.my_account")}
                    </Link>
                    <form action="/auth/signout" method="post">
                      <Button variant="outline" className="w-full" type="submit">
                        {t("nav.logout")}
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/login" onClick={() => setOpen(false)}>
                        {t("nav.login")}
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register" onClick={() => setOpen(false)}>
                        {t("nav.register")}
                      </Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
