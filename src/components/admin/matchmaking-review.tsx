"use client";

import { useState } from "react";
import { updateMatchmakingProfile } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";

export function MatchmakingReview({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(profile.status);
  const [notes, setNotes] = useState(profile.admin_notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateMatchmakingProfile(profile.id, {
      status,
      admin_notes: notes,
    });
    setSaving(false);
    setOpen(false);
  }

  const questionnaire = profile.questionnaire_data as Record<string, string> | null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {profile.profiles?.first_name} {profile.profiles?.last_name}
          </DialogTitle>
        </DialogHeader>

        {questionnaire && (
          <div className="space-y-2 bg-muted/50 p-3 rounded text-sm">
            {Object.entries(questionnaire).map(([key, val]) => (
              <div key={key}>
                <span className="font-medium capitalize">
                  {key.replace(/_/g, " ")}:
                </span>{" "}
                {val}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Admin Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
