import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getDashboardStats,
  getUpcomingEventsWithGender,
  getAdminCountryId,
} from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { Users, Calendar, UserPlus, Crown } from "lucide-react";
import Link from "next/link";


export default async function AdminDashboardPage() {
  const adminCountryId = await getAdminCountryId();
  const [stats, upcomingEvents, t] = await Promise.all([
    getDashboardStats(adminCountryId),
    getUpcomingEventsWithGender(adminCountryId),
    getTranslations(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("admin.dashboard")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("admin.total_members")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            {stats.membersTrend > 0 && (
              <p className="text-xs text-muted-foreground">
                {t("admin.in_last_30_days", { count: String(stats.membersTrend) })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("admin.upcoming_events")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {t("admin.registrations_7d")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.recentRegistrations}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {t("admin.active_vips")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeVips}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("admin.gender_balance")}
            <Link
              href="/admin/events"
              className="text-sm font-normal text-primary hover:underline"
            >
              {t("admin.view_all")}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm px-6 pb-6">{t("admin.no_upcoming_events")}</p>
          ) : (
            <div className="divide-y divide-border">
              {upcomingEvents.map((event) => {
                const total = event.males + event.females;
                const totalCapacity = (event.limitMale ?? 0) + (event.limitFemale ?? 0);
                const maleBalancePct = total > 0 ? (event.males / total) * 100 : 50;

                return (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="block hover:bg-muted/30 transition-colors px-6 py-4 first:rounded-t-none last:rounded-b-lg"
                  >
                    {/* Event header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm tabular-nums">
                          {new Date(event.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {event.time && (
                          <span className="text-xs text-muted-foreground">{event.time}</span>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {event.type?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground text-right shrink-0">
                        {event.city}{event.venue ? ` · ${event.venue}` : ""}
                      </span>
                    </div>

                    {/* Gender counts + balance bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs tabular-nums text-blue-600 dark:text-blue-400 w-14 shrink-0">
                        <span className="font-bold text-blue-500">M</span> {event.males}{event.limitMale ? `/${event.limitMale}` : ""}
                      </span>

                      <div className="flex-1 relative h-2.5 rounded-full overflow-hidden bg-muted flex">
                        <div className="h-full bg-blue-500" style={{ width: `${maleBalancePct}%` }} />
                        <div className="h-full bg-pink-500" style={{ width: `${100 - maleBalancePct}%` }} />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-background/70 -translate-x-px" />
                      </div>

                      <span className="text-xs tabular-nums text-pink-600 dark:text-pink-400 w-14 shrink-0 text-right">
                        {event.females}{event.limitFemale ? `/${event.limitFemale}` : ""} <span className="font-bold text-pink-500">F</span>
                      </span>
                    </div>

                    {/* Total capacity text */}
                    {totalCapacity > 0 && (
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-sm font-semibold tabular-nums">{total}</span>
                        <span className="text-xs text-muted-foreground">/</span>
                        <span className="text-sm font-semibold tabular-nums text-muted-foreground">{totalCapacity}</span>
                        <span className="text-xs text-muted-foreground ml-0.5">places</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/events/new">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">{t("admin.create_event")}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/members">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">{t("admin.view_members")}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/venues/new">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">{t("admin.add_venue")}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
