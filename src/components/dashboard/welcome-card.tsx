"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WelcomeCardProps {
  firstName: string;
  profileCompletion: number;
}

function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "dashboard.welcome_morning";
  if (hour < 18) return "dashboard.welcome_afternoon";
  return "dashboard.welcome_evening";
}

function getProgressColor(completion: number): string {
  if (completion >= 100) return "bg-emerald-500";
  if (completion >= 70) return "bg-blue-500";
  if (completion >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

export function WelcomeCard({ firstName, profileCompletion }: WelcomeCardProps) {
  const t = useTranslations();
  const greetingKey = getGreetingKey();
  const isComplete = profileCompletion >= 100;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 shadow-md",
        "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
      )}
    >
      {/* Decorative background element */}
      <div className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -end-4 -bottom-8 h-24 w-24 rounded-full bg-primary/[0.03]" />

      <CardContent className="relative p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Greeting and progress section */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {t(greetingKey, { name: firstName })}
            </h2>

            {isComplete ? (
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-600">
                  {t("dashboard.profile_complete_congrats")}
                </p>
              </div>
            ) : (
              <div className="mt-3 max-w-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("dashboard.profile_completion")}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      profileCompletion >= 70
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {profileCompletion}%
                  </span>
                </div>
                <div className="relative">
                  <Progress
                    value={profileCompletion}
                    className="h-2.5 bg-muted/50"
                  />
                  {/* Colored overlay for the progress indicator */}
                  <div
                    className={cn(
                      "absolute inset-y-0 start-0 rounded-full transition-all duration-500",
                      getProgressColor(profileCompletion)
                    )}
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CTA button */}
          {!isComplete && (
            <Button
              asChild
              className="group shrink-0 gap-1.5 shadow-sm"
            >
              <Link href="/dashboard/profile">
                {t("dashboard.complete_now")}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
