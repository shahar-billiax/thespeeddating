"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { saveVipBenefit, deleteVipBenefit } from "@/lib/admin/actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Plus, Pencil, Trash2, X,
  Percent, Heart, Eye, Gift, Star, Shield, Crown, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Percent, Heart, Eye, Gift, Star, Shield, Crown, Zap,
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

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
}

export function VipBenefitsPanel({
  benefits,
  country,
  languageCode,
}: {
  benefits: Benefit[];
  country: Country;
  languageCode: string;
}) {
  const [editing, setEditing] = useState<Benefit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [icon, setIcon] = useState("Gift");

  async function handleSave(_prev: any, formData: FormData) {
    formData.set("is_active", isActive ? "true" : "false");
    formData.set("country_id", String(country.id));
    formData.set("language_code", languageCode);
    formData.set("icon", icon);
    if (editing) formData.set("id", String(editing.id));
    const result = await saveVipBenefit(formData);
    if (result.success) {
      setShowForm(false);
      setEditing(null);
    }
    return result;
  }

  const [state, formAction, isPending] = useActionState(handleSave, null);
  const prevState = useRef(state);

  useEffect(() => {
    if (state && state !== prevState.current) {
      if (state.success) {
        toast.success(editing ? "Benefit updated" : "Benefit created");
      }
      prevState.current = state;
    }
  }, [state, editing]);

  function startEdit(benefit: Benefit) {
    setEditing(benefit);
    setIsActive(benefit.is_active);
    setIcon(benefit.icon);
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setIsActive(true);
    setIcon("Gift");
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    await deleteVipBenefit(id);
  }

  const SelectedIcon = ICON_MAP[icon] ?? Gift;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Benefits</CardTitle>
          {!showForm && (
            <Button variant="outline" size="sm" onClick={startNew}>
              <Plus className="h-4 w-4 mr-1" />
              Add Benefit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form action={formAction} className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {editing ? "Edit Benefit" : "New Benefit"}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setShowForm(false); setEditing(null); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <div className="grid grid-cols-[auto_1fr] gap-3 items-end">
              <div>
                <Label className="text-xs">Icon</Label>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 flex items-center justify-center rounded border bg-background">
                    <SelectedIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((name) => {
                        const Icon = ICON_MAP[name];
                        return (
                          <SelectItem key={name} value={name}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {name}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  name="title"
                  required
                  defaultValue={editing?.title ?? ""}
                  placeholder="e.g. Discounted Event Tickets"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Description</Label>
              <Input
                name="description"
                required
                defaultValue={editing?.description ?? ""}
                placeholder="Brief description of the benefit"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Sort Order</Label>
                <Input
                  name="sort_order"
                  type="number"
                  min={0}
                  defaultValue={editing?.sort_order ?? 0}
                />
              </div>
              <div className="flex items-end gap-4 pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id="benefit-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="benefit-active" className="text-sm">Active</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        )}

        {benefits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No benefits yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Description</TableHead>
                <TableHead className="w-16">Order</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {benefits.map((benefit) => {
                const Icon = ICON_MAP[benefit.icon] ?? Gift;
                return (
                  <TableRow key={benefit.id}>
                    <TableCell>
                      <div className="h-8 w-8 flex items-center justify-center rounded bg-yellow-500/10">
                        <Icon className="h-4 w-4 text-yellow-600" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{benefit.title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                      {benefit.description}
                    </TableCell>
                    <TableCell className="text-sm">{benefit.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={benefit.is_active ? "default" : "secondary"} className="text-xs">
                        {benefit.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(benefit)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this benefit.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(benefit.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
