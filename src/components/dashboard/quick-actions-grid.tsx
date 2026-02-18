import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Heart, Crown } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/events",
    icon: Calendar,
    labelKey: "dashboard.browse_events",
    descKey: "dashboard.browse_events_desc",
    iconBg: "bg-blue-100 text-blue-600",
    hoverBg: "hover:border-blue-200 hover:bg-blue-50/50",
    ring: "group-hover:ring-blue-100",
  },
  {
    href: "/dashboard/profile",
    icon: User,
    labelKey: "dashboard.edit_profile",
    descKey: "dashboard.edit_profile_desc",
    iconBg: "bg-emerald-100 text-emerald-600",
    hoverBg: "hover:border-emerald-200 hover:bg-emerald-50/50",
    ring: "group-hover:ring-emerald-100",
  },
  {
    href: "/dashboard/matches",
    icon: Heart,
    labelKey: "dashboard.view_matches",
    descKey: "dashboard.view_matches_desc",
    iconBg: "bg-pink-100 text-pink-600",
    hoverBg: "hover:border-pink-200 hover:bg-pink-50/50",
    ring: "group-hover:ring-pink-100",
  },
  {
    href: "/dashboard/subscription",
    icon: Crown,
    labelKey: "dashboard.upgrade_vip",
    descKey: "dashboard.upgrade_vip_desc",
    iconBg: "bg-amber-100 text-amber-600",
    hoverBg: "hover:border-amber-200 hover:bg-amber-50/50",
    ring: "group-hover:ring-amber-100",
  },
] as const;

export async function QuickActionsGrid() {
  const t = await getTranslations();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href} className="group">
          <Card
            className={cn(
              "h-full transition-all duration-200 cursor-pointer",
              "hover:shadow-md hover:-translate-y-0.5",
              action.hoverBg
            )}
          >
            <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
              {/* Icon circle */}
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200",
                  "ring-0 ring-transparent group-hover:ring-4",
                  action.iconBg,
                  action.ring
                )}
              >
                <action.icon className="h-5 w-5" />
              </div>

              {/* Label and description */}
              <div>
                <p className="text-sm font-semibold">{t(action.labelKey)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(action.descKey)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
