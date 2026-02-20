"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LayoutDashboard, Calendar, MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/host", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/host/events", label: "Events", icon: Calendar, exact: false },
  { href: "/host/venues", label: "Venues", icon: MapPin, exact: false },
];

function SidebarNav({ pathname, onLinkClick }: { pathname: string; onLinkClick?: () => void }) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
    </nav>
  );
}

export function HostSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-4" showCloseButton>
          <SheetHeader className="px-0">
            <SheetTitle>
              <Link href="/host" className="text-lg font-bold text-sidebar-primary" onClick={() => setMobileOpen(false)}>
                Host Portal
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SidebarNav pathname={pathname} onLinkClick={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden md:block w-64 border-r bg-sidebar h-full shrink-0 overflow-y-auto p-4">
        <div className="mb-8">
          <Link href="/host" className="text-lg font-bold text-sidebar-primary">
            Host Portal
          </Link>
        </div>
        <SidebarNav pathname={pathname} />
      </aside>
    </>
  );
}
