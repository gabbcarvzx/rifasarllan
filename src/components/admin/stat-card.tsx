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
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-border/80 p-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {label}
          </p>
          <p className="mt-3 break-words font-mono text-2xl font-bold text-foreground sm:text-3xl">
            {value}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-primary/20 bg-primary/12 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-5 text-xs">
        <span className="max-w-[18rem] text-muted">{helper}</span>
        <span className="rounded-full border border-accent/25 bg-accent/12 px-2 py-1 font-semibold text-accent-foreground">
          {trend}
        </span>
      </div>
    </Card>
  );
}
