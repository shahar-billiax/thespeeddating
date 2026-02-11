"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { saveMatchmakingPackage, deleteMatchmakingPackage } from "@/lib/admin/actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Package {
  id: number;
  name: string;
  price: number;
  currency: string;
  num_dates: number;
  duration_months: number;
  country_id: number;
  is_active: boolean;
  countries?: { name: string; code: string };
}

export function MatchmakingPackagesPanel({
  packages,
  countries,
}: {
  packages: Package[];
  countries: { id: number; name: string; code: string; currency: string }[];
}) {
  const [editing, setEditing] = useState<Package | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isActive, setIsActive] = useState(true);

  async function handleSave(_prev: any, formData: FormData) {
    formData.set("is_active", isActive ? "true" : "false");
    if (editing) formData.set("id", String(editing.id));
    const result = await saveMatchmakingPackage(formData);
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
        toast.success(editing ? "Package updated" : "Package created");
      }
      prevState.current = state;
    }
  }, [state, editing]);

  function startEdit(pkg: Package) {
    setEditing(pkg);
    setIsActive(pkg.is_active);
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setIsActive(true);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    await deleteMatchmakingPackage(id);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Matchmaking Packages</CardTitle>
          {!showForm && (
            <Button variant="outline" size="sm" onClick={startNew}>
              <Plus className="h-4 w-4 mr-1" />
              Add Package
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form action={formAction} className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {editing ? "Edit Package" : "New Package"}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  name="name"
                  required
                  defaultValue={editing?.name ?? ""}
                  placeholder="e.g. 6 Months"
                />
              </div>
              <div>
                <Label className="text-xs">Country</Label>
                <Select
                  name="country_id"
                  defaultValue={editing ? String(editing.country_id) : ""}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Price</Label>
                <Input
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  defaultValue={editing?.price ?? ""}
                />
              </div>
              <div>
                <Label className="text-xs">Currency</Label>
                <Input
                  name="currency"
                  required
                  defaultValue={editing?.currency ?? "GBP"}
                  placeholder="GBP"
                />
              </div>
              <div>
                <Label className="text-xs">Dates Included</Label>
                <Input
                  name="num_dates"
                  type="number"
                  min={1}
                  required
                  defaultValue={editing?.num_dates ?? ""}
                />
              </div>
              <div>
                <Label className="text-xs">Duration (months)</Label>
                <Input
                  name="duration_months"
                  type="number"
                  min={1}
                  required
                  defaultValue={editing?.duration_months ?? ""}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="pkg-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="pkg-active" className="text-sm">
                  Active
                </Label>
              </div>
              <div className="ml-auto">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {packages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No packages yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Months</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.countries?.code?.toUpperCase()}</TableCell>
                  <TableCell>
                    {pkg.currency} {pkg.price}
                  </TableCell>
                  <TableCell>{pkg.num_dates}</TableCell>
                  <TableCell>{pkg.duration_months}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(pkg)}
                      >
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
                              This action cannot be undone. This will permanently delete this matchmaking package.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(pkg.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
