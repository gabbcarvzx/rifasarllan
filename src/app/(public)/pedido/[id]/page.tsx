import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Hash,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";
import { getMyOrderById, getMyProfile } from "@/app/actions/account";
import { AccountLayout } from "@/components/account/account-layout";
import { ParticipantPaymentCard } from "@/components/account/participant-payment-card";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { ReservationCountdown } from "@/components/raffles/reservation-countdown";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  orderStatusLabels,
  orderStatusVariants,
  raffleStatusLabels,
} from "@/lib/account/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalhes do Pedido",
};

type PedidoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PedidoPage({ params }: PedidoPageProps) {
  const { id } = await params;
  const [profileResult, orderResult] = await Promise.all([
    getMyProfile(),
    getMyOrderById(id),
  ]);

  if (!profileResult.data) {
    redirect("/login?error=Perfil%20nao%20encontrado.");
  }

  if (!orderResult.data) {
    notFound();
  }

  const { order, items, raffle, reservedUntil, payment } = orderResult.data;

  return (
    <AccountLayout
      profile={profileResult.data}
      title="Detalhes do pedido"
      description="Consulte os numeros, o prazo da reserva e os dados registrados neste pedido."
    >
      <div className="mb-5">
        <Link
          href="/meus-pedidos"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          Voltar para meus pedidos
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="grid sm:grid-cols-[220px_minmax(0,1fr)]">
              <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-56">
                {raffle.mainImageUrl ? (
                  <Image
                    src={raffle.mainImageUrl}
                    alt={raffle.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(min-width: 640px) 220px, 100vw"
                  />
                ) : (
                  <ImagePlaceholder
                    title="Rifa sem imagem"
                    description=""
                    className="h-full rounded-none border-0"
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={orderStatusVariants[order.status]}>
                    {orderStatusLabels[order.status]}
                  </Badge>
                  <Badge variant={raffle.status === "active" ? "success" : "muted"}>
                    {raffleStatusLabels[raffle.status]}
                  </Badge>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-foreground">
                  {raffle.title}
                </h2>
                <p className="mt-2 break-all font-mono text-xs text-muted">
                  Pedido {order.id}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-black/18 p-3">
                    <Hash className="mb-2 size-4 text-primary" />
                    <p className="text-xs text-muted">Numeros</p>
                    <p className="mt-1 font-bold text-foreground">{items.length}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/18 p-3">
                    <CalendarDays className="mb-2 size-4 text-info" />
                    <p className="text-xs text-muted">Criado em</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-3xl font-bold text-accent">
                  {formatCurrency(order.amount)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-bold text-foreground">Numeros do pedido</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item.id}
                  className="rounded-lg border border-info/30 bg-info/12 px-3 py-2 font-mono text-sm font-bold text-sky-100"
                >
                  {item.number}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-bold text-foreground">Dados da reserva</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-black/18 p-3">
                <UserCircle className="size-5 shrink-0 text-primary" />
                <span className="truncate text-sm font-semibold text-foreground">
                  {order.customer_name ?? "Nao informado"}
                </span>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-black/18 p-3">
                <Mail className="size-5 shrink-0 text-accent" />
                <span className="truncate text-sm font-semibold text-foreground">
                  {order.customer_email ?? "Nao informado"}
                </span>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-black/18 p-3">
                <Phone className="size-5 shrink-0 text-info" />
                <span className="truncate text-sm font-semibold text-foreground">
                  {order.customer_phone ?? "Nao informado"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <ReservationCountdown
            reservedUntil={reservedUntil}
            status={order.status}
          />
          <ParticipantPaymentCard payment={payment} />
        </div>
      </div>
    </AccountLayout>
  );
}
