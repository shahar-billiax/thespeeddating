"use client";

import { useActionState, useState } from "react";
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
import { useAdminCountry } from "@/lib/admin-country-context";
import { AlertTriangle } from "lucide-react";

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

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {isCrossCountry && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            This event belongs to <strong>{entityCountryName}</strong>, but you are
            currently managing <strong>{adminCountryName}</strong>. Changes will
            affect the {entityCountryName} site.
          </span>
        </div>
      )}
      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          {state.error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              placeholder="Venue ID"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="event_date">Date</Label>
              <Input
                name="event_date"
                type="date"
                required
                defaultValue={event?.event_date ?? ""}
              />
            </div>
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              rows={4}
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

      <Card>
        <CardHeader>
          <CardTitle>Pricing {currency && `(${currency})`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input name="currency" type="hidden" value={currency} />
          <div className="flex items-center gap-2">
            <Switch
              id="enable_gendered_price"
              name="enable_gendered_price"
              checked={genderedPrice}
              onCheckedChange={setGenderedPrice}
            />
            <Label htmlFor="enable_gendered_price">
              Different prices for male/female
            </Label>
          </div>

          {genderedPrice ? (
            <div className="grid grid-cols-2 gap-4">
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

          <div>
            <Label htmlFor="vip_price">VIP Price</Label>
            <Input
              name="vip_price"
              type="number"
              step="0.01"
              defaultValue={event?.vip_price ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="special_offer">Special Offer</Label>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Age Range & Capacity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              id="enable_gendered_age"
              name="enable_gendered_age"
              checked={genderedAge}
              onCheckedChange={setGenderedAge}
            />
            <Label htmlFor="enable_gendered_age">
              Different age ranges for male/female
            </Label>
          </div>

          {genderedAge ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Male Age</Label>
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
              <div className="space-y-2">
                <Label>Female Age</Label>
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
            <div className="flex gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              id="is_published"
              name="is_published"
              defaultChecked={event?.is_published ?? false}
            />
            <Label htmlFor="is_published">Published</Label>
          </div>
          {event && (
            <div className="flex items-center gap-2">
              <Switch
                id="is_cancelled"
                name="is_cancelled"
                defaultChecked={event?.is_cancelled ?? false}
              />
              <Label htmlFor="is_cancelled">Cancelled</Label>
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending
          ? "Saving..."
          : event
            ? "Update Event"
            : "Create Event"}
      </Button>
    </form>
  );
}
