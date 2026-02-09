import { notFound } from "next/navigation";
import { getMember, getCountries, getCities } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberEditor } from "@/components/admin/member-editor";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data;
  try {
    data = await getMember(id);
  } catch {
    notFound();
  }

  const { profile, registrations, vipSubs } = data;
  if (!profile) notFound();

  const [countries, cities] = await Promise.all([getCountries(), getCities()]);

  const age = profile.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(profile.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{profile.gender}</Badge>
          {age && <Badge variant="outline">Age {age}</Badge>}
          <Badge variant={profile.is_active ? "default" : "destructive"}>
            {profile.is_active ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
            {profile.role}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="events">Events ({registrations.length})</TabsTrigger>
          <TabsTrigger value="vip">VIP ({vipSubs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <MemberEditor
            member={profile}
            countries={countries}
            cities={cities}
          />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {registrations.length === 0 ? (
                <p className="text-muted-foreground">No event registrations</p>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg: any) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {reg.events?.event_date} - {reg.events?.cities?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reg.events?.event_type?.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{reg.status}</Badge>
                        <Badge
                          variant={
                            reg.payment_status === "paid"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {reg.payment_status}
                        </Badge>
                        {reg.attended !== null && (
                          <Badge variant={reg.attended ? "default" : "destructive"}>
                            {reg.attended ? "Attended" : "No show"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {vipSubs.length === 0 ? (
                <p className="text-muted-foreground">No VIP subscriptions</p>
              ) : (
                <div className="space-y-3">
                  {vipSubs.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{sub.plan_type} plan</p>
                        <p className="text-sm text-muted-foreground">
                          {sub.current_period_start} → {sub.current_period_end}
                        </p>
                      </div>
                      <Badge
                        variant={sub.status === "active" ? "default" : "secondary"}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
