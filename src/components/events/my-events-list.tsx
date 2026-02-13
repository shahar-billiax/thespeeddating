"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyEventCard } from "@/components/events/my-event-card";
import { useTranslations } from "next-intl";

interface Event {
  id: string;
  event_date: string;
  start_time: string;
  venue_name: string;
  city_name: string;
  status: string;
  payment_status: string;
  match_submission_open: boolean;
  match_results_released: boolean;
  has_submitted_matches?: boolean;
}

interface MyEventsListProps {
  upcoming: Event[];
  past: Event[];
}

export function MyEventsList({ upcoming, past }: MyEventsListProps) {
  const t = useTranslations();

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="upcoming">{t("my_events.upcoming")}</TabsTrigger>
        <TabsTrigger value="past">{t("my_events.past")}</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-4 mt-6">
        {upcoming.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("my_events.no_upcoming")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <MyEventCard key={event.id} event={event} isPast={false} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past" className="space-y-4 mt-6">
        {past.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("my_events.no_past")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <MyEventCard key={event.id} event={event} isPast={true} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
