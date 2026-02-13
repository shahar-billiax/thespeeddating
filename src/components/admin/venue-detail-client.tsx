"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pencil, Save, X, ExternalLink, Trash2, MapPin, Phone, Globe, Mail, User,
} from "lucide-react";
import { quickUpdateVenue, deleteVenue } from "@/lib/admin/actions";
import { AdminSearchInput } from "./admin-data-table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ─── Inline editable field ──────────────────────────────────

function InlineField({
  label,
  value,
  fieldName,
  venueId,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string | number | null;
  fieldName: string;
  venueId: number;
  type?: "text" | "number" | "url";
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(String(value ?? ""));
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const val = type === "number"
        ? (localValue ? Number(localValue) : null)
        : (localValue || null);
      await quickUpdateVenue(venueId, { [fieldName]: val });
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-start gap-2 mt-1">
          {multiline ? (
            <Textarea
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              className="text-sm"
              rows={3}
              autoFocus
            />
          ) : (
            <Input
              type={type === "url" ? "text" : type}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") setEditing(false);
              }}
            />
          )}
          <Button size="sm" variant="ghost" onClick={save} disabled={isPending}>
            <Save className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        {type === "url" && value ? (
          <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
            {String(value).replace(/^https?:\/\//, "").slice(0, 40)}
          </a>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{value ?? "—"}</p>
        )}
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  );
}

// ─── Event status helpers ───────────────────────────────────

function getEventStatus(e: any): string {
  if (e.is_cancelled) return "cancelled";
  if (!e.is_published) return "draft";
  if (e.event_date < new Date().toISOString().split("T")[0]) return "past";
  return "upcoming";
}

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "cancelled": return "destructive";
    case "draft": return "secondary";
    case "past": return "outline";
    default: return "default";
  }
}

// ─── Main component ─────────────────────────────────────────

export function VenueDetailClient({
  venue,
  venueEvents,
  venueId,
}: {
  venue: any;
  venueEvents: any[];
  venueId: number;
}) {
  const [eventSearch, setEventSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const upcomingEvents = venueEvents.filter((e) => getEventStatus(e) === "upcoming");
  const pastEvents = venueEvents.filter((e) => getEventStatus(e) !== "upcoming");

  const filteredEvents = eventSearch.trim()
    ? venueEvents.filter((e) => {
        const term = eventSearch.toLowerCase();
        return (
          e.event_date.includes(term) ||
          (e.event_type ?? "").toLowerCase().replace(/_/g, " ").includes(term) ||
          (e.cities?.name ?? "").toLowerCase().includes(term)
        );
      })
    : venueEvents;

  function handleToggleActive() {
    startTransition(async () => {
      await quickUpdateVenue(venueId, { is_active: !venue.is_active });
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{venue.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {(venue.cities as any)?.name}, {(venue.countries as any)?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={venue.is_active ? "default" : "secondary"}>
            {venue.is_active ? "Active" : "Archived"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleToggleActive} disabled={isPending}>
            {venue.is_active ? "Archive" : "Activate"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/venues/${venueId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Full Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete venue?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{venue.name}&quot;. This action cannot be undone.
                  {venueEvents.length > 0 && (
                    <span className="block mt-2 text-destructive">
                      Warning: This venue has {venueEvents.length} associated events.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(async () => {
                      await deleteVenue(venueId);
                    });
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{venueEvents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-2xl font-bold text-green-600">{upcomingEvents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">{venue.venue_type ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{venue.phone ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events ({venueEvents.length})</TabsTrigger>
          <TabsTrigger value="details">Venue Details</TabsTrigger>
          <TabsTrigger value="contact">Contact & Internal</TabsTrigger>
        </TabsList>

        {/* Events tab */}
        <TabsContent value="events" className="mt-4 space-y-4">
          <AdminSearchInput
            value={eventSearch}
            onChange={setEventSearch}
            placeholder="Search events at this venue..."
          />
          {filteredEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              {eventSearch ? "No events match your search." : "No events at this venue yet."}
            </p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event: any) => {
                    const status = getEventStatus(event);
                    return (
                      <TableRow key={event.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {event.event_date}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{event.start_time ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {event.event_type?.replace(/_/g, " ") ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{event.cities?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Details tab - inline editable */}
        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Address" value={venue.address} fieldName="address" venueId={venueId} />
                <InlineField label="Venue Type" value={venue.venue_type} fieldName="venue_type" venueId={venueId} />
                <InlineField label="Dress Code" value={venue.dress_code} fieldName="dress_code" venueId={venueId} />
                <InlineField label="Transport Info" value={venue.transport_info} fieldName="transport_info" venueId={venueId} multiline />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Description" value={venue.description} fieldName="description" venueId={venueId} multiline />
                <InlineField label="Phone" value={venue.phone} fieldName="phone" venueId={venueId} />
                <InlineField label="Website" value={venue.website} fieldName="website" venueId={venueId} type="url" />
                <InlineField label="Map URL" value={venue.map_url} fieldName="map_url" venueId={venueId} type="url" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact & Internal tab */}
        <TabsContent value="contact" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Person
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Name" value={venue.contact_person_name} fieldName="contact_person_name" venueId={venueId} />
                <InlineField label="Email" value={venue.contact_person_email} fieldName="contact_person_email" venueId={venueId} />
                <InlineField label="Phone" value={venue.contact_person_phone} fieldName="contact_person_phone" venueId={venueId} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Internal Notes</CardTitle></CardHeader>
              <CardContent>
                <InlineField label="Notes" value={venue.internal_notes} fieldName="internal_notes" venueId={venueId} multiline />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
