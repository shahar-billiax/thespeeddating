"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  toggleAutoRenewal,
  cancelSubscription,
  purchasePlan,
} from "@/lib/dashboard/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  Crown,
  Gift,
  Percent,
  Heart,
  Eye,
  Star,
  Shield,
  Zap,
  ArrowRight,
  RefreshCw,
  CreditCard,
  Receipt,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Percent, Heart, Eye, Gift, Star, Shield, Crown, Zap,
};

interface SubscriptionData {
  id: number;
  plan_type: string;
  price_per_month: number;
  currency: string;
  status: string;
  auto_renew: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
}

interface PlanData {
  id: number;
  months: number;
  price_per_month: number;
  total_price: number;
  badge: string | null;
}

interface BenefitData {
  icon: string;
  title: string;
  description: string;
}

interface SubscriptionClientProps {
  subscription: SubscriptionData | null;
  plans: PlanData[];
  benefits: BenefitData[];
  notice: string;
  currency: string;
  locale: string;
}

export function SubscriptionClient({
  subscription: sub,
  plans,
  benefits,
  currency,
  locale,
}: SubscriptionClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [autoRenew, setAutoRenew] = useState(sub?.auto_renew ?? true);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [purchaseFeedback, setPurchaseFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isActive = sub?.status === "active";
  const isCancelled = sub?.status === "cancelled";
  // "has access" = still within period even if cancelled
  const hasAccess = isActive || isCancelled;
  const periodEnd = sub?.current_period_end;

  // Parse current plan length from plan_type e.g. "3_month" → 3
  const planMonths = sub?.plan_type
    ? parseInt(sub.plan_type.replace("_month", ""), 10)
    : null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      locale === "he" ? "he-IL" : "en-GB",
      { year: "numeric", month: "long", day: "numeric" }
    );

  const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    active:   { label: t("dashboard.sub_status_active"),   cls: "bg-green-50 text-green-700 border-green-200" },
    cancelled:{ label: t("dashboard.sub_status_cancelled"), cls: "bg-amber-50 text-amber-700 border-amber-200" },
    expired:  { label: t("dashboard.sub_status_expired"),  cls: "bg-gray-50 text-gray-500 border-gray-200" },
    past_due: { label: t("dashboard.sub_status_past_due"), cls: "bg-red-50 text-red-700 border-red-200" },
  };

  // ── Plan card header button label
  const headerButtonLabel = isActive
    ? t("dashboard.sub_extend_plan")
    : isCancelled
      ? t("dashboard.sub_reactivate")
      : null;

  // ── Plans section heading
  const plansHeading = isActive
    ? t("dashboard.sub_extend_heading")
    : isCancelled
      ? t("dashboard.sub_reactivate_heading")
      : t("dashboard.sub_choose_plan");

  // ── Per-plan button label
  function getPlanButtonLabel(_plan: PlanData) {
    if (!sub || sub.status === "expired") return t("dashboard.sub_get_started");
    if (isCancelled) return t("dashboard.sub_reactivate");
    return t("dashboard.sub_extend"); // active: all plans extend by the chosen duration
  }

  const handleAutoRenewToggle = (value: boolean) => {
    const prev = autoRenew;
    setAutoRenew(value);
    setFeedbackMsg(null);
    startTransition(async () => {
      const result = await toggleAutoRenewal(sub!.id, value);
      if (result.error) {
        setAutoRenew(prev);
        setFeedbackMsg({ type: "error", text: t("dashboard.sub_auto_renewal_error") });
      } else {
        setFeedbackMsg({ type: "success", text: t("dashboard.sub_auto_renewal_updated") });
      }
    });
  };

  const handleCancelSubscription = () => {
    setFeedbackMsg(null);
    startTransition(async () => {
      const result = await cancelSubscription(sub!.id);
      if (result.error) {
        setFeedbackMsg({ type: "error", text: t("dashboard.sub_cancel_error") });
      } else {
        router.refresh();
      }
    });
  };

  const handlePurchase = (planId: number) => {
    setPurchasingId(planId);
    setPurchaseFeedback(null);
    startTransition(async () => {
      const result = await purchasePlan(planId);
      setPurchasingId(null);
      if (result.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl;
      } else if (result.error === "stripe_not_configured") {
        setPurchaseFeedback({
          type: "error",
          text: t("dashboard.sub_payments_pending"),
        });
      } else {
        setPurchaseFeedback({
          type: "error",
          text: result.error ?? "Something went wrong.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">

      {/* ── Card 1: Your Plan ──────────────────────────────────── */}
      {hasAccess && sub ? (
        <Card
          className="overflow-hidden"
          style={{ backgroundImage: "linear-gradient(to bottom, rgb(255 251 235 / 0.65) 0%, transparent 28%)" }}
        >
          {/* Header */}
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 shadow-sm shadow-amber-200">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-semibold text-amber-700">
                    {t("dashboard.vip_member")}
                  </span>
                  <span className="text-amber-300 text-xs select-none">·</span>
                  {(() => {
                    const s = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.expired;
                    return (
                      <Badge variant="outline" className={`text-[11px] px-2 py-0 h-5 ${s.cls}`}>
                        {s.label}
                      </Badge>
                    );
                  })()}
                </div>
                <p className="text-base font-semibold text-foreground leading-tight">
                  {planMonths
                    ? t("dashboard.sub_plan_name", { months: String(planMonths) })
                    : sub.plan_type}
                </p>
              </div>
            </div>
            {/* Only show the button when there is a meaningful action */}
            {headerButtonLabel && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800 bg-white/70"
                onClick={() => {
                  document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {headerButtonLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Stats row */}
          <div className="px-5 py-4 grid grid-cols-3 gap-4 divide-x">
            {sub.price_per_month ? (
              <div className="first:ps-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">
                  {t("dashboard.sub_label_price")}
                </p>
                <p className="text-lg font-bold leading-none text-foreground">
                  {formatPrice(sub.price_per_month)}
                  <span className="text-xs font-normal text-muted-foreground ms-0.5">
                    {t("dashboard.sub_per_month")}
                  </span>
                </p>
                {planMonths && planMonths > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.sub_total_price", {
                      price: formatPrice(sub.price_per_month * planMonths),
                    })}
                  </p>
                )}
              </div>
            ) : <div />}
            <div className="ps-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">
                {t("dashboard.sub_label_started")}
              </p>
              <p className="text-sm font-medium text-foreground">
                {sub.current_period_start ? formatDate(sub.current_period_start) : "—"}
              </p>
            </div>
            <div className="ps-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">
                {isActive && autoRenew
                  ? t("dashboard.sub_label_renews")
                  : t("dashboard.sub_label_expires")}
              </p>
              <p className="text-sm font-medium text-foreground">
                {periodEnd ? formatDate(periodEnd) : "—"}
              </p>
            </div>
          </div>

          {isCancelled && periodEnd && (
            <div className="px-5 pb-3 -mt-1">
              <p className="text-sm text-amber-700 font-medium">
                {t("dashboard.sub_cancelled_notice", { date: formatDate(periodEnd) })}
              </p>
            </div>
          )}

          {/* Auto-renewal row — only when active */}
          {isActive && (
            <div className="border-t px-5 py-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">
                    {t("dashboard.sub_auto_renewal")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {autoRenew
                      ? t("dashboard.sub_auto_renewal_on")
                      : periodEnd
                        ? t("dashboard.sub_auto_renewal_off", { date: formatDate(periodEnd) })
                        : t("dashboard.sub_auto_renewal_off", { date: "—" })}
                  </p>
                  {feedbackMsg && (
                    <p className={`mt-1 text-xs ${feedbackMsg.type === "success" ? "text-green-600" : "text-destructive"}`}>
                      {feedbackMsg.text}
                    </p>
                  )}
                </div>
              </div>
              <Switch
                checked={autoRenew}
                onCheckedChange={handleAutoRenewToggle}
                disabled={isPending}
              />
            </div>
          )}

          {/* Cancel row — only when active */}
          {isActive && (
            <div className="border-t px-5 py-3 flex items-center justify-between gap-4 bg-muted/20">
              <p className="text-xs text-muted-foreground">
                {periodEnd
                  ? t("dashboard.sub_cancel_desc", { date: formatDate(periodEnd) })
                  : t("dashboard.sub_cancel_desc", { date: "—" })}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    className="shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-3 font-normal"
                  >
                    {t("dashboard.sub_cancel")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("dashboard.sub_cancel_confirm_title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {periodEnd
                        ? t("dashboard.sub_cancel_confirm_desc", { date: formatDate(periodEnd) })
                        : t("dashboard.sub_cancel_confirm_desc", { date: "—" })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("dashboard.sub_keep")}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleCancelSubscription}
                    >
                      {t("dashboard.sub_yes_cancel")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </Card>
      ) : (
        /* No subscription state */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
              <Crown className="h-7 w-7 text-amber-400" />
            </div>
            <p className="text-lg font-medium">{t("dashboard.no_subscription")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("dashboard.sub_no_active_subtitle")}
            </p>
            <Button
              className="mt-5 gap-2"
              onClick={() => {
                document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("dashboard.explore_vip")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Card 2: Billing (Payment Method + History) ─────────── */}
      {hasAccess && (
        <Card className="overflow-hidden">
          {/* Payment Method */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t("dashboard.sub_payment_method")}</h3>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-3">
              <CreditCard className="h-5 w-5 text-muted-foreground/40 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.sub_no_payment_method")}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {t("dashboard.sub_payment_method_desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="border-t p-5">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t("dashboard.sub_billing_history")}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2.5 pe-4 text-start text-xs font-medium text-muted-foreground">
                      {t("dashboard.sub_billing_date")}
                    </th>
                    <th className="pb-2.5 pe-4 text-start text-xs font-medium text-muted-foreground">
                      {t("dashboard.sub_billing_description")}
                    </th>
                    <th className="pb-2.5 pe-4 text-start text-xs font-medium text-muted-foreground">
                      {t("dashboard.sub_billing_amount")}
                    </th>
                    <th className="pb-2.5 text-start text-xs font-medium text-muted-foreground">
                      {t("dashboard.sub_billing_status")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      {t("dashboard.sub_no_billing_history")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ── Section 3: Plans ────────────────────────────────────── */}
      {plans.length > 0 && (
        <div id="plans-section">
          <h2 className="text-base font-semibold mb-4">{plansHeading}</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const isBestValue = plan.badge === "best_value";
              const isCurrentPlan = isActive && plan.months === planMonths;
              const isLoading = purchasingId === plan.id && isPending;
              const buttonLabel = getPlanButtonLabel(plan);

              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all ${
                    isCurrentPlan
                      ? "ring-2 ring-amber-400/50 shadow-md"
                      : isBestValue
                        ? "shadow-md ring-2 ring-amber-400/40 scale-[1.02]"
                        : "hover:shadow-md"
                  }`}
                >
                  {/* Badge: "Your Plan" takes priority over best_value */}
                  {(isCurrentPlan || plan.badge) && (
                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                      <Badge
                        className={
                          isCurrentPlan
                            ? "bg-amber-500 text-white text-[10px] font-semibold shadow-sm px-3"
                            : isBestValue
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-semibold shadow-sm px-3"
                              : "bg-primary text-[10px] px-3"
                        }
                      >
                        {isCurrentPlan
                          ? t("dashboard.sub_current_plan_badge")
                          : isBestValue
                            ? t("vip.best_value")
                            : t("vip.popular")}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-5 pt-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      {plan.months}{" "}
                      {plan.months === 1 ? t("vip.month") : t("vip.months")}
                    </p>
                    <div className="mb-1">
                      <span className="text-3xl font-bold tracking-tight">
                        {formatPrice(plan.price_per_month)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("vip.per_month")}</p>
                    <p className={`text-xs text-muted-foreground mt-1${plan.months <= 1 ? " invisible" : ""}`}>
                      {formatPrice(plan.total_price)} {t("vip.total")}
                    </p>
                    <Button
                      className={`w-full mt-4 gap-1.5 ${
                        isCurrentPlan
                          ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                          : isBestValue
                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                            : ""
                      }`}
                      variant={isCurrentPlan ? "outline" : "default"}
                      size="sm"
                      disabled={isLoading || isPending}
                      onClick={() => handlePurchase(plan.id)}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      {buttonLabel}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feedback message below plans */}
          {purchaseFeedback && (
            <p className={`mt-3 text-sm text-center ${
              purchaseFeedback.type === "success" ? "text-green-600" : "text-muted-foreground"
            }`}>
              {purchaseFeedback.text}
            </p>
          )}
        </div>
      )}

      {/* ── Section 4: VIP Benefits ─────────────────────────────── */}
      {benefits.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-4">
            {t("vip.benefits_heading")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {benefits.map((benefit, index) => {
              const Icon = ICON_MAP[benefit.icon] ?? Gift;
              return (
                <Card key={index} className="border-0 shadow-sm transition-colors hover:bg-muted/30">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Icon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{benefit.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
