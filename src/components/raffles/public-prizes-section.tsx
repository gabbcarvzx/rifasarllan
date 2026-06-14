import Image from "next/image";
import { Gift, PackageCheck, Trophy } from "lucide-react";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { RafflePrize } from "@/types/database";

type PublicPrizesSectionProps = {
  prizes: RafflePrize[];
};

function formatPrizePosition(position: number) {
  return `${position}o Premio`;
}

export function PublicPrizesSection({ prizes }: PublicPrizesSectionProps) {
  if (prizes.length === 0) {
    return (
      <EmptyState
        icon={Gift}
        title="Premiacao em atualizacao"
        description="O organizador ainda nao publicou os detalhes dos premios desta campanha. Confira novamente antes de reservar."
        className="min-h-64"
      />
    );
  }

  return (
    <section className="border-y border-white/10 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="default">Premios</Badge>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Conheca a premiacao
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Confira a ordem de premiacao, imagens e detalhes cadastrados pelo
            admin.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted">
          <Gift className="size-3.5 text-accent" />
          {prizes.length} premio{prizes.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {prizes.map((prize, index) => (
          <article
            key={prize.id}
            className={cn(
              "overflow-hidden rounded-lg border bg-black/18",
              index === 0
                ? "border-accent/30 md:col-span-2 md:grid md:grid-cols-[0.9fr_1.1fr]"
                : "border-white/10",
            )}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-black/20 md:min-h-56">
              {prize.image_url ? (
                <Image
                  src={prize.image_url}
                  alt={prize.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
                />
              ) : (
                <ImagePlaceholder
                  title="Imagem em breve"
                  description="O premio ainda nao possui foto publicada."
                  className="h-full rounded-none border-0"
                />
              )}
              <div className="absolute left-3 top-3">
                <Badge variant={index === 0 ? "default" : "muted"}>
                  {formatPrizePosition(prize.position)}
                </Badge>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Trophy className="mb-3 size-5 text-accent" />
                  <h3 className="text-lg font-bold text-foreground">
                    {prize.title}
                  </h3>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/12 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                  <PackageCheck className="size-3.5" />
                  {prize.quantity}x
                </span>
              </div>
              {prize.description ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
                  {prize.description}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
