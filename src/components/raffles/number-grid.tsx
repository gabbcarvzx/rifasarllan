"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Check, Filter, Search, Shuffle, Ticket, X, Zap } from "lucide-react";
import { SelectionSummary } from "@/components/raffles/selection-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  addRandomAvailableNumbers,
  addTopAvailableNumbers,
} from "@/lib/raffles/quick-selection";
import { cn } from "@/lib/utils";
import type {
  NumberGridStatus,
  RaffleNumberPublic,
  RaffleNumberStatus,
} from "@/types/raffle";

type NumberGridProps = {
  raffleId: string;
  raffleSlug: string;
  numbers: RaffleNumberPublic[];
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

const statusOptions: Array<{ value: NumberGridStatus; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "available", label: "Disponiveis" },
  { value: "selected", label: "Selecionados" },
  { value: "reserved", label: "Reservados" },
  { value: "paid", label: "Vendidos" },
  { value: "cancelled", label: "Cancelados" },
];

const pageSizeOptions = [250, 500, 1000] as const;
const quickPickOptions = [5, 10, 20] as const;

function parseOptionalNumber(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function countByStatus(numbers: RaffleNumberPublic[]) {
  return numbers.reduce<Record<RaffleNumberStatus, number>>(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    {
      available: 0,
      reserved: 0,
      paid: 0,
      cancelled: 0,
    },
  );
}

export function NumberGrid({
  raffleId,
  raffleSlug,
  numbers,
  pricePerNumber,
  minNumber,
  maxNumber,
  customerDefaults,
}: NumberGridProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    () => new Set(),
  );
  const [statusFilter, setStatusFilter] = useState<NumberGridStatus>("all");
  const [search, setSearch] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [toNumber, setToNumber] = useState("");
  const [pageSize, setPageSize] =
    useState<(typeof pageSizeOptions)[number]>(250);
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);
  const deferredFromNumber = useDeferredValue(fromNumber);
  const deferredToNumber = useDeferredValue(toNumber);
  const stats = useMemo(() => countByStatus(numbers), [numbers]);
  const occupiedCount = stats.reserved + stats.paid;
  const occupancyPercentage =
    numbers.length > 0 ? Math.min(100, (occupiedCount / numbers.length) * 100) : 0;
  const availableCount = stats.available;
  const availableNumbers = useMemo(
    () =>
      new Set(
        numbers
          .filter((item) => item.status === "available")
          .map((item) => item.number),
    ),
    [numbers],
  );
  const selectedList = useMemo(
    () =>
      Array.from(selectedNumbers)
        .filter((number) => availableNumbers.has(number))
        .sort((first, second) => first - second),
    [availableNumbers, selectedNumbers],
  );
  const selectedLookup = selectedNumbers;
  const filteredNumbers = useMemo(() => {
    const normalizedSearch = deferredSearch.trim();
    const intervalStart = parseOptionalNumber(deferredFromNumber);
    const intervalEnd = parseOptionalNumber(deferredToNumber);

    return numbers.filter((item) => {
      const selected =
        item.status === "available" && selectedLookup.has(item.number);

      if (statusFilter === "selected" && !selected) {
        return false;
      }

      if (
        statusFilter !== "all" &&
        statusFilter !== "selected" &&
        item.status !== statusFilter
      ) {
        return false;
      }

      if (
        normalizedSearch &&
        !String(item.number).includes(normalizedSearch)
      ) {
        return false;
      }

      if (intervalStart !== null && item.number < intervalStart) {
        return false;
      }

      if (intervalEnd !== null && item.number > intervalEnd) {
        return false;
      }

      return true;
    });
  }, [
    deferredFromNumber,
    deferredSearch,
    deferredToNumber,
    numbers,
    selectedLookup,
    statusFilter,
  ]);
  const totalPages = Math.max(Math.ceil(filteredNumbers.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleNumbers = filteredNumbers.slice(startIndex, startIndex + pageSize);

  function resetPage() {
    setPage(1);
  }

  function toggleNumber(item: RaffleNumberPublic) {
    if (item.status !== "available") {
      return;
    }

    setSelectedNumbers((current) => {
      const next = new Set(current);

      if (next.has(item.number)) {
        next.delete(item.number);
      } else {
        next.add(item.number);
      }

      return next;
    });
  }

  function clearSelection() {
    setSelectedNumbers(new Set());
  }

  function selectTopQuantity(quantity: number) {
    setSelectedNumbers((current) =>
      addTopAvailableNumbers({
        numbers,
        selectedNumbers: current,
        quantity,
      }),
    );
  }

  function selectRandomQuantity(quantity: number) {
    setSelectedNumbers((current) =>
      addRandomAvailableNumbers({
        numbers,
        selectedNumbers: current,
        quantity,
      }),
    );
  }

  function clearFilters() {
    setStatusFilter("all");
    setSearch("");
    setFromNumber("");
    setToNumber("");
    setPage(1);
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
            Selecione numeros disponiveis e crie uma reserva real por 15 minutos.
            O pagamento online permanece pausado; acompanhe o pedido pela sua conta.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
          {Object.entries(stats).map(([status, total]) => (
            <div
              key={status}
              className="rounded-lg border border-white/10 bg-black/18 p-3"
            >
              <p className="text-muted">
                {statusLabels[status as RaffleNumberStatus]}
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {total.toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-primary/20 bg-primary/[0.06] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {availableCount.toLocaleString("pt-BR")} numeros disponiveis
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
                    disabled={availableCount === 0}
                    onClick={() => selectTopQuantity(quantity)}
                  >
                    <Zap className="size-4" />
                    {quantity} numeros
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={availableCount === 0}
                  onClick={() => selectRandomQuantity(10)}
                >
                  <Shuffle className="size-4" />
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
                    onChange={(event) => {
                      setSearch(event.target.value);
                      resetPage();
                    }}
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
                  onChange={(event) => {
                    setStatusFilter(event.target.value as NumberGridStatus);
                    resetPage();
                  }}
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
                  onChange={(event) => {
                    setFromNumber(event.target.value);
                    resetPage();
                  }}
                  inputMode="numeric"
                  placeholder={String(minNumber)}
                />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Ate
                <Input
                  value={toNumber}
                  onChange={(event) => {
                    setToNumber(event.target.value);
                    resetPage();
                  }}
                  inputMode="numeric"
                  placeholder={String(maxNumber)}
                />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Por pagina
                <Select
                  value={String(pageSize)}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value) as typeof pageSize);
                    resetPage();
                  }}
                >
                  {pageSizeOptions.map((option) => (
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
              <Button type="button" variant="ghost" onClick={clearFilters}>
                <X className="size-4" />
                Limpar filtros
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Ticket className="size-4 text-primary" />
              Exibindo{" "}
              <span className="font-semibold text-foreground">
                {visibleNumbers.length.toLocaleString("pt-BR")}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-foreground">
                {filteredNumbers.length.toLocaleString("pt-BR")}
              </span>{" "}
              numero{filteredNumbers.length === 1 ? "" : "s"} filtrado
              {filteredNumbers.length === 1 ? "" : "s"}.
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(value - 1, 1))}
              >
                Anterior
              </Button>
              <span className="min-w-24 text-center text-xs font-semibold text-muted">
                {currentPage}/{totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
              >
                Proxima
              </Button>
            </div>
          </div>

          {visibleNumbers.length > 0 ? (
            <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-[repeat(14,minmax(0,1fr))]">
              {visibleNumbers.map((item) => {
                const selectable = item.status === "available";
                const selected = selectable && selectedNumbers.has(item.number);

                return (
                  <button
                    key={item.number}
                    type="button"
                    disabled={!selectable}
                    aria-pressed={selected}
                    onClick={() => toggleNumber(item)}
                    className={cn(
                      "h-11 rounded-lg border font-mono text-xs font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:h-12 sm:text-sm",
                      selected ? statusStyles.selected : statusStyles[item.status],
                    )}
                    title={`${item.number} - ${
                      selected ? "Selecionado" : statusLabels[item.status]
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
