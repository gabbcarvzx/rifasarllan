import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  LockKeyhole,
  SearchX,
  Sparkles,
  TicketCheck,
} from "lucide-react";
import { getPublicPrizeSummaries } from "@/app/actions/prizes";
import { PublicRaffleCard } from "@/components/raffles/public-raffle-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicActiveRaffles } from "@/lib/raffles/public-queries";

export const dynamic = "force-dynamic";

const trustItems = [
  {
    title: "Gestao visual",
    description: "Painel para criar campanhas, controlar status e operar por tenant.",
    icon: BadgeCheck,
  },
  {
    title: "Base segura",
    description: "Supabase Auth, RLS e isolamento por tenant no centro da arquitetura.",
    icon: LockKeyhole,
  },
  {
    title: "Escala comercial",
    description: "Fundacao pronta para Pix, webhook, reservas e dashboard financeiro.",
    icon: Sparkles,
  },
];

const steps = [
  "Escolha uma rifa ativa",
  "Confira detalhes e regras",
  "Aguarde a grade de numeros",
  "Acompanhe os proximos recursos",
];

export default async function HomePage() {
  const raffles = await getPublicActiveRaffles({ limit: 3 });
  const prizeSummaries = await getPublicPrizeSummaries(
    raffles.map((raffle) => raffle.id),
  );

  return (
    <>
      <section className="relative isolate flex min-h-[82svh] items-center overflow-hidden border-b border-white/10">
        <Image
          src="/images/hero-raffle-premium.png"
          alt="Interface premium de rifa online com premios"
          fill
          priority
          className="object-cover object-center opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(34,197,94,0.24),transparent_28%),linear-gradient(90deg,rgba(6,8,8,0.98)_0%,rgba(6,8,8,0.84)_42%,rgba(6,8,8,0.34)_100%)]" />
        <div className="premium-grid absolute inset-0 opacity-30" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="success">Rifas online premium</Badge>
            <h1 className="mt-6 max-w-3xl text-balance text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Rifa Arllan
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              Uma experiencia de sorteios online com visual de produto SaaS,
              estrutura profissional e base preparada para operacao comercial.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/rifas"
                className={buttonVariants({ size: "lg", className: "sm:w-auto" })}
              >
                Ver rifas ativas
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/admin"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "sm:w-auto",
                })}
              >
                Ver painel admin
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["RLS", "tenant safe"],
                ["Auth", "Supabase"],
                ["Pix", "roadmap"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/10 bg-black/28 p-3 backdrop-blur"
                >
                  <p className="text-xl font-bold text-foreground">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-surface/36 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="default">Rifas ativas</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                Campanhas em destaque
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Campanhas ativas carregadas do Supabase, priorizando rifas
                marcadas como destaque pelo admin.
              </p>
            </div>
            <Link
              href="/rifas"
              className={buttonVariants({ variant: "outline", size: "md" })}
            >
              Ver todas
            </Link>
          </div>

          {raffles.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {raffles.map((raffle) => (
                <PublicRaffleCard
                  key={raffle.id}
                  raffle={raffle}
                  prizeSummary={prizeSummaries[raffle.id]}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nenhuma rifa ativa publicada"
              description="Assim que o admin criar uma rifa ativa, ela aparece nesta area com dados reais."
              action={
                <Link
                  href="/rifas"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Ver vitrine publica
                </Link>
              }
            />
          )}
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <Badge variant="info">Confianca operacional</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
              Construida para virar operacao, nao apenas pagina.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              A plataforma agora possui autenticacao, isolamento de tenant e CRUD
              real de rifas. As camadas de storage, reservas, pagamentos e sorteio
              entram com fronteiras claras nas proximas etapas.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="p-5">
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {item.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <Badge variant="success">Como funciona</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                Fluxo simples para o cliente, controle completo para o admin.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-sm font-bold text-accent">
                    {index + 1}
                  </div>
                  <p className="font-semibold text-foreground">{step}</p>
                  <CheckCircle2 className="mt-4 size-5 text-primary" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/12 via-info/10 to-accent/12 p-6 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <TicketCheck className="mb-4 size-6 text-accent" />
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Pronto para conferir as campanhas?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  A vitrine publica ja consome rifas reais com status ativo e
                  respeita tenants ativos.
                </p>
              </div>
              <Link
                href="/rifas"
                className={buttonVariants({
                  size: "lg",
                  className: "w-full md:w-auto",
                })}
              >
                Acessar rifas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
