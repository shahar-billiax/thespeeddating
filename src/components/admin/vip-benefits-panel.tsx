"use client";

import { useState, useTransition } from "react";
import { saveVipBenefit, deleteVipBenefit } from "@/lib/admin/actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Percent,
  Heart,
  Eye,
  Gift,
  Star,
  Shield,
  Crown,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Percent,
  Heart,
  Eye,
  Gift,
  Star,
  Shield,
  Crown,
  Zap,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

interface Benefit {
  id: number;
  country_id: number;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export function VipBenefitsPanel({
  benefits,
  countryId,
  languageCode,
}: {
  benefits: Benefit[];
  countryId: number;
  languageCode: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Benefit | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(benefit: Benefit) {
    setEditing(benefit);
    setDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Benefits</CardTitle>
          <Button variant="outline" size="sm" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" />
            Add Benefit
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Benefits are shared across all countries. Switch language above to
          edit translations.
        </p>
      </CardHeader>
      <CardContent>
        {benefits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No benefits for this language yet. Click &ldquo;Add Benefit&rdquo;
            to create one.
          </p>
        ) : (
          <div className="space-y-2">
            {benefits.map((benefit) => {
              const Icon = ICON_MAP[benefit.icon] ?? Gift;
              return (
                <div
                  key={benefit.id}
                  className={`flex items-center gap-4 rounded-lg border p-3 ${
                    !benefit.is_active ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                    <Icon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{benefit.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {benefit.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={benefit.is_active ? "default" : "secondary"}
                      className="text-xs hidden sm:inline-flex"
                    >
                      {benefit.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openEdit(benefit)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteBenefitButton id={benefit.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="ltr" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Benefit" : "New Benefit"}
            </DialogTitle>
          </DialogHeader>
          <BenefitForm
            benefit={editing}
            countryId={countryId}
            languageCode={languageCode}
            onDone={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ─── Benefit form (inside dialog) ───────────────────── */

function BenefitForm({
  benefit,
  countryId,
  languageCode,
  onDone,
}: {
  benefit: Benefit | null;
  countryId: number;
  languageCode: string;
  onDone: () => void;
}) {
  const isNew = benefit === null;
  const [icon, setIcon] = useState(benefit?.icon ?? "Gift");
  const [isActive, setIsActive] = useState(benefit?.is_active ?? true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const SelectedIcon = ICON_MAP[icon] ?? Gift;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("is_active", isActive ? "true" : "false");
    formData.set("country_id", String(benefit?.country_id ?? countryId));
    formData.set("language_code", languageCode);
    formData.set("icon", icon);
    if (benefit) formData.set("id", String(benefit.id));

    startTransition(async () => {
      const result = await saveVipBenefit(formData);
      if (result.success) {
        toast.success(isNew ? "Benefit created" : "Benefit updated");
        onDone();
      } else {
        setError(result.error ?? "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-end gap-3">
        <div>
          <Label>Icon</Label>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-yellow-500/10">
              <SelectedIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((name) => {
                  const Ic = ICON_MAP[name];
                  return (
                    <SelectItem key={name} value={name}>
                      <span className="flex items-center gap-2">
                        <Ic className="h-4 w-4" />
                        {name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1">
          <Label>Title</Label>
          <Input
            name="title"
            required
            defaultValue={benefit?.title ?? ""}
            placeholder="e.g. Discounted Event Tickets"
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Input
          name="description"
          required
          defaultValue={benefit?.description ?? ""}
          placeholder="Brief description of the benefit"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <Label>Sort Order</Label>
          <Input
            name="sort_order"
            type="number"
            min={0}
            defaultValue={benefit?.sort_order ?? 0}
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Switch
            id={`benefit-active-${benefit?.id ?? "new"}`}
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor={`benefit-active-${benefit?.id ?? "new"}`}>
            Active
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isNew ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}

/* ─── Delete button ──────────────────────────────────── */

function DeleteBenefitButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive"
          disabled={isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="ltr">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete benefit?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this benefit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              startTransition(async () => {
                await deleteVipBenefit(id);
                toast.success("Benefit deleted");
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
