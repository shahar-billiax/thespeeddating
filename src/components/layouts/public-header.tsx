"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { CountrySwitcher } from "@/components/country-switcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

export function PublicHeader({ user }: { user: { email: string } | null }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/events", label: t("nav.events") },
    { href: "/what-is-speed-dating", label: "What Is Speed Dating" },
    { href: "/dating-tips", label: "Dating Tips" },
    { href: "/matchmaking", label: "Matchmaking" },
    { href: "/online-dating", label: "Online Dating" },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
    ...(user ? [{ href: "/matches", label: t("nav.matches") }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-primary">
            The Speed Dating
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
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
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-3 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium py-2"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-2" />
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setOpen(false)} className="text-base font-medium py-2">
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
