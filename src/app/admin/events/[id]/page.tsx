import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, getEventParticipants } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";
import { ParticipantsTable } from "@/components/admin/participants-table";
import { MatchControls } from "@/components/admin/match-controls";
import { MatchMatrix } from "@/components/admin/match-matrix";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let event;
  try {
    event = await getEvent(Number(id));
  } catch {
    notFound();
  }

  const participants = await getEventParticipants(Number(id));
  const males = participants.filter(
    (p: any) => p.profiles?.gender === "male"
  );
  const females = participants.filter(
    (p: any) => p.profiles?.gender === "female"
  );

  const isPast = event.event_date < new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {event.event_date} {event.start_time && `at ${event.start_time}`}
          </h1>
          <p className="text-muted-foreground">
            {(event.cities as any)?.name} - {(event.venues as any)?.name ?? "No venue"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/events/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">
              {event.event_type?.replace("_", " ") ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-1">
              {event.is_cancelled ? (
                <Badge variant="destructive">Cancelled</Badge>
              ) : !event.is_published ? (
                <Badge variant="secondary">Draft</Badge>
              ) : isPast ? (
                <Badge variant="outline">Past</Badge>
              ) : (
                <Badge>Published</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Participants</p>
            <p className="font-medium">
              <span className="text-blue-600">{males.length}M</span>
              {" / "}
              <span className="text-pink-600">{females.length}F</span>
              {" = "}
              {participants.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-medium">
              {event.enable_gendered_price
                ? `M: ${event.price_male ?? "—"} / F: ${event.price_female ?? "—"}`
                : event.price ?? "Free"}
              {event.currency && ` ${event.currency}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">
            Participants ({participants.length})
          </TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-blue-600">
                Male ({males.length}
                {event.limit_male ? `/${event.limit_male}` : ""})
              </h3>
              <ParticipantsTable participants={males} eventId={Number(id)} />
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-pink-600">
                Female ({females.length}
                {event.limit_female ? `/${event.limit_female}` : ""})
              </h3>
              <ParticipantsTable participants={females} eventId={Number(id)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          <div className="space-y-6">
            <MatchControls
              eventId={Number(id)}
              matchSubmissionOpen={event.match_submission_open}
              matchResultsReleased={event.match_results_released}
              isPast={isPast}
            />
            <MatchMatrix eventId={Number(id)} />
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {event.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="mt-1">{event.description}</p>
                </div>
              )}
              {event.dress_code && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Dress Code
                  </p>
                  <p className="mt-1">{event.dress_code}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Age Range
                </p>
                <p className="mt-1">
                  {event.enable_gendered_age
                    ? `Male: ${event.age_min_male ?? "?"}–${event.age_max_male ?? "?"} / Female: ${event.age_min_female ?? "?"}–${event.age_max_female ?? "?"}`
                    : `${event.age_min ?? "?"}–${event.age_max ?? "?"}`}
                </p>
              </div>
              {event.special_offer && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Special Offer
                  </p>
                  <p className="mt-1">
                    {event.special_offer}: {event.special_offer_value}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
