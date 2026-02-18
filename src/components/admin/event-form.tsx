"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createEvent, updateEvent } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useAdminCountry } from "@/lib/admin-country-context";
import { AlertTriangle, Save } from "lucide-react";

const EVENT_TYPES = [
  { value: "jewish_general", label: "Jewish General" },
  { value: "jewish_secular", label: "Jewish Secular" },
  { value: "jewish_traditional", label: "Jewish Traditional" },
  { value: "jewish_divorcees", label: "Jewish Divorcees" },
  { value: "jewish_single_parents", label: "Single Parents" },
  { value: "jewish_conservative", label: "Jewish Conservative" },
  { value: "jewish_modern_orthodox", label: "Modern Orthodox" },
  { value: "israeli", label: "Israeli" },
  { value: "party", label: "Singles Party" },
  { value: "singles", label: "Singles Mixer" },
  { value: "virtual", label: "Virtual Event" },
];

export function EventForm({
  event,
  countries,
  cities,
  defaultCountryId,
}: {
  event?: any;
  countries: { id: number; name: string; code: string; currency: string }[];
  cities: { id: number; name: string; country_id: number }[];
  defaultCountryId?: number;
}) {
  const [countryId, setCountryId] = useState(
    event?.country_id
      ? String(event.country_id)
      : defaultCountryId
        ? String(defaultCountryId)
        : ""
  );
  const [cityId, setCityId] = useState(
    event?.city_id ? String(event.city_id) : ""
  );
  const [genderedPrice, setGenderedPrice] = useState(
    event?.enable_gendered_price ?? false
  );
  const [genderedAge, setGenderedAge] = useState(
    event?.enable_gendered_age ?? false
  );
  const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(
    event?.early_bird_enabled ?? false
  );
  const [lastMinuteEnabled, setLastMinuteEnabled] = useState(
    event?.last_minute_enabled ?? false
  );
  const [lastMinuteMode, setLastMinuteMode] = useState<string>(
    event?.last_minute_mode ?? "date"
  );

  const filteredCities = countryId
    ? cities.filter((c) => c.country_id === Number(countryId))
    : cities;

  const currency =
    countries.find((c) => c.id === Number(countryId))?.currency ?? "";

  async function handleSubmit(
    _prev: any,
    formData: FormData
  ): Promise<{ error?: string } | undefined> {
    if (event) {
      return await updateEvent(event.id, formData);
    }
    return await createEvent(formData);
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);
  const { countryId: adminCountryId } = useAdminCountry();
  const entityCountryId = event?.country_id;
  const isCrossCountry = event && entityCountryId && entityCountryId !== adminCountryId;
  const entityCountryName = isCrossCountry
    ? countries.find((c) => c.id === entityCountryId)?.name ?? "another country"
    : "";
  const adminCountryName = countries.find((c) => c.id === adminCountryId)?.name ?? "";

  const defaultAccordionValues = [
    ...(earlyBirdEnabled ? ["early-bird"] : []),
    ...(lastMinuteEnabled ? ["last-minute"] : []),
  ];

  return (
    <form action={formAction}>
      {/* ─── Sticky action bar ───────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {event ? "Edit Event" : "New Event"}
          </h1>
          <div className="flex items-center gap-2">
            {event && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/events/${event.id}`}>Cancel</Link>
              </Button>
            )}
            <Button type="submit" size="sm" disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Alerts ──────────────────────────────────────────── */}
      {isCrossCountry && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm mb-4">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            This event belongs to <strong>{entityCountryName}</strong>, but you are
            currently managing <strong>{adminCountryName}</strong>. Changes will
            affect the {entityCountryName} site.
          </span>
        </div>
      )}
      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">
          {state.error}
        </p>
      )}

      {/* ─── Two-column layout ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ── Left column ─────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="country_id">Country</Label>
                  <Select
                    name="country_id"
                    value={countryId}
                    onValueChange={(v) => {
                      setCountryId(v);
                      setCityId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city_id">City</Label>
                  <Select
                    name="city_id"
                    value={cityId}
                    onValueChange={setCityId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCities.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="venue_id">Venue ID (optional)</Label>
                <Input
                  name="venue_id"
                  type="number"
                  defaultValue={event?.venue_id ?? ""}
                  placeholder="Enter venue ID"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  name="description"
                  rows={3}
                  defaultValue={event?.description ?? ""}
                />
              </div>

              <div>
                <Label htmlFor="dress_code">Dress Code</Label>
                <Input
                  name="dress_code"
                  defaultValue={event?.dress_code ?? ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Pricing {currency && `(${currency})`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input name="currency" type="hidden" value={currency} />

              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <Label htmlFor="enable_gendered_price" className="cursor-pointer text-sm">
                  Different prices for male/female
                </Label>
                <Switch
                  id="enable_gendered_price"
                  name="enable_gendered_price"
                  checked={genderedPrice}
                  onCheckedChange={setGenderedPrice}
                />
              </div>

              {genderedPrice ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="price_male">Male Price</Label>
                    <Input
                      name="price_male"
                      type="number"
                      step="0.01"
                      defaultValue={event?.price_male ?? ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_female">Female Price</Label>
                    <Input
                      name="price_female"
                      type="number"
                      step="0.01"
                      defaultValue={event?.price_female ?? ""}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={event?.price ?? ""}
                  />
                </div>
              )}

              {genderedPrice ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="vip_price_male">VIP Price (Male)</Label>
                    <Input
                      name="vip_price_male"
                      type="number"
                      step="0.01"
                      defaultValue={event?.vip_price_male ?? ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vip_price_female">VIP Price (Female)</Label>
                    <Input
                      name="vip_price_female"
                      type="number"
                      step="0.01"
                      defaultValue={event?.vip_price_female ?? ""}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="vip_price">VIP Price</Label>
                  <Input
                    name="vip_price"
                    type="number"
                    step="0.01"
                    defaultValue={event?.vip_price ?? ""}
                  />
                </div>
              )}

              {/* Early Bird & Last Minute Accordion */}
              <Accordion type="multiple" defaultValue={defaultAccordionValues}>
                <AccordionItem value="early-bird" className="border-t border-b-0">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>Early Bird Pricing</span>
                      <Badge variant={earlyBirdEnabled ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {earlyBirdEnabled ? "On" : "Off"}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                      <Label htmlFor="early_bird_enabled" className="cursor-pointer text-sm">
                        Enable Early Bird
                      </Label>
                      <Switch
                        id="early_bird_enabled"
                        name="early_bird_enabled"
                        checked={earlyBirdEnabled}
                        onCheckedChange={setEarlyBirdEnabled}
                      />
                    </div>

                    {earlyBirdEnabled && (
                      <>
                        {genderedPrice ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="early_bird_price_male">Early Bird (Male)</Label>
                              <Input
                                name="early_bird_price_male"
                                type="number"
                                step="0.01"
                                defaultValue={event?.early_bird_price_male ?? ""}
                                placeholder="e.g. 15.00"
                              />
                            </div>
                            <div>
                              <Label htmlFor="early_bird_price_female">Early Bird (Female)</Label>
                              <Input
                                name="early_bird_price_female"
                                type="number"
                                step="0.01"
                                defaultValue={event?.early_bird_price_female ?? ""}
                                placeholder="e.g. 12.00"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="early_bird_price">Early Bird Price</Label>
                            <Input
                              name="early_bird_price"
                              type="number"
                              step="0.01"
                              defaultValue={event?.early_bird_price ?? ""}
                              placeholder="e.g. 15.00"
                            />
                          </div>
                        )}
                        <div>
                          <Label htmlFor="early_bird_deadline">Deadline</Label>
                          <Input
                            name="early_bird_deadline"
                            type="datetime-local"
                            defaultValue={
                              event?.early_bird_deadline
                                ? new Date(event.early_bird_deadline)
                                    .toISOString()
                                    .slice(0, 16)
                                : ""
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Early bird price ends at this date/time
                          </p>
                        </div>
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="last-minute" className="border-t border-b-0">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>Last Minute Pricing</span>
                      <Badge variant={lastMinuteEnabled ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {lastMinuteEnabled ? "On" : "Off"}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                      <Label htmlFor="last_minute_enabled" className="cursor-pointer text-sm">
                        Enable Last Minute
                      </Label>
                      <Switch
                        id="last_minute_enabled"
                        name="last_minute_enabled"
                        checked={lastMinuteEnabled}
                        onCheckedChange={setLastMinuteEnabled}
                      />
                    </div>

                    {lastMinuteEnabled && (
                      <>
                        {genderedPrice ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="last_minute_price_male">Last Minute (Male)</Label>
                              <Input
                                name="last_minute_price_male"
                                type="number"
                                step="0.01"
                                defaultValue={event?.last_minute_price_male ?? ""}
                                placeholder="e.g. 12.00"
                              />
                            </div>
                            <div>
                              <Label htmlFor="last_minute_price_female">Last Minute (Female)</Label>
                              <Input
                                name="last_minute_price_female"
                                type="number"
                                step="0.01"
                                defaultValue={event?.last_minute_price_female ?? ""}
                                placeholder="e.g. 10.00"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="last_minute_price">Last Minute Price</Label>
                            <Input
                              name="last_minute_price"
                              type="number"
                              step="0.01"
                              defaultValue={event?.last_minute_price ?? ""}
                              placeholder="e.g. 12.00"
                            />
                          </div>
                        )}

                        <div>
                          <Label>Activation Mode</Label>
                          <Select
                            name="last_minute_mode"
                            value={lastMinuteMode}
                            onValueChange={setLastMinuteMode}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date">Specific Date/Time</SelectItem>
                              <SelectItem value="days_before">Days Before Event</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {lastMinuteMode === "date" ? (
                          <div>
                            <Label htmlFor="last_minute_activation">Activation Date/Time</Label>
                            <Input
                              name="last_minute_activation"
                              type="datetime-local"
                              defaultValue={
                                event?.last_minute_activation
                                  ? new Date(event.last_minute_activation)
                                      .toISOString()
                                      .slice(0, 16)
                                  : ""
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Last minute price starts at this date/time
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="last_minute_days_before">Days Before Event</Label>
                            <Input
                              name="last_minute_days_before"
                              type="number"
                              min="1"
                              defaultValue={event?.last_minute_days_before ?? ""}
                              placeholder="e.g. 3"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Last minute price activates this many days before the event
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Date, Time & Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="event_date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  name="event_date"
                  type="date"
                  required
                  defaultValue={event?.event_date ?? ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    name="start_time"
                    type="time"
                    defaultValue={event?.start_time ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    name="end_time"
                    type="time"
                    defaultValue={event?.end_time ?? ""}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="event_type">Event Type</Label>
                <Select
                  name="event_type"
                  defaultValue={event?.event_type ?? "jewish_general"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Age Range & Capacity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Age & Capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <Label htmlFor="enable_gendered_age" className="cursor-pointer text-sm">
                  Different age ranges for male/female
                </Label>
                <Switch
                  id="enable_gendered_age"
                  name="enable_gendered_age"
                  checked={genderedAge}
                  onCheckedChange={setGenderedAge}
                />
              </div>

              {genderedAge ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Male Age</Label>
                    <div className="flex gap-2">
                      <Input
                        name="age_min_male"
                        type="number"
                        placeholder="Min"
                        defaultValue={event?.age_min_male ?? ""}
                      />
                      <Input
                        name="age_max_male"
                        type="number"
                        placeholder="Max"
                        defaultValue={event?.age_max_male ?? ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Female Age</Label>
                    <div className="flex gap-2">
                      <Input
                        name="age_min_female"
                        type="number"
                        placeholder="Min"
                        defaultValue={event?.age_min_female ?? ""}
                      />
                      <Input
                        name="age_max_female"
                        type="number"
                        placeholder="Max"
                        defaultValue={event?.age_max_female ?? ""}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="age_min">Min Age</Label>
                    <Input
                      name="age_min"
                      type="number"
                      defaultValue={event?.age_min ?? ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age_max">Max Age</Label>
                    <Input
                      name="age_max"
                      type="number"
                      defaultValue={event?.age_max ?? ""}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="limit_male">Male Capacity</Label>
                  <Input
                    name="limit_male"
                    type="number"
                    defaultValue={event?.limit_male ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor="limit_female">Female Capacity</Label>
                  <Input
                    name="limit_female"
                    type="number"
                    defaultValue={event?.limit_female ?? ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Offers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Special Offers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="special_offer">Offer Type</Label>
                <Select
                  name="special_offer"
                  defaultValue={event?.special_offer ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="early_bird">Early Bird</SelectItem>
                    <SelectItem value="group_discount">Group Discount</SelectItem>
                    <SelectItem value="returning_customer">Returning Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="special_offer_value">Offer Value</Label>
                <Input
                  name="special_offer_value"
                  type="number"
                  step="0.01"
                  defaultValue={event?.special_offer_value ?? ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_published" className="cursor-pointer">Published</Label>
                <Switch
                  id="is_published"
                  name="is_published"
                  defaultChecked={event?.is_published ?? false}
                />
              </div>
              {event && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_cancelled" className="cursor-pointer text-destructive">Cancelled</Label>
                  <Switch
                    id="is_cancelled"
                    name="is_cancelled"
                    defaultChecked={event?.is_cancelled ?? false}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
