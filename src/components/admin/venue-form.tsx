"use client";

import { useActionState, useState } from "react";
import { createVenue, updateVenue } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminCountry } from "@/lib/admin-country-context";
import { AlertTriangle } from "lucide-react";

export function VenueForm({
  venue,
  countries,
  cities,
  defaultCountryId,
}: {
  venue?: any;
  countries: { id: number; name: string; code: string }[];
  cities: { id: number; name: string; country_id: number }[];
  defaultCountryId?: number;
}) {
  const [countryId, setCountryId] = useState(
    venue?.country_id
      ? String(venue.country_id)
      : defaultCountryId
        ? String(defaultCountryId)
        : ""
  );

  const filteredCities = countryId
    ? cities.filter((c) => c.country_id === Number(countryId))
    : cities;

  async function handleSubmit(_prev: any, formData: FormData) {
    if (venue) return await updateVenue(venue.id, formData);
    return await createVenue(formData);
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);
  const { countryId: adminCountryId } = useAdminCountry();
  const entityCountryId = venue?.country_id;
  const isCrossCountry = venue && entityCountryId && entityCountryId !== adminCountryId;
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
            This venue belongs to <strong>{entityCountryName}</strong>, but you are
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
        <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Venue Name</Label>
            <Input name="name" required defaultValue={venue?.name ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Country</Label>
              <Select name="country_id" value={countryId} onValueChange={setCountryId}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>City</Label>
              <Select name="city_id" defaultValue={venue?.city_id ? String(venue.city_id) : ""}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {filteredCities.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input name="address" defaultValue={venue?.address ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input name="phone" defaultValue={venue?.phone ?? ""} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input name="website" defaultValue={venue?.website ?? ""} />
            </div>
          </div>

          <div>
            <Label htmlFor="venue_type">Venue Type</Label>
            <Input name="venue_type" defaultValue={venue?.venue_type ?? ""} placeholder="e.g. bar, restaurant, hotel" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" rows={3} defaultValue={venue?.description ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dress_code">Dress Code</Label>
              <Input name="dress_code" defaultValue={venue?.dress_code ?? ""} />
            </div>
            <div>
              <Label htmlFor="transport_info">Transport Info</Label>
              <Input name="transport_info" defaultValue={venue?.transport_info ?? ""} />
            </div>
          </div>

          <div>
            <Label htmlFor="map_url">Map URL</Label>
            <Input name="map_url" defaultValue={venue?.map_url ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input name="latitude" type="number" step="any" defaultValue={venue?.latitude ?? ""} />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input name="longitude" type="number" step="any" defaultValue={venue?.longitude ?? ""} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Internal Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contact_person_name">Contact Name</Label>
              <Input name="contact_person_name" defaultValue={venue?.contact_person_name ?? ""} />
            </div>
            <div>
              <Label htmlFor="contact_person_email">Contact Email</Label>
              <Input name="contact_person_email" type="email" defaultValue={venue?.contact_person_email ?? ""} />
            </div>
            <div>
              <Label htmlFor="contact_person_phone">Contact Phone</Label>
              <Input name="contact_person_phone" defaultValue={venue?.contact_person_phone ?? ""} />
            </div>
          </div>
          <div>
            <Label htmlFor="internal_notes">Internal Notes</Label>
            <Textarea name="internal_notes" rows={3} defaultValue={venue?.internal_notes ?? ""} />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="is_active" name="is_active" defaultChecked={venue?.is_active ?? true} />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : venue ? "Update Venue" : "Create Venue"}
      </Button>
    </form>
  );
}
