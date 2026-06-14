"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Hash, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  orderStatusLabels,
  orderStatusVariants,
} from "@/lib/account/status";
import type { MyOrder } from "@/types/account";

function remainingLabel(reservedUntil: string | null) {
  if (!reservedUntil) {
    return null;
  }

  const seconds = Math.max(
    Math.floor((new Date(reservedUntil).getTime() - Date.now()) / 1000),
    0,
  );
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function MyOrderCard({ order }: { order: MyOrder }) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (order.status !== "pending" || !order.reservedUntil) {
      return;
    }

    const update = () => setRemaining(remainingLabel(order.reservedUntil));
    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, [order.reservedUntil, order.status]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={orderStatusVariants[order.status]}>
              {orderStatusLabels[order.status]}
            </Badge>
            {order.status === "pending" && remaining ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-accent">
                <Clock3 className="size-3.5" />
                {remaining}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 truncate text-lg font-bold text-foreground">
            {order.raffle.title}
          </h2>
          <p className="mt-1 truncate font-mono text-xs text-muted">
            {order.id}
          </p>
        </div>
        <p className="text-xl font-bold text-accent">
          {formatCurrency(order.amount)}
        </p>
      </div>

      <div className="grid grid-cols-2 border-y border-white/10 bg-black/15 sm:grid-cols-3">
        <div className="border-r border-white/10 p-4">
          <Hash className="mb-2 size-4 text-primary" />
          <p className="text-xs text-muted">Numeros</p>
          <p className="mt-1 font-semibold text-foreground">
            {order.numbersCount}
          </p>
        </div>
        <div className="p-4 sm:border-r sm:border-white/10">
          <CalendarDays className="mb-2 size-4 text-info" />
          <p className="text-xs text-muted">Criado em</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="col-span-2 border-t border-white/10 p-4 sm:col-span-1 sm:border-t-0">
          <ReceiptText className="mb-2 size-4 text-accent" />
          <p className="text-xs text-muted">Status</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {orderStatusLabels[order.status]}
          </p>
        </div>
      </div>

      <div className="flex justify-end p-4">
        <Link
          href={`/pedido/${order.id}`}
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          Ver detalhes
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </Card>
  );
}
