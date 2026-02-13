"use client";

import { useState, useTransition } from "react";
import {
  saveMatchmakingPackage,
  deleteMatchmakingPackage,
} from "@/lib/admin/actions";
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
import { Plus, Pencil, Trash2, Calendar, Users, CreditCard } from "lucide-react";

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

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
}

export function MatchmakingPackagesPanel({
  packages,
  countries,
}: {
  packages: Package[];
  countries: Country[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(pkg: Package) {
    setEditing(pkg);
    setDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Matchmaking Packages</CardTitle>
          <Button variant="outline" size="sm" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" />
            Add Package
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {packages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No packages yet. Click &ldquo;Add Package&rdquo; to create one.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative border rounded-xl p-5 ${
                  !pkg.is_active ? "opacity-50" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{pkg.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pkg.countries?.name ?? pkg.countries?.code?.toUpperCase()}
                      </p>
                    </div>
                    <Badge
                      variant={pkg.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <p className="text-2xl font-bold">
                    {pkg.currency} {pkg.price.toLocaleString()}
                  </p>

                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {pkg.num_dates} {pkg.num_dates === 1 ? "date" : "dates"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {pkg.duration_months}{" "}
                      {pkg.duration_months === 1 ? "month" : "months"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => openEdit(pkg)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <DeletePackageButton id={pkg.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="ltr" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Package" : "New Package"}
            </DialogTitle>
          </DialogHeader>
          <PackageForm
            pkg={editing}
            countries={countries}
            onDone={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ─── Package form (inside dialog) ───────────────────── */

function PackageForm({
  pkg,
  countries,
  onDone,
}: {
  pkg: Package | null;
  countries: Country[];
  onDone: () => void;
}) {
  const isNew = pkg === null;
  const [isActive, setIsActive] = useState(pkg?.is_active ?? true);
  const [countryId, setCountryId] = useState(
    pkg ? String(pkg.country_id) : "",
  );
  const [currency, setCurrency] = useState(pkg?.currency ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCountryChange(val: string) {
    setCountryId(val);
    const c = countries.find((c) => String(c.id) === val);
    if (c) setCurrency(c.currency);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("is_active", isActive ? "true" : "false");
    formData.set("country_id", countryId);
    formData.set("currency", currency);
    if (pkg) formData.set("id", String(pkg.id));

    startTransition(async () => {
      const result = await saveMatchmakingPackage(formData);
      if (result.success) {
        toast.success(isNew ? "Package created" : "Package updated");
        onDone();
      } else {
        setError(result.error ?? "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <Label>Name</Label>
        <Input
          name="name"
          required
          defaultValue={pkg?.name ?? ""}
          placeholder="e.g. 6 Months membership including 5 dates"
        />
      </div>

      <div>
        <Label>Country</Label>
        <Select value={countryId} onValueChange={handleCountryChange}>
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

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Price ({currency || "..."})</Label>
          <Input
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={pkg?.price ?? ""}
          />
        </div>
        <div>
          <Label>Dates Included</Label>
          <Input
            name="num_dates"
            type="number"
            min={1}
            required
            defaultValue={pkg?.num_dates ?? ""}
          />
        </div>
        <div>
          <Label>Duration (mo.)</Label>
          <Input
            name="duration_months"
            type="number"
            min={1}
            required
            defaultValue={pkg?.duration_months ?? ""}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id={`pkg-active-${pkg?.id ?? "new"}`}
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor={`pkg-active-${pkg?.id ?? "new"}`}>Active</Label>
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

function DeletePackageButton({ id }: { id: number }) {
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
          <AlertDialogTitle>Delete package?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this matchmaking package.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              startTransition(async () => {
                await deleteMatchmakingPackage(id);
                toast.success("Package deleted");
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
