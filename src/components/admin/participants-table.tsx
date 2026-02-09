"use client";

import { useState } from "react";
import { updateParticipant, exportParticipantsCsv } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Download } from "lucide-react";

export function ParticipantsTable({
  participants,
  eventId,
}: {
  participants: any[];
  eventId: number;
}) {
  const [updating, setUpdating] = useState<number | null>(null);

  async function toggleAttended(regId: number, current: boolean | null) {
    setUpdating(regId);
    await updateParticipant(regId, { attended: !current });
    setUpdating(null);
  }

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

  if (participants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No participants</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>
      <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attended</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((p: any) => {
            const profile = p.profiles;
            const age = profile?.date_of_birth
              ? Math.floor(
                  (Date.now() - new Date(profile.date_of_birth).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                )
              : null;

            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {profile?.first_name} {profile?.last_name}
                </TableCell>
                <TableCell className="text-sm">{profile?.email}</TableCell>
                <TableCell>{age ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.status === "confirmed"
                        ? "default"
                        : p.status === "waitlisted"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={updating === p.id}
                    onClick={() => toggleAttended(p.id, p.attended)}
                  >
                    {p.attended ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
