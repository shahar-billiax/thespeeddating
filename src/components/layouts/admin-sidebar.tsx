"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Users,
  Tag,
  Image,
  FileText,
  Heart,
  Languages,
  File,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/venues", label: "Venues", icon: MapPin },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/galleries", label: "Galleries", icon: Image },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/pages", label: "Pages", icon: File },
  { href: "/admin/matchmaking", label: "Matchmaking", icon: Heart },
  { href: "/admin/translations", label: "Translations", icon: Languages },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-sidebar min-h-screen p-4">
      <div className="mb-8">
        <Link href="/admin" className="text-lg font-bold text-sidebar-primary">
          TSD Admin
        </Link>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
