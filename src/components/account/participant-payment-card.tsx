import { CirclePause, CreditCard } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { PixCopyPaste } from "@/components/payments/pix-copy-paste";
import { PixQRCode } from "@/components/payments/pix-qr-code";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { MyOrderDetails } from "@/types/account";

export function ParticipantPaymentCard({
  payment,
}: {
  payment: MyOrderDetails["payment"];
}) {
  if (!payment) {
    return (
      <Card className="border-accent/25 bg-accent/[0.06] p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/12 text-accent">
            <CirclePause className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Pagamento pausado</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              O pagamento online esta temporariamente indisponivel. Nenhuma
              cobranca foi criada para este pedido.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/12 text-primary">
            <CreditCard className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Pagamento Pix</h2>
            <p className="mt-1 text-xs text-muted">
              Consulta somente leitura
            </p>
          </div>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <div className="grid gap-5 p-5">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Valor</p>
            <p className="mt-1 font-semibold text-foreground">
              {payment.amount ? formatCurrency(payment.amount) : "Nao informado"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Criado em</p>
            <p className="mt-1 font-semibold text-foreground">
              {formatDateTime(payment.created_at)}
            </p>
          </div>
        </div>

        {payment.pix_qr_code || payment.pix_copy_paste ? (
          <div className="grid justify-items-center gap-5">
            <PixQRCode value={payment.pix_qr_code} />
            <div className="w-full">
              <PixCopyPaste value={payment.pix_copy_paste} />
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted">
            Esta cobranca nao possui QR Code ou codigo Pix disponivel.
          </p>
        )}

        <p className="text-xs leading-5 text-muted">
          A atualizacao automatica e a confirmacao via webhook permanecem
          pausadas nesta etapa.
        </p>
      </div>
    </Card>
  );
}
