import { Radio, ShieldCheck, Trophy } from "lucide-react";
import { PublicWinnerCard } from "@/components/raffles/public-winner-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PublicManualResults } from "@/types/manual-results";

export function PublicResultSection({ data }: { data: PublicManualResults }) {
  if (!data.published) {
    return (
      <Card className="p-6 text-center sm:p-10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-muted">
          <Trophy className="size-5" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-foreground">
          Resultado ainda nao divulgado.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
          O administrador publicara os vencedores depois da conferencia do
          sorteio realizado ao vivo.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="border-primary/25 bg-primary/[0.08] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
              <Radio className="size-4" />
            </div>
            <div>
              <Badge variant="success">Resultado oficial</Badge>
              <h2 className="mt-3 text-xl font-bold text-foreground">
                Sorteio realizado ao vivo no Instagram.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Os dados abaixo foram registrados manualmente pelo administrador
                apos a live.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-muted">
            <ShieldCheck className="size-4 text-primary" />
            {data.winners.length} vencedor
            {data.winners.length === 1 ? "" : "es"}
          </span>
        </div>
      </Card>

      <div className="grid gap-4">
        {data.winners.map((winner) => (
          <PublicWinnerCard key={winner.winner_id} winner={winner} />
        ))}
      </div>
    </div>
  );
}
