import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Mail,
  Phone,
  ReceiptText,
  UserCircle,
} from "lucide-react";
import { getCheckoutByOrderId } from "@/app/actions/checkout";
import { getOrderById } from "@/app/actions/reservations";
import { PixCheckoutCard } from "@/components/payments/pix-checkout-card";
import { ReservationCountdown } from "@/components/raffles/reservation-countdown";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { OrderStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido",
};

type PedidoPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  expired: "Expirado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const statusVariants: Record<OrderStatus, "default" | "success" | "warning" | "danger" | "muted"> = {
  pending: "warning",
  paid: "success",
  expired: "danger",
  cancelled: "muted",
  refunded: "muted",
};

export default async function PedidoPage({ params }: PedidoPageProps) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result.data) {
    notFound();
  }

  const { order, items, raffle, reservedUntil } = result.data;
  const checkoutResult = await getCheckoutByOrderId(order.id);
  const numbers = items.map((item) => item.number);

  return (
    <section className="bg-surface/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant={statusVariants[order.status]}>
              {statusLabels[order.status]}
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
              Pedido de reserva
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Seus numeros foram bloqueados temporariamente. Gere ou acompanhe
              sua cobranca Pix processada pelo Asaas.
            </p>
          </div>
          <Link
            href={raffle ? `/rifas/${raffle.slug}` : "/rifas"}
            className={buttonVariants({ variant: "secondary" })}
          >
            <ArrowLeft className="size-4" />
            Voltar para rifa
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    Campanha
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">
                    {raffle?.title ?? "Rifa"}
                  </h2>
                  <p className="mt-2 font-mono text-xs text-muted">{order.id}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/18 p-4 text-right">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    Valor total
                  </p>
                  <p className="mt-1 text-3xl font-bold text-accent">
                    {formatCurrency(order.amount)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <ReceiptText className="mb-3 size-5 text-primary" />
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    Numeros
                  </p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {numbers.length}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <CalendarDays className="mb-3 size-5 text-accent" />
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    Criado em
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <CreditCard className="mb-3 size-5 text-info" />
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    Pagamento
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    Pix via Asaas
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-xl font-bold text-foreground">
                Numeros reservados
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {numbers.map((number) => (
                  <span
                    key={number}
                    className="rounded-md border border-info/30 bg-info/12 px-3 py-1.5 font-mono text-sm font-bold text-sky-100"
                  >
                    {number}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-xl font-bold text-foreground">
                Dados do cliente
              </h2>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/18 p-3">
                  <UserCircle className="size-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {order.customer_name ?? "Nao informado"}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/18 p-3">
                  <Mail className="size-5 text-accent" />
                  <span className="text-sm font-semibold text-foreground">
                    {order.customer_email ?? "Nao informado"}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/18 p-3">
                  <Phone className="size-5 text-info" />
                  <span className="text-sm font-semibold text-foreground">
                    {order.customer_phone ?? "Nao informado"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ReservationCountdown
              reservedUntil={reservedUntil}
              status={order.status}
            />
            <PixCheckoutCard
              orderId={order.id}
              orderStatus={order.status}
              payment={checkoutResult.data}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
