"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Info, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import {
  reserveNumbers,
  type ReservationActionState,
} from "@/app/actions/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const initialState: ReservationActionState = {
  status: "idle",
  message: "",
};

type SelectionSummaryProps = {
  raffleId: string;
  raffleSlug: string;
  selectedNumbers: number[];
  pricePerNumber: number;
  customerDefaults?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  onClear: () => void;
};

export function SelectionSummary({
  raffleId,
  raffleSlug,
  selectedNumbers,
  pricePerNumber,
  customerDefaults,
  onClear,
}: SelectionSummaryProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    reserveNumbers,
    initialState,
  );
  const quantity = selectedNumbers.length;
  const total = quantity * pricePerNumber;
  const previewNumbers = selectedNumbers.slice(0, 18);
  const hiddenCount = Math.max(quantity - previewNumbers.length, 0);

  useEffect(() => {
    if (state.status === "error") {
      router.refresh();
    }
  }, [router, state.status, state.updatedAt]);

  return (
    <form action={formAction} className="rounded-lg border border-white/10 bg-black/18 p-4">
      <input type="hidden" name="raffleId" value={raffleId} />
      <input type="hidden" name="raffleSlug" value={raffleSlug} />
      <input type="hidden" name="selectedNumbers" value={selectedNumbers.join(",")} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Resumo da selecao
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">
            A reserva bloqueia os numeros por 15 minutos e cria um pedido na sua
            conta. O pagamento online permanece pausado.
          </p>
        </div>
        <span className="rounded-full border border-primary/25 bg-primary/12 px-3 py-1 text-xs font-semibold text-emerald-100">
          {quantity} selecionado{quantity === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Quantidade
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{quantity}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Total estimado
          </p>
          <p className="mt-1 text-2xl font-bold text-accent">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      <div className="mt-4 min-h-16 rounded-lg border border-white/10 bg-white/[0.03] p-3">
        {quantity > 0 ? (
          <div className="flex flex-wrap gap-2">
            {previewNumbers.map((number) => (
              <span
                key={number}
                className="rounded-md border border-primary/30 bg-primary/12 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-100"
              >
                {number}
              </span>
            ))}
            {hiddenCount > 0 ? (
              <span className="rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-muted">
                +{hiddenCount}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Info className="size-4 text-accent" />
            Nenhum numero selecionado ainda.
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Nome completo
          <Input
            name="customerName"
            defaultValue={customerDefaults?.name ?? ""}
            placeholder="Seu nome"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          E-mail
          <Input
            name="customerEmail"
            type="email"
            defaultValue={customerDefaults?.email ?? ""}
            placeholder="voce@email.com"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          WhatsApp
          <Input
            name="customerPhone"
            defaultValue={customerDefaults?.phone ?? ""}
            placeholder="(00) 00000-0000"
            required
          />
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <div
          className={cn(
            "mt-4 rounded-lg border p-3 text-sm leading-6",
            "border-danger/35 bg-danger/12 text-rose-100",
          )}
        >
          {state.message}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="secondary"
          disabled={quantity === 0 || isPending}
          onClick={onClear}
          className="w-full"
        >
          <RotateCcw className="size-4" />
          Limpar selecao
        </Button>
        <Button type="submit" disabled={quantity === 0 || isPending} className="w-full">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isPending ? "Reservando..." : "Reservar numeros"}
        </Button>
      </div>
    </form>
  );
}
