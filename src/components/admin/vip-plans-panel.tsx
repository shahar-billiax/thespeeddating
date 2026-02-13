"use client";

import { useState, useTransition } from "react";
import { saveVipPlan, deleteVipPlan } from "@/lib/admin/actions";
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
import { Plus, Pencil, Trash2 } from "lucide-react";

const LABELS: Record<string, Record<string, string>> = {
  en: {
    month: "Month",
    months: "Months",
    per_month: "/month",
    total: "total",
    best_value: "Best Value",
    popular: "Popular",
  },
  he: {
    month: "חודש",
    months: "חודשים",
    per_month: "/חודש",
    total: 'סה"כ',
    best_value: "הכי משתלם",
    popular: "פופולרי",
  },
};

interface Plan {
  id: number;
  country_id: number;
  months: number;
  price_per_month: number;
  total_price: number;
  currency: string;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
}

export function VipPlansPanel({
  plans,
  country,
  languageCode,
}: {
  plans: Plan[];
  country: Country;
  languageCode: string;
}) {
  const l = LABELS[languageCode] ?? LABELS.en;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(country.code === "gb" ? "en-GB" : "he-IL", {
      style: "currency",
      currency: country.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pricing Plans</CardTitle>
          <Button variant="outline" size="sm" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" />
            Add Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No plans yet. Click &ldquo;Add Plan&rdquo; to create one.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const badgeText =
                plan.badge === "best_value"
                  ? l.best_value
                  : plan.badge === "popular"
                    ? l.popular
                    : null;

              return (
                <div
                  key={plan.id}
                  className={`relative border rounded-xl p-5 ${
                    !plan.is_active ? "opacity-50" : ""
                  } ${
                    plan.badge === "best_value"
                      ? "border-yellow-500 ring-1 ring-yellow-500/30"
                      : plan.badge === "popular"
                        ? "border-primary ring-1 ring-primary/30"
                        : ""
                  }`}
                >
                  {/* Badge */}
                  {badgeText && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                      <Badge
                        className={
                          plan.badge === "best_value"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                            : "bg-primary text-xs"
                        }
                      >
                        {badgeText}
                      </Badge>
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-center pt-2 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {plan.months}{" "}
                      {plan.months === 1 ? l.month : l.months}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPrice(plan.price_per_month)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {l.per_month}
                    </p>
                    {plan.months > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(plan.total_price)} {l.total}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge
                      variant={plan.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openEdit(plan)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <DeletePlanButton id={plan.id} />
                    </div>
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
              {editing ? "Edit Plan" : "New Plan"}
            </DialogTitle>
          </DialogHeader>
          <PlanForm
            plan={editing}
            country={country}
            onDone={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ─── Plan form (inside dialog) ──────────────────────── */

function PlanForm({
  plan,
  country,
  onDone,
}: {
  plan: Plan | null;
  country: Country;
  onDone: () => void;
}) {
  const isNew = plan === null;
  const [months, setMonths] = useState(plan ? String(plan.months) : "");
  const [pricePerMonth, setPricePerMonth] = useState(
    plan ? String(plan.price_per_month) : "",
  );
  const [totalPrice, setTotalPrice] = useState(
    plan ? String(plan.total_price) : "",
  );
  const [badge, setBadge] = useState(plan?.badge ?? "none");
  const [sortOrder, setSortOrder] = useState(
    plan ? String(plan.sort_order) : "0",
  );
  const [isActive, setIsActive] = useState(plan?.is_active ?? true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleMonthsChange(val: string) {
    setMonths(val);
    if (pricePerMonth && val) {
      setTotalPrice(String((Number(pricePerMonth) * Number(val)).toFixed(2)));
    }
  }

  function handlePriceChange(val: string) {
    setPricePerMonth(val);
    if (months && val) {
      setTotalPrice(String((Number(val) * Number(months)).toFixed(2)));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("is_active", isActive ? "true" : "false");
    formData.set("country_id", String(country.id));
    formData.set("currency", country.currency);
    formData.set("badge", badge === "none" ? "" : badge);
    if (plan) formData.set("id", String(plan.id));
    // Ensure total_price is set for single-month plans
    if (Number(months) <= 1) {
      formData.set("total_price", pricePerMonth || "0");
    }

    startTransition(async () => {
      const result = await saveVipPlan(formData);
      if (result.success) {
        toast.success(isNew ? "Plan created" : "Plan updated");
        onDone();
      } else {
        setError(result.error ?? "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Months</Label>
          <Input
            name="months"
            type="number"
            min={1}
            required
            value={months}
            onChange={(e) => handleMonthsChange(e.target.value)}
          />
        </div>
        <div>
          <Label>Price / Month ({country.currency})</Label>
          <Input
            name="price_per_month"
            type="number"
            min={0}
            step="0.01"
            required
            value={pricePerMonth}
            onChange={(e) => handlePriceChange(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Total Price ({country.currency})</Label>
          <Input
            name="total_price"
            type="number"
            min={0}
            step="0.01"
            required
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
          />
        </div>
        <div>
          <Label>Sort Order</Label>
          <Input
            name="sort_order"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <Label>Badge</Label>
          <Select value={badge} onValueChange={setBadge}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="best_value">Best Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Switch
            id={`plan-active-${plan?.id ?? "new"}`}
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor={`plan-active-${plan?.id ?? "new"}`}>Active</Label>
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

function DeletePlanButton({ id }: { id: number }) {
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
          <AlertDialogTitle>Delete plan?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this pricing plan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              startTransition(async () => {
                await deleteVipPlan(id);
                toast.success("Plan deleted");
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
