"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, TimerOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

type ReservationCountdownProps = {
  reservedUntil: string | null;
  status: OrderStatus;
};

function getRemainingSeconds(reservedUntil: string | null) {
  if (!reservedUntil) {
    return 0;
  }

  return Math.max(
    Math.floor((new Date(reservedUntil).getTime() - Date.now()) / 1000),
    0,
  );
}

function formatRemaining(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ReservationCountdown({
  reservedUntil,
  status,
}: ReservationCountdownProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds(reservedUntil),
  );
  const isPending = status === "pending";
  const isPaid = status === "paid";
  const isExpired = !isPending || remainingSeconds <= 0;
  const isNearExpiration = isPending && remainingSeconds > 0 && remainingSeconds <= 120;
  const label = useMemo(() => formatRemaining(remainingSeconds), [remainingSeconds]);

  useEffect(() => {
    if (!isPending || !reservedUntil) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(reservedUntil));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPending, reservedUntil]);

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isExpired
          ? "border-danger/30 bg-danger/12"
          : isNearExpiration
            ? "border-accent/35 bg-accent/12"
            : "border-primary/30 bg-primary/12",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border",
            isExpired
              ? "border-danger/30 text-rose-100"
              : isNearExpiration
                ? "border-accent/35 text-accent"
                : "border-primary/30 text-primary",
          )}
        >
          {isExpired ? <TimerOff className="size-4" /> : <Clock3 className="size-4" />}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Tempo restante
          </p>
          <p className="mt-1 font-mono text-3xl font-bold text-foreground">
            {isPaid ? "Confirmado" : isExpired ? "Expirado" : label}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">
        {isPaid
          ? "Pagamento confirmado. A reserva foi convertida em numeros pagos."
          : isExpired
          ? "Esta reserva nao esta mais ativa. Os numeros podem voltar para a grade."
          : isNearExpiration
            ? "A reserva esta perto de expirar. O pagamento sera liberado na proxima etapa."
            : "Seus numeros ficam bloqueados temporariamente enquanto o checkout Pix nao esta ativo."}
      </p>
    </div>
  );
}
