"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Users,
  RefreshCw,
  Unlock,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  getEventMatchStats,
  getEventMatchSubmissions,
  getEventMutualMatches,
  computeMatches,
  reopenUserSubmission,
  getAdminMatchQuestions,
  saveMatchQuestion,
  deleteMatchQuestion,
} from "@/lib/admin/actions";

export function MatchesTabContent({ eventId }: { eventId: number }) {
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [mutualMatches, setMutualMatches] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function loadData() {
    setLoading(true);
    const [statsData, subsData, matchesData, questionsData] = await Promise.all([
      getEventMatchStats(eventId),
      getEventMatchSubmissions(eventId),
      getEventMutualMatches(eventId),
      getAdminMatchQuestions(eventId),
    ]);
    setStats(statsData);
    setSubmissions(subsData);
    setMutualMatches(matchesData);
    setQuestions(questionsData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [eventId]);

  function handleComputeMatches() {
    startTransition(async () => {
      await computeMatches(eventId);
      await loadData();
    });
  }

  function handleReopenSubmission(userId: string) {
    startTransition(async () => {
      await reopenUserSubmission(eventId, userId);
      await loadData();
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard label="Attended" value={stats.totalParticipants} />
          <StatCard label="Submitted" value={stats.submitted} color="text-green-600" />
          <StatCard label="In Progress" value={stats.drafts} color="text-amber-600" />
          <StatCard label="Pending" value={stats.pending} color="text-muted-foreground" />
          <StatCard label="Date Matches" value={stats.mutualDates} color="text-pink-600" />
          <StatCard label="Friend Matches" value={stats.mutualFriends} color="text-blue-600" />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleComputeMatches} size="sm" disabled={isPending}>
          <RefreshCw className={`h-4 w-4 me-2 ${isPending ? "animate-spin" : ""}`} />
          Recompute Matches
        </Button>
      </div>

      {/* Mutual Matches */}
      {mutualMatches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mutual Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person A</TableHead>
                    <TableHead>Person B</TableHead>
                    <TableHead>Match Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mutualMatches.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">
                        {(m.user_a as any)?.first_name} {(m.user_a as any)?.last_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {(m.user_b as any)?.first_name} {(m.user_b as any)?.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            m.result_type === "mutual_date"
                              ? "border-pink-300 text-pink-700"
                              : "border-blue-300 text-blue-700"
                          }
                        >
                          {m.result_type === "mutual_date" ? (
                            <Heart className="h-3 w-3 me-1" />
                          ) : (
                            <Users className="h-3 w-3 me-1" />
                          )}
                          {m.result_type === "mutual_date" ? "Date" : "Friend"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Submissions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            All Submissions ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No submissions yet
            </p>
          ) : (
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Choice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell className="text-sm">
                        {(sub.scorer as any)?.first_name} {(sub.scorer as any)?.last_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {(sub.scored as any)?.first_name} {(sub.scored as any)?.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sub.choice === "no" ? "outline" : "default"}
                          className={
                            sub.choice === "date"
                              ? "bg-pink-600"
                              : sub.choice === "friend"
                              ? "bg-blue-600"
                              : ""
                          }
                        >
                          {sub.choice}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub.is_draft ? "outline" : "secondary"}>
                          {sub.is_draft ? "Draft" : "Submitted"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {sub.submitted_at
                          ? new Date(sub.submitted_at).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {!sub.is_draft && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            title="Reopen submission"
                            onClick={() => handleReopenSubmission(sub.scorer_id)}
                            disabled={isPending}
                          >
                            <Unlock className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Questions */}
      <MatchQuestionsSection
        eventId={eventId}
        questions={questions}
        onRefresh={loadData}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-4 pb-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${color ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── Match Questions Section ─────────────────────────────────

function MatchQuestionsSection({
  eventId,
  questions,
  onRefresh,
}: {
  eventId: number;
  questions: any[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const globalQuestions = questions.filter((q) => q.event_id === null);
  const eventQuestions = questions.filter((q) => q.event_id === eventId);

  function handleEdit(q: any) {
    setEditing(q);
    setShowForm(true);
  }

  function handleAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteMatchQuestion(id);
      onRefresh();
    });
  }

  async function handleSave(data: any) {
    const result = await saveMatchQuestion(data);
    if (!result.error) {
      setShowForm(false);
      setEditing(null);
      onRefresh();
    }
    return result;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Match Questions</CardTitle>
          <Button size="sm" variant="outline" onClick={handleAdd}>
            <Plus className="h-4 w-4 me-1" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Global defaults */}
        {globalQuestions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Global Defaults
            </p>
            <div className="space-y-2">
              {globalQuestions.map((q) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  onEdit={() => handleEdit(q)}
                  onDelete={() => handleDelete(q.id)}
                  isPending={isPending}
                />
              ))}
            </div>
          </div>
        )}

        {/* Event-specific */}
        {eventQuestions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Event-Specific Questions
            </p>
            <div className="space-y-2">
              {eventQuestions.map((q) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  onEdit={() => handleEdit(q)}
                  onDelete={() => handleDelete(q.id)}
                  isPending={isPending}
                />
              ))}
            </div>
          </div>
        )}

        {globalQuestions.length === 0 && eventQuestions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No questions configured. Add questions to collect feedback during matching.
          </p>
        )}
      </CardContent>

      {showForm && (
        <QuestionFormDialog
          eventId={eventId}
          question={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </Card>
  );
}

function QuestionRow({
  question,
  onEdit,
  onDelete,
  isPending,
}: {
  question: any;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{question.question_text}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-xs">
            {question.question_type.replace("_", " ")}
          </Badge>
          {question.is_required && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
          {!question.is_active && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Inactive
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 ms-2">
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-destructive"
          onClick={onDelete}
          disabled={isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function QuestionFormDialog({
  eventId,
  question,
  onSave,
  onClose,
}: {
  eventId: number;
  question: any | null;
  onSave: (data: any) => Promise<any>;
  onClose: () => void;
}) {
  const [text, setText] = useState(question?.question_text ?? "");
  const [type, setType] = useState(question?.question_type ?? "yes_no");
  const [options, setOptions] = useState<string>(
    question?.options ? (question.options as string[]).join(", ") : ""
  );
  const [required, setRequired] = useState(question?.is_required ?? true);
  const [active, setActive] = useState(question?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(question?.sort_order ?? 0);
  const [scope, setScope] = useState<"global" | "event">(
    question ? (question.event_id === null ? "global" : "event") : "event"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!text.trim()) {
      setError("Question text is required");
      return;
    }
    setSaving(true);
    setError(null);

    const parsedOptions =
      type === "multiple_choice" && options.trim()
        ? options.split(",").map((o) => o.trim()).filter(Boolean)
        : null;

    const result = await onSave({
      id: question?.id,
      event_id: scope === "global" ? null : eventId,
      question_text: text.trim(),
      question_type: type,
      options: parsedOptions,
      is_required: required,
      sort_order: sortOrder,
      is_active: active,
    });

    setSaving(false);
    if (result.error) setError(result.error);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {question ? "Edit Question" : "Add Question"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label>Question Text</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Would you like to see this person again?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Yes / No</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="rating">Rating (1-10)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">This Event Only</SelectItem>
                  <SelectItem value="global">All Events (Global)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "multiple_choice" && (
            <div className="space-y-2">
              <Label>Options (comma-separated)</Label>
              <Input
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option A, Option B, Option C"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="required" checked={required} onCheckedChange={setRequired} />
              <Label htmlFor="required">Required</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="active" checked={active} onCheckedChange={setActive} />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Question"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
