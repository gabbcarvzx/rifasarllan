"use client";

import { useState, useTransition } from "react";
import { Check, Filter, Loader2, Search, Shuffle, Ticket, X, Zap } from "lucide-react";
import {
  getPublicRaffleNumberPage,
  getPublicRandomAvailableNumbers,
  type RaffleNumberStats,
} from "@/app/actions/raffle-numbers";
import { SelectionSummary } from "@/components/raffles/selection-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  defaultRaffleNumberPageSize,
  raffleNumberPageSizeOptions,
  type RaffleNumberPage,
} from "@/lib/raffles/number-pagination";
import { cn } from "@/lib/utils";
import type {
  NumberGridStatus,
  RaffleNumberPublic,
  RaffleNumberStatus,
} from "@/types/raffle";

type NumberGridProps = {
  raffleId: string;
  raffleSlug: string;
  initialPage: RaffleNumberPage;
  stats: RaffleNumberStats;
  pricePerNumber: number;
  minNumber: number;
  maxNumber: number;
  customerDefaults?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
};

const statusLabels: Record<RaffleNumberStatus, string> = {
  available: "Disponivel",
  reserved: "Reservado",
  paid: "Vendido",
  cancelled: "Cancelado",
};

const statusStyles: Record<RaffleNumberStatus | "selected", string> = {
  available:
    "border-primary/35 bg-primary/12 text-emerald-100 hover:border-primary/70 hover:bg-primary/20",
  selected:
    "border-accent/60 bg-accent/25 text-amber-50 ring-2 ring-accent/30",
  reserved:
    "cursor-not-allowed border-info/25 bg-info/12 text-sky-100 opacity-75",
  paid: "cursor-not-allowed border-danger/25 bg-danger/14 text-rose-100 opacity-75",
  cancelled:
    "cursor-not-allowed border-white/10 bg-white/[0.04] text-muted opacity-60",
};

const statusOptions: Array<{
  value: Exclude<NumberGridStatus, "selected">;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "available", label: "Disponiveis" },
  { value: "reserved", label: "Reservados" },
  { value: "paid", label: "Vendidos" },
  { value: "cancelled", label: "Cancelados" },
];

const quickPickOptions = [5, 10, 20] as const;
const maxNumbersPerReservation = 100;

