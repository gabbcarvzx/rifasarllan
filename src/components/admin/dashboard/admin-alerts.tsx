import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CircleAlert,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
        <div>
          <Badge variant={alerts.length > 0 ? "warning" : "success"}>
            Monitoramento
          </Badge>
          <h2 className="mt-3 text-xl font-bold text-foreground">
            Alertas administrativos
          </h2>
        </div>
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
                  "flex items-start gap-3 rounded-lg border p-3 transition hover:brightness-110",
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
        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/10 p-6 text-center">
          <p className="font-semibold text-emerald-100">Operacao em ordem</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Nenhum alerta administrativo foi identificado agora.
          </p>
        </div>
      )}
    </Card>
  );
}
