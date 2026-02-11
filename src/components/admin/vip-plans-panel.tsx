"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { saveVipPlan, deleteVipPlan } from "@/lib/admin/actions";
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
}: {
  plans: Plan[];
  country: Country;
}) {
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [months, setMonths] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [badge, setBadge] = useState("none");

  async function handleSave(_prev: any, formData: FormData) {
    formData.set("is_active", isActive ? "true" : "false");
    formData.set("country_id", String(country.id));
    formData.set("currency", country.currency);
    formData.set("badge", badge === "none" ? "" : badge);
    if (editing) formData.set("id", String(editing.id));
    const result = await saveVipPlan(formData);
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
        toast.success(editing ? "Plan updated" : "Plan created");
      }
      prevState.current = state;
    }
  }, [state, editing]);

  function startEdit(plan: Plan) {
    setEditing(plan);
    setIsActive(plan.is_active);
    setMonths(String(plan.months));
    setPricePerMonth(String(plan.price_per_month));
    setTotalPrice(String(plan.total_price));
    setBadge(plan.badge ?? "none");
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setIsActive(true);
    setMonths("");
    setPricePerMonth("");
    setTotalPrice("");
    setBadge("none");
    setShowForm(true);
  }

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

  async function handleDelete(id: number) {
    await deleteVipPlan(id);
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(country.code === "gb" ? "en-GB" : "he-IL", {
      style: "currency",
      currency: country.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pricing Plans</CardTitle>
          {!showForm && (
            <Button variant="outline" size="sm" onClick={startNew}>
              <Plus className="h-4 w-4 mr-1" />
              Add Plan
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form action={formAction} className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {editing ? "Edit Plan" : "New Plan"}
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Months</Label>
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
                <Label className="text-xs">Price / Month ({country.currency})</Label>
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
              <div>
                <Label className="text-xs">Total Price ({country.currency})</Label>
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
                <Label className="text-xs">Sort Order</Label>
                <Input
                  name="sort_order"
                  type="number"
                  min={0}
                  defaultValue={editing?.sort_order ?? 0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Badge</Label>
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
              <div className="flex items-end gap-4 pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id="plan-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="plan-active" className="text-sm">Active</Label>
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

        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No plans yet
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-4 ${
                  !plan.is_active ? "opacity-60" : ""
                } ${
                  plan.badge === "best_value"
                    ? "border-yellow-500 ring-1 ring-yellow-500/30"
                    : plan.badge === "popular"
                      ? "border-primary ring-1 ring-primary/30"
                      : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge
                      className={
                        plan.badge === "best_value"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                          : "bg-primary text-xs"
                      }
                    >
                      {plan.badge === "best_value" ? "Best Value" : "Popular"}
                    </Badge>
                  </div>
                )}

                <div className="text-center pt-2 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {plan.months} {plan.months === 1 ? "Month" : "Months"}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(plan.price_per_month)}
                  </p>
                  <p className="text-xs text-muted-foreground">/month</p>
                  {plan.months > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(plan.total_price)} total
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <Badge variant={plan.is_active ? "default" : "secondary"} className="text-xs">
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(plan)}>
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
                            This action cannot be undone. This will permanently delete this pricing plan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(plan.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
