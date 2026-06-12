import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  trend: string;
  icon: LucideIcon;
};

export function StatCard({
  label,
  value,
  helper,
  trend,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-xs">
        <span className="text-muted">{helper}</span>
        <span className="rounded-full border border-accent/25 bg-accent/12 px-2 py-1 font-semibold text-amber-100">
          {trend}
        </span>
      </div>
    </Card>
  );
}
