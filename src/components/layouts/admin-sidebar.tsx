"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Users,
  Tag,
  Image,
  FileText,
  Heart,
  Crown,
  Languages,
  File,
  Menu,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function useNavGroups() {
  const t = useTranslations();

  return [
    {
      label: null,
      items: [
        { href: "/admin", label: t("admin.dashboard"), icon: LayoutDashboard },
      ],
    },
    {
      label: t("admin.events"),
      items: [
        { href: "/admin/events", label: t("admin.events"), icon: Calendar },
        { href: "/admin/venues", label: t("admin.venues"), icon: MapPin },
      ],
    },
    {
      label: t("admin.members"),
      items: [
        { href: "/admin/members", label: t("admin.members"), icon: Users },
        { href: "/admin/promotions", label: t("admin.promotions"), icon: Tag },
      ],
    },
    {
      label: t("admin.products"),
      items: [
        { href: "/admin/matchmaking", label: t("admin.matchmaking"), icon: Heart },
        { href: "/admin/compatibility", label: t("admin.compatibility"), icon: Sparkles },
        { href: "/admin/vip", label: t("admin.vip_membership"), icon: Crown },
      ],
    },
    {
      label: t("admin.content"),
      items: [
        { href: "/admin/pages", label: t("admin.pages"), icon: File },
        { href: "/admin/blog", label: t("admin.blog"), icon: FileText },
        { href: "/admin/galleries", label: t("admin.galleries"), icon: Image },
        { href: "/admin/translations", label: t("admin.translations"), icon: Languages },
      ],
    },
  ];
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
    <nav className="space-y-6">
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-2">
              {group.label}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const navGroups = useNavGroups();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button - fixed to top-left */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-4" showCloseButton>
          <SheetHeader className="px-0">
            <SheetTitle>
              <Link
                href="/admin"
                className="text-lg font-bold text-sidebar-primary"
                onClick={() => setMobileOpen(false)}
              >
                TSD Admin
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SidebarNav
              navGroups={navGroups}
              pathname={pathname}
              onLinkClick={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 border-r bg-sidebar h-full shrink-0 overflow-y-auto p-4">
        <div className="mb-8">
          <Link href="/admin" className="text-lg font-bold text-sidebar-primary">
            TSD Admin
          </Link>
        </div>
        <SidebarNav navGroups={navGroups} pathname={pathname} />
      </aside>
    </>
  );
}
