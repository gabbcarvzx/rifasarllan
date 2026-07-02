import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  CalendarDays,
  CircleCheck,
  Clock3,
  ExternalLink,
  LockKeyhole,
  Radio,
  ScrollText,
  ShieldCheck,
  Ticket,
  Trophy,
  UserCheck,
} from "lucide-react";
import { getPublicManualResultsForRaffle } from "@/app/actions/manual-results";
import {
  getPublicRaffleNumberPage,
  getPublicRaffleNumberStats,
} from "@/app/actions/raffle-numbers";
import { getPublicRafflePrizes } from "@/app/actions/prizes";
import { getPublicRaffleImages } from "@/app/actions/raffle-media";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { CopyLinkButton } from "@/components/raffles/copy-link-button";
import { NumberGrid } from "@/components/raffles/number-grid";
import { PublicRaffleGallery } from "@/components/raffles/public-raffle-gallery";
import { PublicPrizesSection } from "@/components/raffles/public-prizes-section";
import { ShareRaffleButton } from "@/components/raffles/share-raffle-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatCard } from "@/components/ui/stat-card";
import {
  getAuthContext,
  hasSupabaseSessionCookie,
} from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPublicCampaignMetrics } from "@/lib/raffles/public-campaign-metrics";
import { getPublicPlatformSettings } from "@/lib/platform-settings/public";
import { getPublicRaffleBySlug } from "@/lib/raffles/public-queries";
import { buildRaffleShareText } from "@/lib/sharing/raffle";

export const dynamic = "force-dynamic";

type RifaPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: RifaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const raffle = await getPublicRaffleBySlug(slug);
  const title = raffle ? raffle.title : "Rifa";
  const description = raffle?.short_description ?? raffle?.description ?? undefined;

  return {
    title,
    description,
    openGraph: raffle
      ? {
          type: "article",
          title,
          description,
          images: raffle.main_image_url ? [{ url: raffle.main_image_url }] : undefined,
        }
      : undefined,
    twitter: raffle
      ? {
          card: "summary_large_image",
          title,
          description,
          images: raffle.main_image_url ? [raffle.main_image_url] : undefined,
        }
      : undefined,
  };
}

const participationSteps = [
  {
    title: "Defina a quantidade ideal",
    description: "Use atalhos de quantidade ou escolha numero por numero na grade.",
  },
  {
    title: "Monte sua selecao",
    description: "A interface destaca disponiveis, reservados e vendidos para evitar confusao.",
  },
  {
    title: "Confirme seus dados",
    description: "A reserva fica vinculada a sua conta para acompanhamento do pedido.",
  },
] as const;

const campaignFaqs = [
  {
    question: "Preciso escolher todos os numeros manualmente?",
    answer:
      "Nao. A campanha oferece atalhos de quantidade e escolha automatica para acelerar a participacao sem alterar as regras da reserva.",
  },
  {
    question: "Os numeros ficam reservados por quanto tempo?",
    answer:
      "Depois da confirmacao dos seus dados, a reserva segue o prazo configurado pela plataforma, mantendo o pedido vinculado a sua conta.",
  },
  {
    question: "Consigo revisar meus numeros antes de continuar?",
    answer:
      "Sim. O resumo da compra atualiza em tempo real e mostra quantidade, total estimado e os numeros selecionados.",
  },
  {
    question: "Onde vejo o regulamento da campanha?",
    answer:
      "O regulamento fica na propria pagina da campanha, junto da descricao e das informacoes de confianca da participacao.",
  },
];

