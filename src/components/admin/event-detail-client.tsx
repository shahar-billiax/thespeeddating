"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
  Check, X, Pencil, Save, Download, ExternalLink, ChevronDown,
} from "lucide-react";
import { quickUpdateEvent, updateParticipant, exportParticipantsCsv } from "@/lib/admin/actions";
import { AdminSearchInput } from "./admin-data-table";
import { CoverImageUpload } from "./cover-image-upload";
import { MatchesTabContent } from "./matches-tab-content";

// ─── Inline editable field ──────────────────────────────────

function InlineField({
  label,
  value,
  fieldName,
  eventId,
  type = "text",
}: {
  label: string;
  value: string | number | null;
  fieldName: string;
  eventId: number;
  type?: "text" | "number" | "date" | "time";
}) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(String(value ?? ""));
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const val = type === "number"
        ? (localValue ? Number(localValue) : null)
        : (localValue || null);
      await quickUpdateEvent(eventId, { [fieldName]: val });
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
          />
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
        <p className="text-sm">{value ?? "—"}</p>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  );
}

// ─── Toggle field ───────────────────────────────────────────

function ToggleField({
  label,
  checked,
  fieldName,
  eventId,
}: {
  label: string;
  checked: boolean;
  fieldName: string;
  eventId: number;
}) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await quickUpdateEvent(eventId, { [fieldName]: !checked });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={toggle}
        disabled={isPending}
      />
      <Label className="text-sm">{label}</Label>
    </div>
  );
}

// ─── Participant row with link to member ────────────────────

