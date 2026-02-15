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
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("admin.no_upcoming_events")}</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="block hover:bg-muted/50 rounded-lg p-3 -mx-3 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {event.date} {event.time && `at ${event.time}`}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.type?.replace("_", " ")}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {event.city} - {event.venue}
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>
                          {t("admin.male")}: {event.males}
                          {event.limitMale ? `/${event.limitMale}` : ""}
                        </span>
                        <span>
                          {t("admin.female")}: {event.females}
                          {event.limitFemale ? `/${event.limitFemale}` : ""}
                        </span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                        <div
                          className="bg-blue-500 transition-all"
                          style={{
                            width: `${
                              event.males + event.females > 0
                                ? (event.males /
                                    (event.males + event.females)) *
                                  100
                                : 50
                            }%`,
                          }}
                        />
                        <div
                          className="bg-pink-500 transition-all"
                          style={{
                            width: `${
                              event.males + event.females > 0
                                ? (event.females /
                                    (event.males + event.females)) *
                                  100
                                : 50
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {event.males + event.females} {t("admin.total")}
                    </span>
                  </div>
                </Link>
              ))}
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
