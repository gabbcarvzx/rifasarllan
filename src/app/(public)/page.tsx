import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  Headset,
  LockKeyhole,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Ticket,
  TicketCheck,
  Trophy,
  Users,
} from "lucide-react";
import { getPublicManualResultsForRaffle } from "@/app/actions/manual-results";
import { PublicRaffleCard } from "@/components/raffles/public-raffle-card";
import { PublicWinnerCard } from "@/components/raffles/public-winner-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPublicRaffleCatalog } from "@/lib/raffles/public-queries";
import { getPublicPlatformSettings } from "@/lib/platform-settings/public";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicPlatformSettings();
  const title = settings.seo_title ?? settings.platform_name;
  const description =
    settings.seo_description ??
    settings.platform_subtitle ??
    "Participe de rifas online com uma experiencia mais clara e segura.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: settings.hero_banner_url ? [{ url: settings.hero_banner_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings.hero_banner_url ? [settings.hero_banner_url] : undefined,
    },
  };
}

const trustItems = [
  {
    title: "Conta protegida",
    description: "Seus pedidos e numeros ficam organizados em uma area pessoal com acesso seguro.",
    icon: LockKeyhole,
  },
  {
    title: "Resultado transparente",
    description: "Vencedores, live e comprovacoes podem ser publicados com clareza apos o sorteio.",
    icon: ShieldCheck,
  },
  {
    title: "Fluxo simples",
    description: "Escolha numeros, reserve em poucos passos e acompanhe tudo sem complicacao.",
    icon: Sparkles,
  },
];

const steps = [
  {
    title: "Escolha uma campanha ativa",
    description: "Veja premio, valor por numero, disponibilidade e data do sorteio.",
  },
  {
    title: "Selecione seus numeros",
    description: "Use selecao manual ou rapida para montar seu pedido em segundos.",
  },
  {
    title: "Confirme e acompanhe",
    description: "Sua reserva fica vinculada a conta e o status pode ser acompanhado depois.",
  },
];

const faqs = [
  {
    question: "Como funciona a reserva dos numeros?",
    answer:
      "Depois de escolher os numeros e confirmar seus dados, a plataforma cria um pedido e segura a reserva por tempo limitado para voce finalizar a participacao.",
  },
  {
    question: "Consigo acompanhar meus pedidos depois?",
    answer:
      "Sim. Seus pedidos, numeros reservados e comprovacoes ficam organizados na sua area do participante.",
  },
  {
    question: "Como sei que o resultado foi divulgado corretamente?",
    answer:
      "Quando o organizador publicar o resultado, a plataforma pode exibir vencedores, links da live e comprovacoes da apuracao.",
  },
  {
    question: "Preciso falar com alguem para participar?",
    answer:
      "Nao. O fluxo foi desenhado para ser direto, mas voce tambem pode usar os canais de suporte exibidos pela plataforma sempre que precisar.",
  },
];

