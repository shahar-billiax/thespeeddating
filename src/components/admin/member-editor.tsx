"use client";

import { useActionState, useState } from "react";
import { updateMember } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MemberEditor({
  member,
  countries,
  cities,
}: {
  member: any;
  countries: { id: number; name: string; code: string }[];
  cities: { id: number; name: string; country_id: number }[];
}) {
  const [countryId, setCountryId] = useState(
    member.country_id ? String(member.country_id) : ""
  );

  const filteredCities = countryId
    ? cities.filter((c) => c.country_id === Number(countryId))
    : cities;

  async function handleSubmit(_prev: any, formData: FormData) {
    return await updateMember(member.id, formData);
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-100 p-3 rounded">
          Member updated successfully
        </p>
      )}

      <Card>
        <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input name="first_name" defaultValue={member.first_name} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input name="last_name" defaultValue={member.last_name} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={member.email} disabled />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" defaultValue={member.phone ?? ""} />
            </div>
            <div>
              <Label>DOB</Label>
              <Input value={member.date_of_birth} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Occupation</Label>
              <Input name="occupation" defaultValue={member.occupation ?? ""} />
            </div>
            <div>
              <Label>Education</Label>
              <Input name="education" defaultValue={member.education ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Relationship Status</Label>
              <Input name="relationship_status" defaultValue={member.relationship_status ?? ""} />
            </div>
            <div>
              <Label>Faith</Label>
              <Input name="faith" defaultValue={member.faith ?? ""} />
            </div>
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea name="bio" rows={3} defaultValue={member.bio ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Location & Role</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Country</Label>
              <Select name="country_id" value={countryId} onValueChange={setCountryId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>City</Label>
              <Select name="city_id" defaultValue={member.city_id ? String(member.city_id) : ""}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {filteredCities.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Role</Label>
            <Select name="role" defaultValue={member.role}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="host">Host</SelectItem>
                <SelectItem value="host_plus">Host Plus</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="is_active" name="is_active" defaultChecked={member.is_active} />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Admin Comments</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            name="admin_comments"
            rows={4}
            defaultValue={member.admin_comments ?? ""}
            placeholder="Internal notes about this member..."
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : "Update Member"}
      </Button>
    </form>
  );
}
