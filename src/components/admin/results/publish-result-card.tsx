"use client";

import Link from "next/link";
import { Eye, EyeOff, Radio, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { AdminManualWinner } from "@/types/manual-results";

type PublishResultCardProps = {
  raffleId: string;
  raffleSlug: string;
  winners: AdminManualWinner[];
  publishAction: (formData: FormData) => void;
  unpublishAction: (formData: FormData) => void;
  isPublishing: boolean;
  isUnpublishing: boolean;
};

export function PublishResultCard({
  raffleId,
  raffleSlug,
  winners,
  publishAction,
  unpublishAction,
  isPublishing,
  isUnpublishing,
}: PublishResultCardProps) {
  const publishedWinners = winners.filter((winner) => winner.published);
  const isPublished = publishedWinners.length > 0;
  const isFullyPublished =
    winners.length > 0 && publishedWinners.length === winners.length;
  const publishedAt = publishedWinners
    .map((winner) => winner.published_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <Card className="bg-black/14 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-primary" />
            <h3 className="font-semibold text-foreground">Publicacao</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            A publicacao libera somente os dados seguros do resultado. Telefone
            e observacoes continuam restritos ao admin.
          </p>
        </div>
        <Badge variant={isFullyPublished ? "success" : isPublished ? "warning" : "muted"}>
          {isFullyPublished
            ? "Publicado"
            : isPublished
              ? "Publicacao parcial"
              : "Nao publicado"}
        </Badge>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/18 p-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Vencedores cadastrados</span>
          <strong className="text-foreground">{winners.length}</strong>
        </div>
        {publishedAt ? (
          <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/10 pt-3">
            <span className="text-muted">Ultima publicacao</span>
            <strong className="text-right text-foreground">
              {formatDateTime(publishedAt)}
            </strong>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {!isFullyPublished ? (
          <form action={publishAction}>
            <input type="hidden" name="raffleId" value={raffleId} />
            <Button
              type="submit"
              disabled={isPublishing || winners.length === 0}
              className="w-full sm:w-auto"
            >
              <Send className="size-4" />
              {isPublishing
                ? "Publicando..."
                : isPublished
                  ? "Atualizar publicacao"
                  : "Publicar resultado"}
            </Button>
          </form>
        ) : null}

        {isPublished ? (
          <form action={unpublishAction}>
            <input type="hidden" name="raffleId" value={raffleId} />
            <Button
              type="submit"
              variant="danger"
              disabled={isUnpublishing}
              className="w-full sm:w-auto"
            >
              <EyeOff className="size-4" />
              {isUnpublishing ? "Ocultando..." : "Ocultar resultado"}
            </Button>
          </form>
        ) : null}

        <Link
          href={`/rifas/${raffleSlug}/resultado`}
          className={buttonVariants({ variant: "outline" })}
        >
          <Eye className="size-4" />
          Ver pagina publica
        </Link>
      </div>
    </Card>
  );
}
