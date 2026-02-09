import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getDashboardStats,
  getUpcomingEventsWithGender,
} from "@/lib/admin/actions";
import { Users, Calendar, UserPlus, Crown } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [stats, upcomingEvents] = await Promise.all([
    getDashboardStats(),
    getUpcomingEventsWithGender(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            {stats.membersTrend > 0 && (
              <p className="text-xs text-muted-foreground">
                +{stats.membersTrend} in last 30 days
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Events
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
              Registrations (7d)
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
              Active VIPs
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
            Upcoming Events - Gender Balance
            <Link
              href="/admin/events"
              className="text-sm font-normal text-primary hover:underline"
            >
              View all
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming events</p>
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
                          Male: {event.males}
                          {event.limitMale ? `/${event.limitMale}` : ""}
                        </span>
                        <span>
                          Female: {event.females}
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
                      {event.males + event.females} total
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
              <p className="font-medium">Create Event</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/members">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">View Members</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/venues/new">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Add Venue</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