export default async function HomePage() {
  const [catalog, settings] = await Promise.all([
    getPublicRaffleCatalog({ limit: 6 }),
    getPublicPlatformSettings(),
  ]);
  const { raffles, prizeSummaries, metricsByRaffleId } = catalog;
  const featuredRaffle =
    raffles.find((raffle) => raffle.featured) ?? raffles[0] ?? null;
  const activeRaffles = featuredRaffle
    ? raffles.filter((raffle) => raffle.id !== featuredRaffle.id)
    : raffles;

  const winnersByRaffle = await Promise.all(
    raffles.slice(0, 4).map(async (raffle) => {
      const result = await getPublicManualResultsForRaffle({
        id: raffle.id,
        title: raffle.title,
        slug: raffle.slug,
        main_image_url: raffle.main_image_url,
        status: raffle.status,
        draw_date: raffle.draw_date,
      });

      return result.data?.published ? result.data.winners.slice(0, 2) : [];
    }),
  );

  const winners = winnersByRaffle.flat().slice(0, 4);
  const featuredMetrics = featuredRaffle
    ? metricsByRaffleId[featuredRaffle.id]
    : null;

  const heroStats = featuredRaffle && featuredMetrics
    ? [
        {
          label: "Valor do numero",
          value: formatCurrency(featuredRaffle.price_per_number),
          icon: Ticket,
        },
        {
          label: "Restantes",
          value: featuredMetrics.remaining.toLocaleString("pt-BR"),
          icon: BadgeCheck,
        },
        {
          label: "Sorteio",
          value: formatDate(featuredRaffle.draw_date),
          icon: CalendarClock,
        },
        {
          label: "Participantes",
          value: featuredMetrics.occupied.toLocaleString("pt-BR"),
          icon: Users,
        },
      ]
    : [
        {
          label: "Fluxo guiado",
          value: "Compra simples",
          icon: TicketCheck,
        },
        {
          label: "Conta segura",
          value: "Acesso protegido",
          icon: LockKeyhole,
        },
        {
          label: "Resultado",
          value: "Publicado com clareza",
          icon: Trophy,
        },
        {
          label: "Suporte",
          value: settings.support_email ? "Canal ativo" : "Disponivel",
          icon: Headset,
        },
      ];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border/80">
        <Image
          src={
            featuredRaffle?.main_image_url ??
            settings.hero_banner_url ??
            "/images/hero-raffle-premium.png"
          }
          alt={`Banner principal de ${settings.platform_name}`}
          fill
          priority
          className="object-cover object-center opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_30%),linear-gradient(135deg,rgba(6,8,8,0.90),rgba(8,16,14,0.88)_38%,rgba(5,7,6,0.96))]" />
        <div className="premium-grid absolute inset-0 opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <Badge variant="success">Plataforma premium de rifas online</Badge>
              <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Participe com rapidez, clareza e mais confianca em cada numero escolhido.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {settings.platform_subtitle} Veja campanhas abertas, reserve seus
                numeros em poucos passos e acompanhe tudo em uma area pessoal.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={featuredRaffle ? `/rifas/${featuredRaffle.slug}` : "/rifas"}
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full sm:w-auto",
                  })}
                >
                  Comprar agora
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/rifas"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "lg",
                    className: "w-full sm:w-auto",
                  })}
                >
                  Ver campanhas
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {heroStats.map((item) => (
                  <Card key={item.label} className="border-border/80 bg-card/74 p-4">
                    <item.icon className="size-5 text-primary" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {item.label}
                    </p>
                    <p className="mt-2 text-base font-bold text-foreground">
                      {item.value}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border-primary/20 bg-card/88 p-5 sm:p-6">
              {featuredRaffle ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="default">Campanha em destaque</Badge>
                    <span className="text-sm font-semibold text-accent">
                      {formatCurrency(featuredRaffle.price_per_number)}
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)]">
                    {featuredRaffle.main_image_url ? (
                      <Image
                        src={featuredRaffle.main_image_url}
                        alt={featuredRaffle.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 40vw, 100vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-background/60 text-sm text-muted">
                        Imagem principal em breve
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {featuredRaffle.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      {featuredRaffle.short_description}
                    </p>
                  </div>

                  {featuredMetrics ? (
                    <div className="rounded-[var(--radius-md)] border border-primary/20 bg-primary/[0.06] p-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-foreground">
                          {featuredMetrics.occupied.toLocaleString("pt-BR")} numeros ja escolhidos
                        </span>
                        <span className="font-semibold text-accent">
                          {Math.round(featuredMetrics.progress * 100)}% ocupada
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary via-info to-accent"
                          style={{ width: `${Math.min(featuredMetrics.progress * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href={`/rifas/${featuredRaffle.slug}`}
                      className={buttonVariants({ size: "lg", className: "w-full sm:col-span-2" })}
                    >
                      Escolher numeros
                    </Link>
                    <Link
                      href={`/rifas/${featuredRaffle.slug}`}
                      className={buttonVariants({ variant: "secondary", className: "w-full" })}
                    >
                      Ver detalhes
                    </Link>
                    <Link
                      href="#como-funciona"
                      className={buttonVariants({ variant: "outline", className: "w-full" })}
                    >
                      Como funciona
                    </Link>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Campanha em preparacao"
                  description="Assim que uma campanha for publicada, ela aparecera em destaque aqui com CTA direto para participacao."
                />
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-border/80 bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Campanhas abertas"
            title="Escolha uma campanha e avance para a compra sem friccao."
            description="Cards mais claros, foco no premio, escassez visivel e CTA forte para ajudar o publico leigo a decidir com seguranca."
            action={
              <Link href="/rifas" className={buttonVariants({ variant: "outline" })}>
                Ver todas
              </Link>
            }
          />

          {raffles.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {(featuredRaffle ? [featuredRaffle, ...activeRaffles] : activeRaffles)
                .slice(0, 6)
                .map((raffle) => (
                  <PublicRaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    prizeSummary={prizeSummaries[raffle.id]}
                    metrics={metricsByRaffleId[raffle.id]}
                  />
                ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                title="Nenhuma campanha ativa publicada"
                description="Novas campanhas aparecerao aqui assim que forem abertas para participacao."
                action={
                  <Link href="/rifas" className={buttonVariants({ variant: "secondary" })}>
                    Ver vitrine publica
                  </Link>
                }
              />
            </div>
          )}
        </div>
      </section>

      <section id="como-funciona" className="border-b border-border/80 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Como funciona"
            title="Participar precisa ser simples do primeiro clique ate o acompanhamento do pedido."
            description="O fluxo foi desenhado para guiar quem nunca comprou uma rifa online, com menos hesitacao e mais clareza."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="p-5 sm:p-6">
                <div className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] border border-accent/35 bg-accent/16 text-sm font-bold text-accent-foreground">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {step.description}
                </p>
                <CheckCircle2 className="mt-5 size-5 text-primary" />
              </Card>
            ))}
          </div>

          <Alert
            tone="success"
            title="Fluxo direto para compra"
            description="Escolha a campanha, selecione os numeros, confirme seus dados e acompanhe seu pedido sem depender de atendimento manual."
            className="mt-8"
            action={
              <Link href="/rifas" className={buttonVariants({ size: "sm" })}>
                Ver campanhas abertas
              </Link>
            }
          />
        </div>
      </section>

      <section className="border-b border-border/80 bg-surface/35 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Por que confiar"
            title="A plataforma foi organizada para transmitir seguranca antes, durante e depois da participacao."
            description="Mais clareza no processo reduz duvida, melhora conversao e reforca credibilidade para o publico."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {trustItems.map((item) => (
              <Card key={item.title} className="p-5 sm:p-6">
                <item.icon className="size-5 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/80 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Ganhadores"
            title="Resultados publicados ajudam a reforcar confianca na experiencia."
            description="Quando disponiveis, os vencedores publicados aparecem com premio, numero sorteado e referencias da divulgacao."
          />

          {winners.length > 0 ? (
            <div className="mt-8 grid gap-4">
              {winners.map((winner) => (
                <PublicWinnerCard key={winner.winner_id} winner={winner} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                title="Ganhadores serao exibidos aqui"
                description="Assim que o organizador publicar resultados oficiais, esta area passa a funcionar como prova social da plataforma."
              />
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-border/80 bg-surface/35 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Perguntas comuns de quem esta participando pela primeira vez."
            description="Respostas curtas, diretas e pensadas para reduzir inseguranca antes da compra."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.question} className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <CircleHelp className="mt-0.5 size-5 shrink-0 text-accent" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {faq.question}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="p-6 sm:p-8">
              <Badge variant="info">Suporte</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                Precisa de ajuda antes de participar?
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Os canais abaixo ajudam a resolver duvidas sobre campanhas, participacao e acompanhamento dos pedidos.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <StatCard
                  label="Suporte por e-mail"
                  value={settings.support_email ?? "Consulte sua campanha"}
                  hint="Canal indicado para atendimento e orientacoes."
                  icon={Headset}
                />
                <StatCard
                  label="WhatsApp"
                  value={settings.whatsapp_number ?? "Disponivel conforme campanha"}
                  hint="Contato rapido quando informado pelo organizador."
                  icon={MessageCircleHeart}
                />
              </div>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.12] via-card to-accent/[0.10] p-6 sm:p-8">
              <Badge variant="success">CTA final</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                Encontre uma campanha aberta e avance para a compra agora.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Quanto menos atrito no primeiro passo, maior a chance de concluir a participacao. Por isso os CTAs principais te levam direto para campanhas abertas.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={featuredRaffle ? `/rifas/${featuredRaffle.slug}` : "/rifas"}
                  className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}
                >
                  Comprar agora
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/rifas"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "lg",
                    className: "w-full sm:w-auto",
                  })}
                >
                  Ver campanhas
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Compra guiada", "menos duvida"],
                  ["Conta protegida", "mais confianca"],
                  ["Resultado claro", "mais transparencia"],
                ].map(([title, subtitle]) => (
                  <div
                    key={title}
                    className={cn(
                      "rounded-[var(--radius-md)] border border-border/75 bg-card/70 p-4",
                    )}
                  >
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="mt-2 text-sm text-muted">{subtitle}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
