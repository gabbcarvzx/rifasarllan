import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  CalendarDays,
  CircleCheck,
  ExternalLink,
  Radio,
  ShieldCheck,
  Ticket,
  Trophy,
  UserCheck,
} from "lucide-react";
import { getPublicManualResultsForRaffle } from "@/app/actions/manual-results";
import { getPublicRaffleNumbers } from "@/app/actions/raffle-numbers";
import { getPublicRafflePrizes } from "@/app/actions/prizes";
import { getPublicRaffleImages } from "@/app/actions/raffle-media";
import { RaffleStatusBadge } from "@/components/admin/raffles/raffle-status-badge";
import { CopyLinkButton } from "@/components/raffles/copy-link-button";
import { NumberGrid } from "@/components/raffles/number-grid";
import { PublicRaffleGallery } from "@/components/raffles/public-raffle-gallery";
import { PublicPrizesSection } from "@/components/raffles/public-prizes-section";
import { ShareRaffleButton } from "@/components/raffles/share-raffle-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAuthContext,
  hasSupabaseSessionCookie,
} from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
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

  return {
    title: raffle ? raffle.title : "Rifa",
    description: raffle?.short_description ?? undefined,
  };
}

const participationSteps = [
  {
    title: "Escolha seus numeros",
    description: "Use filtros e busca para montar sua selecao na grade.",
  },
  {
    title: "Confirme seus dados",
    description: "Entre na sua conta e reserve os numeros por 15 minutos.",
  },
  {
    title: "Acompanhe pela conta",
    description: "Consulte pedido, prazo e situacao dos numeros reservados.",
  },
] as const;

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
    raffleNumbers,
    authContext,
    settings,
    result,
  ] = await Promise.all([
    getPublicRaffleImages(raffle.id),
    getPublicRafflePrizes(raffle.id),
    getPublicRaffleNumbers(raffle.id),
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

          <Card className="p-5 sm:p-6 lg:sticky lg:top-24">
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

            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-primary/20 bg-primary/[0.07] p-3">
                <Ticket className="size-4 text-primary" />
                <p className="mt-3 text-xs text-muted">Por numero</p>
                <p className="mt-1 text-sm font-bold text-foreground sm:text-base">
                  {formatCurrency(raffle.price_per_number)}
                </p>
              </div>
              <div className="rounded-lg border border-accent/20 bg-accent/[0.07] p-3">
                <CalendarDays className="size-4 text-accent" />
                <p className="mt-3 text-xs text-muted">Sorteio</p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {formatDate(raffle.draw_date)}
                </p>
              </div>
              <div className="rounded-lg border border-info/20 bg-info/[0.07] p-3">
                <ShieldCheck className="size-4 text-info" />
                <p className="mt-3 text-xs text-muted">Numeros</p>
                <p className="mt-1 text-sm font-bold text-foreground sm:text-base">
                  {raffle.total_numbers.toLocaleString("pt-BR")}
                </p>
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

            <div className="mt-5 flex items-start gap-3 border-t border-white/10 pt-5">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-muted">
                Selecao visual, reserva vinculada a sua conta e resultado
                publicado pelo organizador depois da live.
              </p>
            </div>
          </Card>
        </div>

        <PublicPrizesSection prizes={prizes} />

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-white/10 bg-black/14 p-5 sm:p-6">
            <Badge variant="info">Como participar</Badge>
            <h2 className="mt-4 text-2xl font-bold text-foreground">
              Da escolha ao acompanhamento
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {participationSteps.map((step, index) => (
                <div key={step.title}>
                  <span className="flex size-8 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 font-mono text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-accent/[0.06] p-5 sm:p-6">
            <Radio className="size-5 text-accent" />
            <h2 className="mt-4 text-xl font-bold text-foreground">
              Sorteio ao vivo no Instagram
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              A apuracao e realizada externamente pelo organizador. Depois da
              live, os vencedores e links de comprovacao podem ser publicados
              nesta plataforma.
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
            <h2 className="text-xl font-bold text-foreground">Sobre a rifa</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
              {raffle.description || "Os detalhes completos serao publicados pelo organizador."}
            </p>
          </Card>
          <Card className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-foreground">Regras</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
              {raffle.rules || "Consulte o organizador para confirmar as regras desta campanha."}
            </p>
          </Card>
        </div>

        <section className="grid gap-4 border-y border-white/10 py-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Numeros rastreaveis
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                A grade mostra disponibilidade, reservas e numeros vendidos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UserCheck className="mt-0.5 size-5 shrink-0 text-info" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Historico na conta
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                Pedidos e numeros ficam organizados para o participante.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Trophy className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Resultado transparente
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                O organizador publica vencedores e evidencias da live.
              </p>
            </div>
          </div>
        </section>

        <div id="escolher-numeros" className="scroll-mt-24">
          <NumberGrid
            raffleId={raffle.id}
            raffleSlug={raffle.slug}
            numbers={raffleNumbers}
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
