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
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex h-full items-center justify-center gap-4 p-5">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            iconClassName || "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight tracking-tight">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/60">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
