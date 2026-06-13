import { CircleDollarSign, Clock3, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { AdminDashboardRevenue } from "@/types/dashboard";

function getPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (value / total) * 100));
}

function RevenueBar({
  label,
  value,
  percentage,
  colorClass,
}: {
  label: string;
  value: number;
  percentage: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-muted">{label}</span>
        <span className="font-mono font-semibold text-foreground">
          {formatCurrency(value)}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function RevenueOverview({
  revenue,
}: {
  revenue: AdminDashboardRevenue;
}) {
  const reservedPercentage = getPercentage(revenue.reserved, revenue.potential);
  const confirmedPercentage = getPercentage(
    revenue.confirmed,
    revenue.potential,
  );

  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
          <Badge variant="success">Visao de receita</Badge>
          <p className="mt-5 text-sm font-medium text-muted">Potencial bruto</p>
          <p className="mt-2 font-mono text-3xl font-bold text-foreground sm:text-4xl">
            {formatCurrency(revenue.potential)}
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            Capacidade total das campanhas cadastradas, considerando quantidade
            de numeros e preco unitario.
          </p>
        </div>

        <div className="grid gap-5 p-5">
          <RevenueBar
            label="Valor reservado"
            value={revenue.reserved}
            percentage={reservedPercentage}
            colorClass="bg-accent"
          />
          <RevenueBar
            label="Valor confirmado"
            value={revenue.confirmed}
            percentage={confirmedPercentage}
            colorClass="bg-primary"
          />

          <div className="grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Target className="size-4 text-info" />
              <div>
                <p className="text-xs text-muted">Potencial</p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  100%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock3 className="size-4 text-accent" />
              <div>
                <p className="text-xs text-muted">Reservado</p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {reservedPercentage.toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}
                  %
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircleDollarSign className="size-4 text-primary" />
              <div>
                <p className="text-xs text-muted">Confirmado</p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {confirmedPercentage.toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
