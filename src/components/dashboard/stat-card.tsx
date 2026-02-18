import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  iconClassName?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      {/* Subtle decorative corner */}
      <div
        className={cn(
          "pointer-events-none absolute -end-6 -top-6 h-16 w-16 rounded-full opacity-20 transition-opacity group-hover:opacity-30",
          iconClassName ? iconClassName.replace(/text-/, "bg-") : "bg-primary"
        )}
      />

      <CardContent className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Icon container */}
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
              iconClassName || "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Value and label */}
          <div className="min-w-0 flex-1">
            <p className="text-3xl font-bold leading-none tracking-tight">
              {value}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
