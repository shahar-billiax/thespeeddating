import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Heart,
  Sparkles,
  Crown,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

interface PendingAction {
  type: "score" | "complete_profile" | "vip_expiring";
  label: string;
  href: string;
  eventId?: number;
}

interface PendingActionsWidgetProps {
  actions: PendingAction[];
}

const actionConfig = {
  score: {
    icon: Heart,
    color: "text-amber-700",
    border: "border-amber-200",
    hoverBg: "hover:bg-amber-50/50",
    iconBg: "bg-amber-100",
    ctaKey: "dashboard.go_to_score" as const,
    ctaColor: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  complete_profile: {
    icon: Sparkles,
    color: "text-purple-700",
    border: "border-purple-200",
    hoverBg: "hover:bg-purple-50/50",
    iconBg: "bg-purple-100",
    ctaKey: "dashboard.complete_profile" as const,
    ctaColor: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  vip_expiring: {
    icon: Crown,
    color: "text-amber-700",
    border: "border-amber-200",
    hoverBg: "hover:bg-amber-50/50",
    iconBg: "bg-amber-100",
    ctaKey: "dashboard.subscription_manage" as const,
    ctaColor: "bg-amber-600 hover:bg-amber-700 text-white",
  },
};

function getActionMessage(
  action: PendingAction,
  t: (key: string, params?: Record<string, string>) => string
): string {
  if (action.type === "score") {
    return t("dashboard.score_event", { event: action.label });
  }
  if (action.type === "complete_profile") {
    return t("dashboard.complete_profile");
  }
  return t("dashboard.vip_expiring", { days: action.label });
}

export async function PendingActionsWidget({
  actions,
}: PendingActionsWidgetProps) {
  const t = await getTranslations();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          </div>
          {t("dashboard.pending_actions")}
          {actions.length > 0 && (
            <span className="ms-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {actions.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {actions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-emerald-700">
              {t("dashboard.no_action_items")}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {actions.map((action, i) => {
              const config = actionConfig[action.type];
              const Icon = config.icon;
              const message = getActionMessage(action, t);

              return (
                <Link
                  key={`${action.type}-${i}`}
                  href={action.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200",
                    "hover:shadow-md bg-background",
                    config.border,
                    config.hoverBg
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
                      config.iconBg
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>

                  {/* Message */}
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {message}
                  </span>

                  {/* CTA */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                      config.ctaColor
                    )}
                  >
                    {t(config.ctaKey)}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
