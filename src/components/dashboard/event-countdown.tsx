"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface EventCountdownProps {
  eventDate: string;
}

export function EventCountdown({ eventDate }: EventCountdownProps) {
  const t = useTranslations();
  const [daysAway, setDaysAway] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(eventDate + "T00:00:00");
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    setDaysAway(days);
  }, [eventDate]);

  if (daysAway === null) return null;

  if (daysAway <= 0) {
    return (
      <span className="text-xs font-semibold text-green-600">
        {t("dashboard.today")}
      </span>
    );
  }

  if (daysAway === 1) {
    return (
      <span className="text-xs font-semibold text-amber-600">
        {t("dashboard.tomorrow")}
      </span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      {t("dashboard.days_away", { count: daysAway })}
    </span>
  );
}
