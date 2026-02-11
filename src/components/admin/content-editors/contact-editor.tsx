"use client";

import { useState } from "react";
import type { ContactContent } from "@/lib/admin/content-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

const DEFAULT_CONTACT: ContactContent = {
  openingHours: [],
  phone: "",
  email: "",
};

export function ContactEditor({
  value,
  onChange,
}: {
  value: ContactContent | null;
  onChange: (data: ContactContent) => void;
}) {
  const [data, setData] = useState<ContactContent>(value ?? DEFAULT_CONTACT);

  function update(partial: Partial<ContactContent>) {
    const next = { ...data, ...partial };
    setData(next);
    onChange(next);
  }

  function updateHours(index: number, field: string, val: string) {
    const openingHours = [...data.openingHours];
    openingHours[index] = { ...openingHours[index], [field]: val };
    update({ openingHours });
  }

  function addHours() {
    update({
      openingHours: [...data.openingHours, { days: "", hours: "" }],
    });
  }

  function removeHours(index: number) {
    update({
      openingHours: data.openingHours.filter((_, i) => i !== index),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Phone Number</Label>
            <Input
              value={data.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="e.g. 07950 272 671"
            />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="e.g. info@TheSpeedDating.co.uk"
            />
          </div>
        </div>

        {/* Opening hours */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Opening Hours</Label>
            <Button type="button" variant="outline" size="sm" onClick={addHours}>
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
          </div>

          {data.openingHours.map((row, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 border rounded-lg bg-muted/20"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div>
                  <Label className="text-xs">Days</Label>
                  <Input
                    value={row.days}
                    onChange={(e) => updateHours(i, "days", e.target.value)}
                    placeholder="e.g. Monday - Friday"
                  />
                </div>
                <div>
                  <Label className="text-xs">Hours</Label>
                  <Input
                    value={row.hours}
                    onChange={(e) => updateHours(i, "hours", e.target.value)}
                    placeholder="e.g. 9:30am - 7:00pm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Note (optional)</Label>
                  <Input
                    value={row.note ?? ""}
                    onChange={(e) => updateHours(i, "note", e.target.value)}
                    placeholder="e.g. Tickets booking only"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive mt-5"
                onClick={() => removeHours(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {data.openingHours.length === 0 && (
            <p className="text-sm text-muted-foreground p-3 border border-dashed rounded-lg text-center">
              No opening hours. Click &quot;Add Row&quot; to create one.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
