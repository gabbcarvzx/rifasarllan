import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      {Icon ? <Icon className="size-5 text-primary" /> : null}
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-muted">{hint}</p> : null}
    </Card>
  );
}
