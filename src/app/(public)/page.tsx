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
import { PublicRaffleCard } from "@/components/raffles/public-raffle-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicRaffleCatalog } from "@/lib/raffles/public-queries";
import { getPublicPlatformSettings } from "@/lib/platform-settings/public";

const trustItems = [
  {
    title: "Participacao organizada",
    description: "Rifas, premios, numeros e reservas reunidos em uma experiencia clara.",
    icon: BadgeCheck,
  },
  {
    title: "Conta protegida",
    description: "Seus pedidos e numeros ficam vinculados ao seu acesso pessoal.",
    icon: LockKeyhole,
  },
  {
    title: "Resultado transparente",
    description: "Vencedores e comprovacoes podem ser publicados depois da live.",
    icon: Sparkles,
  },
];

const steps = [
  "Escolha uma rifa ativa",
  "Selecione seus numeros",
  "Confirme seus dados e a reserva",
  "Acompanhe tudo pela sua conta",
];

export default async function HomePage() {
  const [catalog, settings] = await Promise.all([
    getPublicRaffleCatalog({ limit: 3 }),
    getPublicPlatformSettings(),
  ]);
  const { raffles, prizeSummaries } = catalog;

  return (
    <>
      <section className="relative isolate flex min-h-[82svh] items-center overflow-hidden border-b border-white/10">
        <Image
          src={settings.hero_banner_url ?? "/images/hero-raffle-premium.png"}
          alt={`Banner principal de ${settings.platform_name}`}
          fill
          priority
          className="object-cover object-center opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/68" />
        <div className="premium-grid absolute inset-0 opacity-30" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="success">Rifas online premium</Badge>
            {settings.logo_url ? (
              <div className="relative mt-6 size-20 overflow-hidden rounded-lg border border-white/15 bg-black/30 p-2 backdrop-blur">
                <Image
                  src={settings.logo_url}
                  alt={`Logo ${settings.platform_name}`}
                  fill
                  className="object-contain p-2"
                  sizes="80px"
                />
              </div>
            ) : null}
            <h1 className="mt-6 max-w-3xl text-balance text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {settings.platform_name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              {settings.platform_subtitle}
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
                href="#como-funciona"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "sm:w-auto",
                })}
              >
                Como funciona
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["Conta", "acesso protegido"],
                ["15 min", "reserva segura"],
                ["Ao vivo", "resultado claro"],
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
                Confira os premios, valores e datas das campanhas abertas para
                participacao.
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
              description="Novas campanhas aparecerao aqui assim que forem abertas para participacao."
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
            <Badge variant="info">Confianca em cada etapa</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
              Uma experiencia simples para participar com tranquilidade.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Consulte regras, escolha numeros, acompanhe suas reservas e veja
              resultados publicados pelo organizador em um unico lugar.
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

      <section id="como-funciona" className="scroll-mt-20 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <Badge variant="success">Como funciona</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                Da escolha dos numeros ao acompanhamento do resultado.
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
                  Encontre uma campanha ativa e escolha seus numeros em poucos
                  passos.
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
