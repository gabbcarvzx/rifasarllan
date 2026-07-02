import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CircleAlert,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import type { AdminDashboardAlert } from "@/types/dashboard";

const alertStyles = {
  info: {
    icon: Info,
    className: "border-info/25 bg-info/10 text-sky-100",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-accent/25 bg-accent/10 text-amber-100",
  },
  danger: {
    icon: CircleAlert,
    className: "border-danger/25 bg-danger/10 text-rose-100",
  },
} as const;

export function AdminAlerts({ alerts }: { alerts: AdminDashboardAlert[] }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Monitoramento"
          title="Alertas administrativos"
          description="Itens que merecem acao prioritaria para manter campanha, conversao e operacao em ordem."
        />
        <span className="font-mono text-2xl font-bold text-foreground">
          {alerts.length}
        </span>
      </div>

      {alerts.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {alerts.map((alert) => {
            const style = alertStyles[alert.severity];
            const Icon = style.icon;

            return (
              <Link
                key={alert.alert_key}
                href={alert.href}
                className={cn(
                  "flex items-start gap-3 rounded-[var(--radius-sm)] border p-3 transition hover:brightness-110",
                  style.className,
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {alert.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 opacity-75">
                    {alert.description}
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 opacity-65" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            title="Operacao em ordem"
            description="Nenhum alerta administrativo foi identificado agora."
            className="min-h-52 bg-success/8"
          />
        </div>
      )}
    </Card>
  );
}
