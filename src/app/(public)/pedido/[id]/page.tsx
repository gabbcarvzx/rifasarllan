import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Hash,
  Info,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";
import { getMyOrderById, getMyProfile } from "@/app/actions/account";
import { AccountLayout } from "@/components/account/account-layout";
import { ParticipantPaymentCard } from "@/components/account/participant-payment-card";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { ReservationCountdown } from "@/components/raffles/reservation-countdown";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatCard } from "@/components/ui/stat-card";
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

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Status"
          value={orderStatusLabels[order.status]}
          hint="Atualizado conforme a situacao do pedido"
        />
        <StatCard
          label="Numeros"
          value={String(items.length)}
          hint="Quantidade vinculada a este pedido"
        />
        <StatCard
          label="Valor"
          value={formatCurrency(order.amount)}
          hint="Total registrado no pedido"
        />
        <StatCard
          label="Campanha"
          value={raffle.status === "active" ? "Ativa" : "Historico"}
          hint={raffleStatusLabels[raffle.status]}
        />
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
            <SectionHeading
              eyebrow="Numeros vinculados"
              title="Numeros deste pedido"
              description="Use esta area para conferir rapidamente o que ficou reservado ou confirmado neste pedido."
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item.id}
                  className="rounded-[var(--radius-sm)] border border-info/30 bg-info/12 px-3 py-2 font-mono text-sm font-bold text-sky-100"
                >
                  {item.number}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading
              eyebrow="Dados protegidos"
              title="Informacoes da reserva"
              description="Esses dados vieram do momento da compra e ajudam voce a validar o pedido com seguranca."
            />
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

          <Alert
            tone={order.status === "pending" ? "warning" : "info"}
            title={
              order.status === "pending"
                ? "Finalize este pedido dentro do prazo"
                : "Pedido salvo no seu historico"
            }
            description={
              order.status === "pending"
                ? "A reserva dos numeros depende da conclusao do pagamento antes do vencimento exibido nesta pagina."
                : "Voce pode usar esta pagina para revisar numeros, status e comprovantes sempre que precisar."
            }
            action={
              raffle.slug && raffle.status === "active" ? (
                <Link
                  href={`/rifas/${raffle.slug}`}
                  className={buttonVariants({ size: "sm", variant: "secondary" })}
                >
                  Ver campanha novamente
                </Link>
              ) : null
            }
          />
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <ReservationCountdown
            reservedUntil={reservedUntil}
            status={order.status}
          />
          <ParticipantPaymentCard payment={payment} />
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-info/30 bg-info/12 text-info">
                <Info className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Area segura de consulta</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Este detalhe do pedido fica vinculado ao seu acesso autenticado e preserva o historico de numeros e pagamento sem expor outras contas.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AccountLayout>
  );
}
