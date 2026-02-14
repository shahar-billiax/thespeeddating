"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useCountry } from "@/lib/country-context";
import {
  RegionLanguageSelector,
  REGIONS,
  LANGUAGES,
  switchRegion,
  switchLanguage,
} from "@/components/region-language-selector";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Crown, ChevronDown, User, Heart, Settings, LogOut, Shield, Check } from "lucide-react";
import { useState } from "react";

export function PublicHeader({ user }: { user: { email: string; role?: string } | null }) {
  const t = useTranslations();
  const locale = useLocale();
  const country = useCountry();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/events", label: t("nav.events") },
    { href: "/dating-tips", label: t("nav.dating_tips") },
    { href: "/matchmaking", label: t("nav.matchmaking") },
    { href: "/virtual-events", label: t("nav.virtual_events") },
    { href: "/success-stories", label: t("nav.success_stories") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border/50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-background focus:p-3 focus:text-foreground focus:border focus:rounded"
      >
        {t("nav.skip_to_content")}
      </a>
      <div className="section-container flex h-16 items-center justify-between">
        <div className="flex items-center h-full gap-10">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
            <Heart className="h-5 w-5 text-primary fill-primary/20" />
            {t("nav.brand")}
          </Link>
          <nav className="hidden lg:flex h-full items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center h-full text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 after:absolute after:bottom-0 after:inset-x-2 after:h-0.5 after:rounded-full after:bg-primary after:origin-center after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:inline-flex text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-1.5 text-[13px]"
            asChild
          >
            <Link href="/vip">
              <Crown className="h-3.5 w-3.5" />
              {t("nav.vip")}
            </Link>
          </Button>
          <RegionLanguageSelector />
          {user ? (
            <div className="hidden lg:flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-[13px] focus-visible:ring-0 focus-visible:border-transparent data-[state=open]:bg-accent"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    {t("nav.my_account")}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() => router.push("/admin")}
                      >
                        <Shield className="h-4 w-4" />
                        {t("nav.admin_panel")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => router.push("/profile")}
                  >
                    <Settings className="h-4 w-4" />
                    {t("nav.account_settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => router.push("/matches")}
                  >
                    <Heart className="h-4 w-4" />
                    {t("nav.matches")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => {
                      const form = document.createElement("form");
                      form.method = "post";
                      form.action = "/auth/signout";
                      document.body.appendChild(form);
                      form.submit();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[13px]" asChild>
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" className="text-[13px] shadow-sm" asChild>
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label={t("nav.open_menu")}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={locale === "he" ? "left" : "right"} className="w-80 p-0 flex flex-col">
              {/* Branding */}
              <div className="px-6 py-5 border-b">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-lg font-bold text-foreground"
                >
                  <Heart className="h-5 w-5 text-primary fill-primary/20" />
                  {t("nav.brand")}
                </Link>
              </div>

              {/* Scrollable nav */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Main links */}
                <div className="space-y-0.5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* More pages */}
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                    {t("nav.more")}
                  </p>
                  <Link
                    href="/vip"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                  >
                    <Crown className="h-4 w-4" />
                    {t("nav.vip")}
                  </Link>
                  <Link
                    href="/what-is-speed-dating"
                    onClick={() => setOpen(false)}
                    className="flex items-center text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    {t("nav.what_is_speed_dating")}
                  </Link>
                  <Link
                    href="/about-us"
                    onClick={() => setOpen(false)}
                    className="flex items-center text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    {t("nav.about")}
                  </Link>
                  <Link
                    href="/franchise-jobs"
                    onClick={() => setOpen(false)}
                    className="flex items-center text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    {t("nav.franchise")}
                  </Link>
                </div>

                {/* Region & Language */}
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                    {t("switcher.region")}
                  </p>
                  {REGIONS.map((r) => {
                    const isActive = r.code === country;
                    return (
                      <button
                        key={r.code}
                        onClick={() => { switchRegion(r.code); setOpen(false); }}
                        className="flex items-center gap-2.5 w-full text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors text-start"
                      >
                        <r.Flag className="h-[14px] w-[19px] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.1)]" />
                        <span className={isActive ? "font-semibold" : ""}>
                          {t(r.labelKey)}
                        </span>
                        {isActive && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
                      </button>
                    );
                  })}

                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2 mt-4">
                    {t("switcher.language")}
                  </p>
                  {LANGUAGES.map((lang) => {
                    const isActive = lang.code === locale;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => { switchLanguage(lang.code); setOpen(false); }}
                        className="flex items-center gap-2.5 w-full text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors text-start"
                      >
                        <span className={isActive ? "font-semibold" : ""}>
                          {lang.nativeName}
                        </span>
                        {isActive && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>

                {/* Account section — visible when logged in */}
                {user && (
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                      {t("nav.my_account")}
                    </p>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        {t("nav.admin_panel")}
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      {t("nav.account_settings")}
                    </Link>
                    <Link
                      href="/matches"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-[15px] font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      {t("nav.matches")}
                    </Link>
                  </div>
                )}
              </nav>

              {/* Auth actions pinned to bottom */}
              <div className="border-t px-4 py-4 space-y-2">
                {user ? (
                  <form action="/auth/signout" method="post">
                    <Button variant="outline" className="w-full gap-2" type="submit">
                      <LogOut className="h-4 w-4" />
                      {t("nav.logout")}
                    </Button>
                  </form>
                ) : (
                  <>
                    <Button className="w-full" asChild>
                      <Link href="/register" onClick={() => setOpen(false)}>
                        {t("nav.register")}
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full" asChild>
                      <Link href="/login" onClick={() => setOpen(false)}>
                        {t("nav.login")}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
