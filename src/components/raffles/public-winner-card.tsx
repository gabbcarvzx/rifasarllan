import Image from "next/image";
import { ExternalLink, Medal, TicketCheck } from "lucide-react";
import { ImagePlaceholder } from "@/components/media/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { PublicManualResultRow } from "@/types/database";

export function PublicWinnerCard({
  winner,
}: {
  winner: PublicManualResultRow;
}) {
  return (
    <Card className="overflow-hidden bg-black/14">
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden bg-black/20 md:aspect-auto md:min-h-56">
          {winner.prize_image_url ? (
            <Image
              src={winner.prize_image_url}
              alt={winner.prize_title}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 220px, 100vw"
            />
          ) : (
            <ImagePlaceholder
              title="Premio confirmado"
              description="Imagem nao publicada."
              className="h-full rounded-none border-0"
            />
          )}
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{winner.prize_position}o premio</Badge>
            <span className="text-xs text-muted">
              Publicado em {formatDateTime(winner.published_at)}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-bold text-foreground">
            {winner.prize_title}
          </h3>
          {winner.prize_description ? (
            <p className="mt-2 text-sm leading-6 text-muted">
              {winner.prize_description}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-primary/25 bg-primary/10 p-4">
              <TicketCheck className="size-5 text-primary" />
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">
                Numero vencedor
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                {winner.number}
              </p>
            </div>
            <div className="rounded-lg border border-accent/25 bg-accent/10 p-4">
              <Medal className="size-5 text-accent" />
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">
                Vencedor
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {winner.winner_name}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted">
            Sorteado em {formatDateTime(winner.drawn_at)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {winner.instagram_live_url ? (
              <a
                href={winner.instagram_live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-white/[0.11]"
              >
                <ExternalLink className="size-4" />
                Assistir live
              </a>
            ) : null}
            {winner.proof_url ? (
              <a
                href={winner.proof_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-white/[0.11]"
              >
                <ExternalLink className="size-4" />
                Ver comprovacao
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