export default async function RifaDetalhePage({ params }: RifaPageProps) {
  const { slug } = await params;
  const raffle = await getPublicRaffleBySlug(slug);

  if (!raffle) notFound();

  const authContextPromise = hasSupabaseSessionCookie().then((hasSession) => {
    return hasSession
      ? getAuthContext()
      : Promise.resolve({ user: null, profile: null });
  });

  const [
    galleryImages,
    prizes,
    raffleNumbersPage,
    raffleNumberStats,
    authContext,
    settings,
    result,
  ] = await Promise.all([
    getPublicRaffleImages(raffle.id),
    getPublicRafflePrizes(raffle.id),
    getPublicRaffleNumberPage({ raffleId: raffle.id }),
    getPublicRaffleNumberStats(raffle.id),
    authContextPromise,
    getPublicPlatformSettings(),
    getPublicManualResultsForRaffle({
      id: raffle.id,
      title: raffle.title,
      slug: raffle.slug,
      main_image_url: raffle.main_image_url,
      status: raffle.status,
      draw_date: raffle.draw_date,
    }),
  ]);

  const customerDefaults = {
    name:
      authContext.profile?.full_name ??
      (typeof authContext.user?.user_metadata?.full_name === "string"
        ? authContext.user.user_metadata.full_name
        : ""),
    email: authContext.profile?.email ?? authContext.user?.email ?? "",
    phone:
      authContext.profile?.phone ??
      (typeof authContext.user?.user_metadata?.phone === "string"
        ? authContext.user.user_metadata.phone
        : ""),
  };

  const shareText = buildRaffleShareText({
    platformName: settings.platform_name,
    raffleTitle: raffle.title,
    priceLabel: formatCurrency(raffle.price_per_number),
    drawDateLabel: formatDate(raffle.draw_date),
  });
  const hasPublishedResult = Boolean(result.data?.published);
  const metrics = getPublicCampaignMetrics({
    totalNumbers: raffle.total_numbers,
    available: raffleNumberStats.available,
    reserved: raffleNumberStats.reserved,
    paid: raffleNumberStats.paid,
  });

  return (
    <section className="bg-surface/30 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <PublicRaffleGallery
            title={raffle.title}
            mainImageUrl={raffle.main_image_url}
            galleryImages={galleryImages}
            featured={raffle.featured}
            statusBadge={<RaffleStatusBadge status={raffle.status} />}
          />

          <Card className="overflow-hidden p-5 sm:p-6 lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">Participacao aberta</Badge>
              {raffle.featured ? <Badge variant="default">Destaque</Badge> : null}
            </div>
            <h1 className="mt-5 text-3xl font-bold text-foreground sm:text-4xl">
              {raffle.title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              {raffle.short_description}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatCard
                label="Por numero"
                value={formatCurrency(raffle.price_per_number)}
                hint="Valor unitario da participacao"
                icon={Ticket}
              />
              <StatCard
                label="Sorteio"
                value={formatDate(raffle.draw_date)}
                hint="Data prevista da campanha"
                icon={CalendarDays}
              />
              <StatCard
                label="Restantes"
                value={metrics.remaining.toLocaleString("pt-BR")}
                hint="Quanto antes escolher, menos disputa"
                icon={Clock3}
              />
              <StatCard
                label="Ja escolhidos"
                value={metrics.occupied.toLocaleString("pt-BR")}
                hint="Numeros reservados ou vendidos"
                icon={UserCheck}
              />
            </div>

            <div className="mt-5 rounded-[var(--radius-lg)] border border-primary/20 bg-primary/[0.06] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  Andamento da campanha
                </p>
                <span className="text-sm font-semibold text-accent">
                  {Math.round(metrics.progress * 100)}% ocupado
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-info to-accent"
                  style={{ width: `${Math.min(metrics.progress * 100, 100)}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted">Vendidos</p>
                  <p className="font-semibold text-foreground">
                    {metrics.sold.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Reservados</p>
                  <p className="font-semibold text-foreground">
                    {metrics.reserved.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Disponiveis</p>
                  <p className="font-semibold text-foreground">
                    {metrics.available.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>

            <a
              href="#escolher-numeros"
              className={buttonVariants({ className: "mt-6 w-full", size: "lg" })}
            >
              Escolher meus numeros
              <ArrowDown className="size-4" />
            </a>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <ShareRaffleButton shareText={shareText} />
              <CopyLinkButton />
            </div>

            {hasPublishedResult ? (
              <Link
                href={`/rifas/${raffle.slug}/resultado`}
                className={buttonVariants({
                  variant: "outline",
                  className: "mt-3 w-full",
                })}
              >
                <Trophy className="size-4" />
                Ver resultado publicado
              </Link>
            ) : null}

            <Alert
              tone="success"
              title="Compra orientada para reduzir abandono"
              description="Tudo o que voce precisa para participar esta nesta pagina: premio, regras, disponibilidade, selecao e resumo da compra."
              className="mt-5"
            />
          </Card>
        </div>

        <PublicPrizesSection prizes={prizes} />

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[var(--radius-lg)] border border-border/80 bg-card/78 p-5 sm:p-6">
            <SectionHeading
              eyebrow="Como comprar"
              title="Da escolha ao pedido sem confusao."
              description="Cada etapa foi reorganizada para ajudar quem quer decidir mais rapido no mobile e no desktop."
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {participationSteps.map((step, index) => (
                <div key={step.title}>
                  <span className="flex size-9 items-center justify-center rounded-[var(--radius-sm)] border border-primary/25 bg-primary/12 font-mono text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-muted">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-accent/20 bg-accent/[0.06] p-5 sm:p-6">
            <Radio className="size-5 text-accent" />
            <h2 className="mt-4 text-xl font-bold text-foreground">
              Sorteio ao vivo e resultado publicado
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              A apuracao e feita externamente pelo organizador. Quando disponivel, a plataforma exibe resultado, links da live e comprovacoes para reforcar a transparencia.
            </p>
            {settings.instagram_url ? (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({
                  variant: "secondary",
                  className: "mt-5 w-full sm:w-fit",
                })}
              >
                Abrir Instagram
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ScrollText className="size-5 text-accent" />
              <h2 className="text-xl font-bold text-foreground">Sobre a campanha</h2>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
              {raffle.description || "Os detalhes completos serao publicados pelo organizador."}
            </p>
          </Card>
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Regulamento</h2>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
              {raffle.rules || "Consulte o organizador para confirmar as regras desta campanha."}
            </p>
          </Card>
        </div>

        <section className="grid gap-4 border-y border-border/80 py-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Numeros rastreaveis
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                A grade mostra disponibilidade, reservas e numeros vendidos para evitar erro na escolha.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-info" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Pedido vinculado a conta
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                Sua reserva fica ligada ao seu acesso para acompanhamento posterior na area do participante.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Compra mais clara
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                O resumo acompanha a selecao em tempo real para reduzir abandono antes da reserva.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {campaignFaqs.map((faq) => (
            <Card key={faq.question} className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">{faq.question}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
            </Card>
          ))}
        </section>

        <div id="escolher-numeros" className="scroll-mt-24">
          <NumberGrid
            raffleId={raffle.id}
            raffleSlug={raffle.slug}
            initialPage={raffleNumbersPage}
            stats={raffleNumberStats}
            pricePerNumber={raffle.price_per_number}
            minNumber={raffle.min_number}
            maxNumber={raffle.max_number}
            customerDefaults={customerDefaults}
          />
        </div>
      </div>
    </section>
  );
}
