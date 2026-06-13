"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, RefreshCw, Trash2, WalletCards } from "lucide-react";
import {
  cancelPixPayment,
  createPixCheckout,
  refreshPixPayment,
  type CheckoutActionState,
} from "@/app/actions/checkout";
import { CheckoutInstructions } from "@/components/payments/checkout-instructions";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { PixCopyPaste } from "@/components/payments/pix-copy-paste";
import { PixQRCode } from "@/components/payments/pix-qr-code";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OrderStatus, Payment } from "@/types/database";

const initialState: CheckoutActionState = {
  status: "idle",
  message: "",
};

function ActionMessage({ state }: { state: CheckoutActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm leading-6",
        state.status === "success"
          ? "border-primary/35 bg-primary/12 text-emerald-100"
          : "border-danger/35 bg-danger/12 text-rose-100",
      )}
    >
      {state.message}
    </div>
  );
}

function latestState(states: CheckoutActionState[]) {
  return (
    states
      .filter((state) => state.status !== "idle")
      .sort((first, second) => (second.updatedAt ?? 0) - (first.updatedAt ?? 0))[0] ??
    initialState
  );
}

export function PixCheckoutCard({
  orderId,
  orderStatus,
  payment,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  payment: Payment | null;
}) {
  const router = useRouter();
  const [createState, createAction, isCreating] = useActionState(
    createPixCheckout,
    initialState,
  );
  const [refreshState, refreshAction, isRefreshing] = useActionState(
    refreshPixPayment,
    initialState,
  );
  const [cancelState, cancelAction, isCancelling] = useActionState(
    cancelPixPayment,
    initialState,
  );
  const states = [createState, refreshState, cancelState];
  const combinedState = latestState(states);
  const hasSuccess = states.some((state) => state.status === "success");
  const canCreate =
    orderStatus === "pending" &&
    (!payment || !payment.provider_payment_id || payment.status === "failed");
  const canRefresh = Boolean(payment?.provider_payment_id);
  const canCancel =
    orderStatus === "pending" &&
    payment?.status === "pending" &&
    Boolean(payment.provider_payment_id);

  useEffect(() => {
    if (hasSuccess) {
      router.refresh();
    }
  }, [hasSuccess, router]);

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <WalletCards className="size-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Checkout Pix
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Cobranca processada pelo Asaas. A chave da API permanece somente no servidor.
          </p>
        </div>
        {payment ? <PaymentStatusBadge status={payment.status} /> : null}
      </div>

      <div className="mt-5">
        <ActionMessage state={combinedState} />
      </div>

      {payment?.status === "paid" ? (
        <div className="mt-5 rounded-lg border border-primary/30 bg-primary/12 p-5 text-center">
          <p className="text-lg font-bold text-emerald-100">
            Pagamento confirmado
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            O pedido e os numeros foram atualizados como pagos.
          </p>
        </div>
      ) : payment?.pix_qr_code || payment?.pix_copy_paste ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr] lg:items-start">
          <PixQRCode value={payment.pix_qr_code} />
          <div className="grid gap-4">
            <PixCopyPaste value={payment.pix_copy_paste} />
            {payment.invoice_url ? (
              <a
                href={payment.invoice_url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", className: "w-full" })}
              >
                <ExternalLink className="size-4" />
                Abrir cobranca no Asaas
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
          <p className="font-semibold text-foreground">
            Gere a cobranca para visualizar o QR Code Pix.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            O valor e os dados do cliente sao carregados do pedido no servidor.
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {canCreate ? (
          <form action={createAction}>
            <input type="hidden" name="orderId" value={orderId} />
            <Button type="submit" disabled={isCreating} className="w-full">
              {isCreating ? <Loader2 className="size-4 animate-spin" /> : null}
              {isCreating ? "Gerando Pix..." : "Gerar pagamento Pix"}
            </Button>
          </form>
        ) : null}

        {canRefresh ? (
          <form action={refreshAction}>
            <input type="hidden" name="orderId" value={orderId} />
            <Button
              type="submit"
              variant="secondary"
              disabled={isRefreshing}
              className="w-full"
            >
              <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Consultando..." : "Atualizar status"}
            </Button>
          </form>
        ) : null}
      </div>

      {canCancel ? (
        <form action={cancelAction} className="mt-3">
          <input type="hidden" name="orderId" value={orderId} />
          <Button
            type="submit"
            variant="danger"
            disabled={isCancelling}
            className="w-full"
          >
            <Trash2 className="size-4" />
            {isCancelling ? "Cancelando..." : "Cancelar cobranca e reserva"}
          </Button>
        </form>
      ) : null}

      <div className="mt-6 border-t border-white/10 pt-5">
        <CheckoutInstructions />
      </div>
    </Card>
  );
}
