"use client";

import { Button } from "@/components/ui/button";
import { Heart, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Choice = "date" | "friend" | "no";

export function ConnectionSelector({
  value,
  onChange,
}: {
  value: Choice | null;
  onChange: (value: Choice) => void;
}) {
  const t = useTranslations("matches");

  const options: { key: Choice; label: string; icon: typeof Heart; activeClass: string }[] = [
    {
      key: "date",
      label: t("date"),
      icon: Heart,
      activeClass: "bg-pink-600 hover:bg-pink-700 text-white ring-2 ring-pink-300 scale-[1.03]",
    },
    {
      key: "friend",
      label: t("friend"),
      icon: Users,
      activeClass: "bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300 scale-[1.03]",
    },
    {
      key: "no",
      label: t("pass"),
      icon: X,
      activeClass: "bg-gray-600 hover:bg-gray-700 text-white ring-2 ring-gray-300 scale-[1.03]",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map(({ key, label, icon: Icon, activeClass }) => (
        <Button
          key={key}
          type="button"
          size="lg"
          variant={value === key ? "default" : "outline"}
          className={cn(
            "h-16 flex-col gap-1.5 transition-all duration-200",
            value === key && activeClass
          )}
          onClick={() => onChange(key)}
        >
          <Icon className="h-5 w-5" />
          <span className="font-semibold text-sm">{label}</span>
        </Button>
      ))}
    </div>
  );
}
