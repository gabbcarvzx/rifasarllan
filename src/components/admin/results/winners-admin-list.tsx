"use client";

import { ExternalLink, Pencil, Phone, Trash2, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { AdminManualWinner } from "@/types/manual-results";

type WinnersAdminListProps = {
  winners: AdminManualWinner[];
  deleteAction: (formData: FormData) => void;
  isDeleting: boolean;
  onEdit: (winner: AdminManualWinner) => void;
};

function numberStatusLabel(status: AdminManualWinner["numberStatus"]) {
  return {
    paid: "Pago",
    reserved: "Reservado",
    available: "Disponivel",
    cancelled: "Cancelado",
  }[status];
}

function numberStatusVariant(status: AdminManualWinner["numberStatus"]) {
  if (status === "paid") return "success" as const;
  if (status === "reserved") return "warning" as const;
  if (status === "cancelled") return "danger" as const;
  return "muted" as const;
}

export function WinnersAdminList({
  winners,
  deleteAction,
  isDeleting,
  onEdit,
}: WinnersAdminListProps) {
  if (winners.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-black/12 px-5 py-10 text-center">
        <Trophy className="mx-auto size-7 text-accent" />
        <h3 className="mt-4 font-semibold text-foreground">
          Nenhum vencedor registrado
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
          Depois da live, associe cada premio ao numero sorteado e confira o
          status do participante antes de publicar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {winners.map((winner) => (
        <Card key={winner.id} className="bg-black/14 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/12 font-mono text-sm font-bold text-accent">
                {winner.number}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">
                    {winner.prize?.position ?? "-"}o premio
                  </Badge>
                  <Badge variant={numberStatusVariant(winner.numberStatus)}>
                    {numberStatusLabel(winner.numberStatus)}
                  </Badge>
                  <Badge variant={winner.published ? "success" : "muted"}>
                    {winner.published ? "Publicado" : "Oculto"}
                  </Badge>
                </div>
                <h3 className="mt-2 truncate font-semibold text-foreground">
                  {winner.winner_name}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {winner.prize?.title ?? "Premio removido"} · registrado em{" "}
                  {formatDateTime(winner.drawn_at)}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                  {winner.winner_phone ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      {winner.winner_phone}
                    </span>
                  ) : null}
                  {winner.instagram_live_url ? (
                    <a
                      href={winner.instagram_live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-info hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      Abrir live
                    </a>
                  ) : null}
                  {winner.proof_url ? (
                    <a
                      href={winner.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-info hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      Ver comprovacao
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onEdit(winner)}
              >
                <Pencil className="size-4" />
                Editar
              </Button>
              <form action={deleteAction}>
                <input type="hidden" name="winnerId" value={winner.id} />
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={isDeleting}
                >
                  <Trash2 className="size-4" />
                  Excluir
                </Button>
              </form>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
