import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Trophy } from "lucide-react";
import { getPublicManualResults } from "@/app/actions/manual-results";
import { PublicResultSection } from "@/components/raffles/public-result-section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type ResultadoPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ResultadoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicManualResults(slug);

  return {
    title: result.data ? `Resultado - ${result.data.raffle.title}` : "Resultado",
    description: result.data
      ? `Confira o resultado publicado da rifa ${result.data.raffle.title}.`
      : undefined,
    openGraph: result.data
      ? {
          title: `Resultado - ${result.data.raffle.title}`,
          description: `Confira o resultado publicado da rifa ${result.data.raffle.title}.`,
          images: result.data.raffle.main_image_url
            ? [{ url: result.data.raffle.main_image_url }]
            : undefined,
        }
      : undefined,
  };
}

export default async function ResultadoPublicoPage({
  params,
}: ResultadoPageProps) {
  const { slug } = await params;
  const result = await getPublicManualResults(slug);

  if (!result.data) notFound();

  const { raffle } = result.data;

  return (
    <section className="bg-surface/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={`/rifas/${raffle.slug}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          Voltar para a rifa
        </Link>

        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[300px_1fr]">
            <div className="relative aspect-[16/10] overflow-hidden bg-black/20 md:aspect-auto md:min-h-72">
              {raffle.main_image_url ? (
                <Image
                  src={raffle.main_image_url}
                  alt={raffle.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 768px) 300px, 100vw"
                />
              ) : (
                <div className="flex h-full min-h-56 items-center justify-center bg-white/[0.03] text-accent">
                  <Trophy className="size-10" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8">
              <Badge variant={result.data.published ? "success" : "muted"}>
                {result.data.published ? "Resultado publicado" : "Aguardando resultado"}
              </Badge>
              <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                {raffle.title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted">
                Registro oficial dos vencedores informados pelo administrador
                apos o sorteio externo.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm text-muted">
                <CalendarDays className="size-4 text-accent" />
                Data prevista: {formatDate(raffle.draw_date)}
              </div>
            </div>
          </div>
        </Card>

        <PublicResultSection data={result.data} />
      </div>
    </section>
  );
}
