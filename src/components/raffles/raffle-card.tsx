import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Raffle } from "@/types/raffle";

const statusLabel = {
  active: "Ativa",
  draft: "Rascunho",
  paused: "Pausada",
  finished: "Encerrada",
  cancelled: "Cancelada",
};

export function RaffleCard({ raffle }: { raffle: Raffle }) {
  const progress = (raffle.soldNumbers + raffle.reservedNumbers) / raffle.totalNumbers;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={raffle.image}
          alt={raffle.title}
          fill
          className="object-cover transition duration-500 hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4">
          <Badge variant={raffle.status === "active" ? "success" : "warning"}>
            {raffle.highlight}
          </Badge>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <Badge variant="muted">{statusLabel[raffle.status]}</Badge>
            <span className="text-sm font-semibold text-accent">
              {formatCurrency(raffle.ticketPrice)}
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {raffle.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">{raffle.subtitle}</p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>{formatPercent(progress)} preenchida</span>
            <span>{raffle.totalNumbers.toLocaleString("pt-BR")} números</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-info to-accent"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-white/10 bg-black/18 p-3">
            <Ticket className="mb-2 size-4 text-primary" />
            <p className="text-muted">Vendidos</p>
            <p className="font-semibold text-foreground">
              {raffle.soldNumbers.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/18 p-3">
            <CalendarDays className="mb-2 size-4 text-accent" />
            <p className="text-muted">Data</p>
            <p className="font-semibold text-foreground">
              {new Date(`${raffle.drawDate}T12:00:00`).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <Link
          href={`/rifas/${raffle.slug}`}
          className={buttonVariants({ className: "w-full", size: "lg" })}
        >
          Ver rifa
        </Link>
      </div>
    </Card>
  );
}