function ParticipantRow({
  participant,
}: {
  participant: any;
}) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const profile = participant.profiles;
  const age = profile?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(profile.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  function toggleAttended() {
    startTransition(async () => {
      await updateParticipant(participant.id, { attended: !participant.attended });
    });
  }

  // Count visible columns: always 3 (Name, Status, Attended) + conditionally Phone/Age (md) + Payment (lg)
  const visibleColCount = 3 + 2 + 1; // max columns for colSpan

  return (
    <>
      <TableRow
        className="cursor-pointer lg:cursor-default"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <TableCell className="py-1.5 max-w-0">
          <div className="flex items-center gap-1">
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform lg:hidden ${
                expanded ? "rotate-180" : ""
              }`}
            />
            <div className="min-w-0">
              <Link
                href={`/admin/members/${profile?.id}`}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {profile?.first_name} {profile?.last_name}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </Link>
              <div className="text-xs text-muted-foreground truncate">
                {profile?.email}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-1.5 text-muted-foreground hidden md:table-cell">{profile?.phone ?? "—"}</TableCell>
        <TableCell className="py-1.5 text-center hidden md:table-cell">{age ?? "—"}</TableCell>
        <TableCell className="py-1.5">
          <Badge
            variant={
              participant.status === "confirmed" ? "default"
              : participant.status === "waitlisted" ? "secondary"
              : "outline"
            }
          >
            {participant.status}
          </Badge>
        </TableCell>
        <TableCell className="py-1.5 hidden lg:table-cell">
          <Badge variant={participant.payment_status === "paid" ? "default" : "secondary"}>
            {participant.payment_status}
          </Badge>
        </TableCell>
        <TableCell className="py-1.5 text-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isPending}
            onClick={(e) => {
              e.stopPropagation();
              toggleAttended();
            }}
          >
            {participant.attended ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="lg:hidden bg-muted/30">
          <TableCell colSpan={visibleColCount} className="py-2 px-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div className="md:hidden">
                <span className="text-muted-foreground">Phone: </span>
                <span>{profile?.phone ?? "—"}</span>
              </div>
              <div className="md:hidden">
                <span className="text-muted-foreground">Age: </span>
                <span>{age ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Payment: </span>
                <Badge variant={participant.payment_status === "paid" ? "default" : "secondary"} className="text-xs">
                  {participant.payment_status}
                </Badge>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Main component ─────────────────────────────────────────

export function EventDetailClient({
  event,
  participants,
  eventId,
}: {
  event: any;
  participants: any[];
  eventId: number;
}) {
  const [participantSearch, setParticipantSearch] = useState("");

  const males = participants.filter((p: any) => p.profiles?.gender === "male");
  const females = participants.filter((p: any) => p.profiles?.gender === "female");
  const isPast = event.event_date < new Date().toISOString().split("T")[0];

  const filteredMales = participantSearch.trim()
    ? males.filter((p: any) => {
        const term = participantSearch.toLowerCase();
        return (
          (p.profiles?.first_name ?? "").toLowerCase().includes(term) ||
          (p.profiles?.last_name ?? "").toLowerCase().includes(term) ||
          (p.profiles?.email ?? "").toLowerCase().includes(term)
        );
      })
    : males;

  const filteredFemales = participantSearch.trim()
    ? females.filter((p: any) => {
        const term = participantSearch.toLowerCase();
        return (
          (p.profiles?.first_name ?? "").toLowerCase().includes(term) ||
          (p.profiles?.last_name ?? "").toLowerCase().includes(term) ||
          (p.profiles?.email ?? "").toLowerCase().includes(term)
        );
      })
    : females;

  async function handleExportCsv() {
    const result = await exportParticipantsCsv(eventId);
    const blob = new Blob([result.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {event.event_date} {event.start_time && `at ${event.start_time}`}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{(event.cities as any)?.name}</span>
            <span>-</span>
            {(event.venues as any) ? (
              <Link
                href={`/admin/venues/${(event.venues as any).id}`}
                className="text-primary hover:underline"
              >
                {(event.venues as any).name}
              </Link>
            ) : (
              <span>No venue</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={isPast ? "outline" : event.is_cancelled ? "destructive" : !event.is_published ? "secondary" : "default"}>
            {event.is_cancelled ? "Cancelled" : !event.is_published ? "Draft" : isPast ? "Past" : "Published"}
          </Badge>
          <Button variant="outline" asChild>
            <Link href={`/admin/events/${eventId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Full Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Participants</p>
            <p className="font-medium text-lg">
              <span className="text-blue-600">{males.length}M</span>
              {" / "}
              <span className="text-pink-600">{females.length}F</span>
              <span className="text-muted-foreground text-sm ml-1">= {participants.length}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">{event.event_type?.replace(/_/g, " ") ?? "—"}</p>
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
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Country</p>
            <p className="font-medium">{(event.countries as any)?.name ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">
            Participants ({participants.length})
          </TabsTrigger>
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="settings">Quick Settings</TabsTrigger>
        </TabsList>

        {/* Participants tab */}
        <TabsContent value="participants" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <AdminSearchInput
              value={participantSearch}
              onChange={setParticipantSearch}
              placeholder="Search participants..."
            />
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-blue-600">
                Male ({filteredMales.length}
                {event.limit_male ? `/${event.limit_male}` : ""})
              </h3>
              {filteredMales.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No male participants</p>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-full">Name</TableHead>
                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                        <TableHead className="text-center hidden md:table-cell">Age</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Payment</TableHead>
                        <TableHead className="text-center">Attended</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMales.map((p: any) => (
                        <ParticipantRow key={p.id} participant={p} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-pink-600">
                Female ({filteredFemales.length}
                {event.limit_female ? `/${event.limit_female}` : ""})
              </h3>
              {filteredFemales.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No female participants</p>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-full">Name</TableHead>
                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                        <TableHead className="text-center hidden md:table-cell">Age</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Payment</TableHead>
                        <TableHead className="text-center">Attended</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFemales.map((p: any) => (
                        <ParticipantRow key={p.id} participant={p} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Details tab - inline editable */}
        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Cover Image</CardTitle></CardHeader>
              <CardContent>
                <div className="max-w-md">
                  <CoverImageUpload
                    currentImage={event.cover_image}
                    onSave={(storagePath) => quickUpdateEvent(eventId, { cover_image: storagePath })}
                    label="Event image (overrides venue image on event cards)"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Event Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Description" value={event.description} fieldName="description" eventId={eventId} />
                <InlineField label="Dress Code" value={event.dress_code} fieldName="dress_code" eventId={eventId} />
                <InlineField label="Special Offer" value={event.special_offer} fieldName="special_offer" eventId={eventId} />
                <InlineField label="Special Offer Value" value={event.special_offer_value} fieldName="special_offer_value" eventId={eventId} type="number" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Age & Capacity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {event.enable_gendered_age ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <InlineField label="Min Age (M)" value={event.age_min_male} fieldName="age_min_male" eventId={eventId} type="number" />
                      <InlineField label="Max Age (M)" value={event.age_max_male} fieldName="age_max_male" eventId={eventId} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InlineField label="Min Age (F)" value={event.age_min_female} fieldName="age_min_female" eventId={eventId} type="number" />
                      <InlineField label="Max Age (F)" value={event.age_max_female} fieldName="age_max_female" eventId={eventId} type="number" />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <InlineField label="Min Age" value={event.age_min} fieldName="age_min" eventId={eventId} type="number" />
                    <InlineField label="Max Age" value={event.age_max} fieldName="age_max" eventId={eventId} type="number" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <InlineField label="Limit Male" value={event.limit_male} fieldName="limit_male" eventId={eventId} type="number" />
                  <InlineField label="Limit Female" value={event.limit_female} fieldName="limit_female" eventId={eventId} type="number" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {event.enable_gendered_price ? (
                  <div className="grid grid-cols-2 gap-3">
                    <InlineField label="Price (M)" value={event.price_male} fieldName="price_male" eventId={eventId} type="number" />
                    <InlineField label="Price (F)" value={event.price_female} fieldName="price_female" eventId={eventId} type="number" />
                  </div>
                ) : (
                  <InlineField label="Price" value={event.price} fieldName="price" eventId={eventId} type="number" />
                )}
                <InlineField label="VIP Price" value={event.vip_price} fieldName="vip_price" eventId={eventId} type="number" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Time</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Date" value={event.event_date} fieldName="event_date" eventId={eventId} type="date" />
                <InlineField label="Start Time" value={event.start_time} fieldName="start_time" eventId={eventId} type="time" />
                <InlineField label="End Time" value={event.end_time} fieldName="end_time" eventId={eventId} type="time" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Matches tab */}
        <TabsContent value="matches" className="mt-4">
          <MatchesTabContent eventId={eventId} />
        </TabsContent>

        {/* Quick Settings tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <ToggleField label="Published" checked={event.is_published} fieldName="is_published" eventId={eventId} />
              <ToggleField label="Cancelled" checked={event.is_cancelled} fieldName="is_cancelled" eventId={eventId} />
              <ToggleField label="Match Submission Open" checked={event.match_submission_open} fieldName="match_submission_open" eventId={eventId} />
              <ToggleField label="Match Results Released" checked={event.match_results_released} fieldName="match_results_released" eventId={eventId} />
              <ToggleField label="Gendered Pricing" checked={event.enable_gendered_price} fieldName="enable_gendered_price" eventId={eventId} />
              <ToggleField label="Gendered Age Ranges" checked={event.enable_gendered_age} fieldName="enable_gendered_age" eventId={eventId} />
              <ToggleField label="Lock Match Submissions" checked={event.match_submission_locked} fieldName="match_submission_locked" eventId={eventId} />
              <div className="space-y-1.5 pt-2 border-t">
                <Label className="text-sm">Match Submission Deadline</Label>
                <Input
                  type="datetime-local"
                  defaultValue={event.match_submission_deadline?.slice(0, 16) ?? ""}
                  className="h-8 text-sm max-w-xs"
                  onBlur={(e) => {
                    const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                    quickUpdateEvent(eventId, { match_submission_deadline: val });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