function parseOptionalNumber(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function getNumberStatus(
  item: RaffleNumberPublic,
  selectedNumbers: Set<number>,
) {
  return item.status === "available" && selectedNumbers.has(item.number)
    ? "selected"
    : item.status;
}

export function NumberGrid({
  raffleId,
  raffleSlug,
  initialPage,
  stats,
  pricePerNumber,
  minNumber,
  maxNumber,
  customerDefaults,
}: NumberGridProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    () => new Set(),
  );
  const [pageData, setPageData] = useState(initialPage);
  const [statusFilter, setStatusFilter] =
    useState<Exclude<NumberGridStatus, "selected">>("all");
  const [search, setSearch] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [toNumber, setToNumber] = useState("");
  const [surpriseQuantity, setSurpriseQuantity] = useState("10");
  const [pageSize, setPageSize] = useState(defaultRaffleNumberPageSize);
  const [isLoadingPage, startPageTransition] = useTransition();
  const [isPickingRandom, startRandomTransition] = useTransition();
  const occupiedCount = stats.reserved + stats.paid;
  const occupancyPercentage =
    stats.total > 0 ? Math.min(100, (occupiedCount / stats.total) * 100) : 0;
  const selectedList = Array.from(selectedNumbers).sort(
    (first, second) => first - second,
  );
  const quickPickLimit = Math.min(maxNumbersPerReservation, stats.available);
  const parsedSurpriseQuantity = parseOptionalNumber(surpriseQuantity);
  const customSurpriseQuantity =
    parsedSurpriseQuantity === null
      ? null
      : Math.min(Math.max(parsedSurpriseQuantity, 1), quickPickLimit);

  function loadPage(overrides: {
    page?: number;
    pageSize?: number;
    status?: Exclude<NumberGridStatus, "selected">;
    search?: string;
    fromNumber?: string;
    toNumber?: string;
  } = {}) {
    const nextPageSize = overrides.pageSize ?? pageSize;
    const nextStatus = overrides.status ?? statusFilter;
    const nextSearch = overrides.search ?? search;
    const nextFromNumber = overrides.fromNumber ?? fromNumber;
    const nextToNumber = overrides.toNumber ?? toNumber;

    startPageTransition(() => {
      void getPublicRaffleNumberPage({
        raffleId,
        page: overrides.page ?? pageData.page,
        pageSize: nextPageSize,
        status: nextStatus,
        search: nextSearch,
        fromNumber: parseOptionalNumber(nextFromNumber),
        toNumber: parseOptionalNumber(nextToNumber),
      }).then(setPageData);
    });
  }

  function applyFilters() {
    loadPage({ page: 1 });
  }

  function resetFilters() {
    setStatusFilter("all");
    setSearch("");
    setFromNumber("");
    setToNumber("");
    loadPage({
      page: 1,
      status: "all",
      search: "",
      fromNumber: "",
      toNumber: "",
    });
  }

  function toggleNumber(item: RaffleNumberPublic) {
    if (item.status !== "available") {
      return;
    }

    setSelectedNumbers((current) => {
      const next = new Set(current);

      if (next.has(item.number)) {
        next.delete(item.number);
      } else if (next.size < maxNumbersPerReservation) {
        next.add(item.number);
      }

      return next;
    });
  }

  function clearSelection() {
    setSelectedNumbers(new Set());
  }

  function selectRandomQuantity(quantity: number) {
    const targetQuantity = Math.min(Math.max(quantity, 1), quickPickLimit);

    startRandomTransition(() => {
      void getPublicRandomAvailableNumbers({
        raffleId,
        quantity: targetQuantity,
        excludedNumbers: selectedList,
      }).then((numbers) => {
        setSelectedNumbers((current) => {
          const next = new Set(current);

          for (const number of numbers) {
            if (next.size >= maxNumbersPerReservation) {
              break;
            }

            next.add(number);
          }

          return next;
        });
      });
    });
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Badge variant="success">Escolha seus numeros</Badge>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Grade visual da rifa
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Selecione numeros disponiveis, use filtros por pagina e crie uma
            reserva real por 15 minutos.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div
              key={status}
              className="rounded-lg border border-white/10 bg-black/18 p-3"
            >
              <p className="text-muted">{label}</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {stats[status as RaffleNumberStatus].toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-primary/20 bg-primary/[0.06] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {stats.available.toLocaleString("pt-BR")} numeros disponiveis
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {occupiedCount.toLocaleString("pt-BR")} ja estao reservados ou vendidos.
            </p>
          </div>
          <span className="font-mono text-sm font-bold text-accent">
            {occupancyPercentage.toLocaleString("pt-BR", {
              maximumFractionDigits: 1,
            })}
            % ocupada
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="grid gap-3 rounded-lg border border-white/10 bg-black/18 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="size-4 text-accent" />
                Filtros e busca
              </div>
              <div className="flex flex-wrap gap-2">
                {quickPickOptions.map((quantity) => (
                  <Button
                    key={quantity}
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={quickPickLimit === 0 || isPickingRandom}
                    onClick={() => selectRandomQuantity(quantity)}
                  >
                    {isPickingRandom ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Shuffle className="size-4" />
                    )}
                    {quantity}
                  </Button>
                ))}
                <label className="flex min-w-32 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-muted">
                  Qtd.
                  <Input
                    value={surpriseQuantity}
                    onChange={(event) => setSurpriseQuantity(event.target.value)}
                    inputMode="numeric"
                    min={1}
                    max={quickPickLimit}
                    className="h-8 w-16 px-2 text-center"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    quickPickLimit === 0 ||
                    customSurpriseQuantity === null ||
                    isPickingRandom
                  }
                  onClick={() => {
                    if (customSurpriseQuantity !== null) {
                      selectRandomQuantity(customSurpriseQuantity);
                    }
                  }}
                >
                  {isPickingRandom ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Zap className="size-4" />
                  )}
                  Surpresinha
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr]">
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Buscar numero
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    inputMode="numeric"
                    placeholder="Ex: 125"
                    className="pl-9"
                  />
                </div>
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Status
                <Select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as Exclude<NumberGridStatus, "selected">,
                    )
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                De
                <Input
                  value={fromNumber}
                  onChange={(event) => setFromNumber(event.target.value)}
                  inputMode="numeric"
                  placeholder={String(minNumber)}
                />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Ate
                <Input
                  value={toNumber}
                  onChange={(event) => setToNumber(event.target.value)}
                  inputMode="numeric"
                  placeholder={String(maxNumber)}
                />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Por pagina
                <Select
                  value={String(pageSize)}
                  onChange={(event) => {
                    const nextPageSize = Number(event.target.value);
                    setPageSize(nextPageSize);
                    loadPage({ page: 1, pageSize: nextPageSize });
                  }}
                >
                  {raffleNumberPageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <span
                    key={status}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-semibold",
                      statusStyles[status as RaffleNumberStatus],
                    )}
                  >
                    <span className="size-2 rounded-full bg-current" />
                    {label}
                  </span>
                ))}
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-semibold",
                    statusStyles.selected,
                  )}
                >
                  <Check className="size-3.5" />
                  Selecionado
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isLoadingPage}
                  onClick={applyFilters}
                >
                  {isLoadingPage ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Aplicar
                </Button>
                <Button type="button" variant="ghost" onClick={resetFilters}>
                  <X className="size-4" />
                  Limpar filtros
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Ticket className="size-4 text-primary" />
              Exibindo{" "}
              <span className="font-semibold text-foreground">
                {pageData.numbers.length.toLocaleString("pt-BR")}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-foreground">
                {pageData.totalItems.toLocaleString("pt-BR")}
              </span>{" "}
              numero{pageData.totalItems === 1 ? "" : "s"} filtrado
              {pageData.totalItems === 1 ? "" : "s"}.
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={pageData.page === 1 || isLoadingPage}
                onClick={() => loadPage({ page: Math.max(pageData.page - 1, 1) })}
              >
                Anterior
              </Button>
              <span className="min-w-24 text-center text-xs font-semibold text-muted">
                {pageData.page}/{pageData.totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={pageData.page === pageData.totalPages || isLoadingPage}
                onClick={() =>
                  loadPage({
                    page: Math.min(pageData.page + 1, pageData.totalPages),
                  })
                }
              >
                Proxima
              </Button>
            </div>
          </div>

          {pageData.numbers.length > 0 ? (
            <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-[repeat(14,minmax(0,1fr))]">
              {pageData.numbers.map((item) => {
                const displayStatus = getNumberStatus(item, selectedNumbers);
                const selectable = item.status === "available";

                return (
                  <button
                    key={item.number}
                    type="button"
                    disabled={!selectable}
                    aria-pressed={displayStatus === "selected"}
                    onClick={() => toggleNumber(item)}
                    className={cn(
                      "h-11 rounded-lg border font-mono text-xs font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:h-12 sm:text-sm",
                      statusStyles[displayStatus],
                    )}
                    title={`${item.number} - ${
                      displayStatus === "selected"
                        ? "Selecionado"
                        : statusLabels[item.status]
                    }`}
                  >
                    {item.number}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
              <p className="font-semibold text-foreground">
                Nenhum numero encontrado
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Ajuste busca, status ou intervalo para ver mais numeros.
              </p>
            </div>
          )}
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <SelectionSummary
            raffleId={raffleId}
            raffleSlug={raffleSlug}
            selectedNumbers={selectedList}
            pricePerNumber={pricePerNumber}
            customerDefaults={customerDefaults}
            onClear={clearSelection}
          />
        </div>
      </div>
    </Card>
  );
}
