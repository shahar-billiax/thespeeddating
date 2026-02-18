"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check, X, Pencil, Save, Download, ExternalLink, ChevronDown, Upload, Loader2, Building, Trash2,
} from "lucide-react";
import { quickUpdateEvent, updateParticipant, exportParticipantsCsv, getEventGalleryData, setEntityCoverImage, clearEventCover } from "@/lib/admin/actions";
import { AdminSearchInput } from "./admin-data-table";
import { MatchesTabContent } from "./matches-tab-content";
import { EntityGallery } from "./entity-gallery";

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
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
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
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
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

  const visibleColCount = 3 + 2 + 1;

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
  const [activeTab, setActiveTab] = useState("participants");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  async function handleCoverUpload(file: File) {
    setCoverUploading(true);
    try {
      const data = await getEventGalleryData(eventId);
      const formData = new FormData();
      formData.append("files", file);
      formData.append("event_id", String(eventId));
      const res = await fetch(`/api/admin/galleries/${data.galleryId}/images`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      if (result.images?.[0]?.id) {
        await setEntityCoverImage("event", eventId, result.images[0].id);
      }
      router.refresh();
    } catch (err) {
      console.error("Cover upload failed:", err);
      setCoverError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setCoverUploading(false);
    }
  }

  const males = participants.filter((p: any) => p.profiles?.gender === "male");
  const females = participants.filter((p: any) => p.profiles?.gender === "female");
  const attended = participants.filter((p: any) => p.attended === true);
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <Card className="border-l-2 border-l-blue-400">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="font-bold text-xl mt-0.5">
              <span className="text-blue-600">{males.length}M</span>
              {" / "}
              <span className="text-pink-600">{females.length}F</span>
              <span className="text-muted-foreground text-sm ml-1">= {participants.length}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-2 border-l-green-400">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">Attended</p>
            <p className="font-bold text-xl mt-0.5">{attended.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-2 border-l-purple-400">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium mt-0.5">{event.event_type?.replace(/_/g, " ") ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-l-2 border-l-emerald-400">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-medium mt-0.5">
              {event.enable_gendered_price
                ? `M: ${event.price_male ?? "—"} / F: ${event.price_female ?? "—"}`
                : event.price ?? "Free"}
              {event.currency && ` ${event.currency}`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-2 border-l-amber-400">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">Country</p>
            <p className="font-medium mt-0.5">{(event.countries as any)?.name ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="participants">
            Participants ({participants.length})
          </TabsTrigger>
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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

        {/* Details tab - inline editable - TWO COLUMN LAYOUT */}
        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left column */}
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Event Info</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <InlineField label="Description" value={event.description} fieldName="description" eventId={eventId} />
                  <InlineField label="Dress Code" value={event.dress_code} fieldName="dress_code" eventId={eventId} />
                  <InlineField label="Special Offer" value={event.special_offer} fieldName="special_offer" eventId={eventId} />
                  <InlineField label="Special Offer Value" value={event.special_offer_value} fieldName="special_offer_value" eventId={eventId} type="number" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {event.enable_gendered_price ? (
                    <div className="grid grid-cols-2 gap-3">
                      <InlineField label="Price (M)" value={event.price_male} fieldName="price_male" eventId={eventId} type="number" />
                      <InlineField label="Price (F)" value={event.price_female} fieldName="price_female" eventId={eventId} type="number" />
                    </div>
                  ) : (
                    <InlineField label="Price" value={event.price} fieldName="price" eventId={eventId} type="number" />
                  )}
                  {event.enable_gendered_price ? (
                    <div className="grid grid-cols-2 gap-3">
                      <InlineField label="VIP (M)" value={event.vip_price_male} fieldName="vip_price_male" eventId={eventId} type="number" />
                      <InlineField label="VIP (F)" value={event.vip_price_female} fieldName="vip_price_female" eventId={eventId} type="number" />
                    </div>
                  ) : (
                    <InlineField label="VIP Price" value={event.vip_price} fieldName="vip_price" eventId={eventId} type="number" />
                  )}

                  {/* Early Bird & Last Minute in Accordion */}
                  <Accordion
                    type="multiple"
                    defaultValue={[
                      ...(event.early_bird_enabled ? ["early-bird"] : []),
                      ...(event.last_minute_enabled ? ["last-minute"] : []),
                    ]}
                  >
                    <AccordionItem value="early-bird" className="border-t border-b-0">
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span>Early Bird</span>
                          <Badge variant={event.early_bird_enabled ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                            {event.early_bird_enabled ? "On" : "Off"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {event.early_bird_enabled ? (
                            <>
                              {event.enable_gendered_price ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <InlineField label="EB Price (M)" value={event.early_bird_price_male} fieldName="early_bird_price_male" eventId={eventId} type="number" />
                                  <InlineField label="EB Price (F)" value={event.early_bird_price_female} fieldName="early_bird_price_female" eventId={eventId} type="number" />
                                </div>
                              ) : (
                                <InlineField label="Early Bird Price" value={event.early_bird_price} fieldName="early_bird_price" eventId={eventId} type="number" />
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Deadline:</span>
                                <span className="text-sm">{event.early_bird_deadline ? new Date(event.early_bird_deadline).toLocaleString() : "—"}</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Early Bird pricing is disabled</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="last-minute" className="border-t border-b-0">
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span>Last Minute</span>
                          <Badge variant={event.last_minute_enabled ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                            {event.last_minute_enabled ? "On" : "Off"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {event.last_minute_enabled ? (
                            <>
                              {event.enable_gendered_price ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <InlineField label="LM Price (M)" value={event.last_minute_price_male} fieldName="last_minute_price_male" eventId={eventId} type="number" />
                                  <InlineField label="LM Price (F)" value={event.last_minute_price_female} fieldName="last_minute_price_female" eventId={eventId} type="number" />
                                </div>
                              ) : (
                                <InlineField label="Last Minute Price" value={event.last_minute_price} fieldName="last_minute_price" eventId={eventId} type="number" />
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Mode:</span>
                                <span className="text-sm">{event.last_minute_mode === "days_before" ? `${event.last_minute_days_before} days before` : "Specific date"}</span>
                              </div>
                              {event.last_minute_mode === "date" && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Activation:</span>
                                  <span className="text-sm">{event.last_minute_activation ? new Date(event.last_minute_activation).toLocaleString() : "—"}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Last Minute pricing is disabled</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cover Image */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Cover Image</CardTitle></CardHeader>
                <CardContent>
                  {(() => {
                    const hasOwnCover = !!event.cover_image;
                    const venueCover = (event.venues as any)?.cover_image as string | null;
                    const effectiveCover = event.cover_image ?? venueCover;
                    const isVenueFallback = !hasOwnCover && !!venueCover;

                    return (
                      <div>
                        {effectiveCover ? (
                          <div className={`group/cover relative rounded-lg overflow-hidden border bg-muted/20 ${isVenueFallback ? "border-blue-200 dark:border-blue-900" : "border-border/40"}`}>
                            <div className="relative aspect-[16/9] w-full">
                              <img
                                src={`${supabaseUrl}/storage/v1/object/public/media/${effectiveCover}`}
                                alt="Cover"
                                className="w-full h-full object-cover"
                              />
                              {isVenueFallback && (
                                <div className="absolute top-2 left-2">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/90 text-white shadow-sm backdrop-blur-sm">
                                    <Building className="h-3 w-3" />
                                    From venue
                                  </span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="opacity-0 group-hover/cover:opacity-100 transition-opacity"
                                  onClick={() => coverInputRef.current?.click()}
                                  disabled={coverUploading}
                                >
                                  {coverUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                  ) : (
                                    <Upload className="h-4 w-4 mr-1.5" />
                                  )}
                                  {coverUploading ? "Uploading..." : isVenueFallback ? "Upload custom cover" : "Change cover"}
                                </Button>
                                {hasOwnCover && venueCover && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="opacity-0 group-hover/cover:opacity-100 transition-opacity"
                                    onClick={async () => {
                                      await clearEventCover(eventId);
                                      router.refresh();
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    Use venue cover
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            disabled={coverUploading}
                            className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-border/40 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <div className="text-center text-muted-foreground">
                              {coverUploading ? (
                                <Loader2 className="h-8 w-8 mx-auto mb-1 animate-spin opacity-60" />
                              ) : (
                                <Upload className="h-8 w-8 mx-auto mb-1 opacity-40" />
                              )}
                              <span className="text-sm">{coverUploading ? "Uploading..." : "Upload cover image"}</span>
                            </div>
                          </button>
                        )}
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) {
                              setCoverError(null);
                              handleCoverUpload(file);
                            }
                          }}
                        />
                        {coverError && (
                          <p className="text-xs text-destructive mt-2">{coverError}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {isVenueFallback ? (
                            <>
                              Using cover from{" "}
                              <Link
                                href={`/admin/venues/${(event.venues as any)?.id}`}
                                className="text-primary hover:underline"
                              >
                                {(event.venues as any)?.name}
                              </Link>
                              . Upload an image to override.
                            </>
                          ) : hasOwnCover ? (
                            <>
                              Custom cover for this event.{" "}
                              <button
                                type="button"
                                className="text-primary hover:underline"
                                onClick={() => setActiveTab("images")}
                              >
                                Manage all images
                              </button>
                            </>
                          ) : (
                            <>
                              No cover image.{" "}
                              {(event.venues as any) ? "Assign a cover to the venue, or upload one here." : "Upload a cover image."}
                            </>
                          )}
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Time */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Time</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <InlineField label="Date" value={event.event_date} fieldName="event_date" eventId={eventId} type="date" />
                  <InlineField label="Start Time" value={event.start_time} fieldName="start_time" eventId={eventId} type="time" />
                  <InlineField label="End Time" value={event.end_time} fieldName="end_time" eventId={eventId} type="time" />
                </CardContent>
              </Card>

              {/* Age & Capacity */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Age & Capacity</CardTitle></CardHeader>
                <CardContent className="space-y-3">
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
            </div>
          </div>
        </TabsContent>

        {/* Images tab */}
        <TabsContent value="images" className="mt-4 space-y-4">
          {!event.cover_image && (event.venues as any)?.cover_image && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-3">
              <img
                src={`${supabaseUrl}/storage/v1/object/public/media/${(event.venues as any).cover_image}`}
                alt="Venue cover"
                className="w-20 h-14 rounded object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-blue-500" />
                  Using venue cover
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This event shows the cover from{" "}
                  <Link
                    href={`/admin/venues/${(event.venues as any).id}`}
                    className="text-primary hover:underline"
                  >
                    {(event.venues as any).name}
                  </Link>
                  . Upload an image below to override it with a custom event cover.
                </p>
              </div>
            </div>
          )}
          <EntityGallery
            entityType="event"
            entityId={eventId}
            currentCoverImage={event.cover_image}
            getGalleryData={getEventGalleryData}
          />
        </TabsContent>

        {/* Matches tab */}
        <TabsContent value="matches" className="mt-4">
          <MatchesTabContent eventId={eventId} />
        </TabsContent>

      </Tabs>
    </div>
  );
}
