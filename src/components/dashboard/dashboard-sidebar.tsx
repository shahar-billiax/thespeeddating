"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Sparkles,
  User,
  Crown,
  Settings,
  Menu,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DashboardSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    isVip: boolean;
    profileCompletion: number;
  };
}

function useNavGroups() {
  const t = useTranslations();

  return [
    {
      label: null,
      items: [
        {
          href: "/dashboard",
          label: t("dashboard.home"),
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: t("dashboard.dating"),
      items: [
        {
          href: "/dashboard/events",
          label: t("dashboard.my_events"),
          icon: Calendar,
        },
        {
          href: "/dashboard/matches",
          label: t("dashboard.matches"),
          icon: Heart,
        },
        {
          href: "/dashboard/compatibility",
          label: t("dashboard.compatibility"),
          icon: Sparkles,
        },
      ],
    },
    {
      label: t("dashboard.account"),
      items: [
        {
          href: "/dashboard/profile",
          label: t("dashboard.profile"),
          icon: User,
        },
        {
          href: "/dashboard/subscription",
          label: t("dashboard.subscription"),
          icon: Crown,
        },
        {
          href: "/dashboard/settings",
          label: t("dashboard.settings"),
          icon: Settings,
        },
      ],
    },
  ];
}

function ProfileCard({
  user,
  compact,
}: DashboardSidebarProps & { compact?: boolean }) {
  const t = useTranslations();
  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="mb-5">
      <div
        className={cn(
          "rounded-xl border bg-gradient-to-br from-card via-card to-primary/[0.03] p-4",
          compact && "p-3"
        )}
      >
        <div className="flex items-center gap-3">
          <Avatar
            className={cn(
              "ring-2 ring-primary/10",
              compact ? "h-9 w-9" : "h-11 w-11"
            )}
          >
            <AvatarImage
              src={user.avatarUrl || undefined}
              alt={user.firstName}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-semibold truncate",
                compact ? "text-sm" : "text-[15px]"
              )}
            >
              {user.firstName} {user.lastName}
            </p>
            {user.isVip ? (
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200/60 text-[10px] px-1.5 py-0 gap-0.5 mt-0.5"
              >
                <Crown className="h-2.5 w-2.5" />
                {t("dashboard.vip_member")}
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("dashboard.free_member")}
              </p>
            )}
          </div>
        </div>
        {user.profileCompletion < 100 && (
          <div className="mt-3.5">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-muted-foreground font-medium">
                {t("dashboard.profile_completion")}
              </span>
              <span
                className={cn(
                  "font-bold tabular-nums",
                  user.profileCompletion >= 70
                    ? "text-green-600"
                    : user.profileCompletion >= 40
                      ? "text-amber-600"
                      : "text-primary"
                )}
              >
                {user.profileCompletion}%
              </span>
            </div>
            <Progress
              value={user.profileCompletion}
              className="h-1.5 bg-muted/60"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarNav({
  navGroups,
  pathname,
  onLinkClick,
}: {
  navGroups: ReturnType<typeof useNavGroups>;
  pathname: string;
  onLinkClick?: () => void;
}) {
  return (
    <nav className="space-y-5">
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em] px-3 mb-1.5">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground/70 group-hover:text-foreground"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale();
  const navGroups = useNavGroups();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRtl = locale === "he";

  return (
    <>
      {/* Mobile menu toggle — sits below header in a clean bar */}
      <div className="md:hidden z-30 border-b bg-background/95 backdrop-blur-sm px-4 py-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-full justify-start"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-4 w-4" />
          {t("dashboard.menu")}
        </Button>
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={isRtl ? "right" : "left"}
          className="w-72 p-0 flex flex-col"
          showCloseButton
        >
          <SheetHeader className="px-5 pt-5 pb-0">
            <SheetTitle className="text-start">
              <Link
                href="/dashboard"
                className="text-base font-bold text-foreground flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Heart className="h-4 w-4 text-primary fill-primary/20" />
                {t("dashboard.title")}
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <ProfileCard user={user} compact />
            <SidebarNav
              navGroups={navGroups}
              pathname={pathname}
              onLinkClick={() => setMobileOpen(false)}
            />
          </div>
          <div className="border-t px-4 py-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("dashboard.back_to_site")}
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-[260px] border-e bg-card/50 h-full shrink-0">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-5 px-1">
            <Link
              href="/dashboard"
              className="text-[15px] font-bold text-foreground flex items-center gap-2"
            >
              <Heart className="h-4 w-4 text-primary fill-primary/20" />
              {t("dashboard.title")}
            </Link>
          </div>
          <ProfileCard user={user} />
          <SidebarNav navGroups={navGroups} pathname={pathname} />
        </div>
        <div className="border-t p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted/50"
          >
            <ArrowLeft className="h-3 w-3" />
            {t("dashboard.back_to_site")}
          </Link>
        </div>
      </aside>
    </>
  );
}
