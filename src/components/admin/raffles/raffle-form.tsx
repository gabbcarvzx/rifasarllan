"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarDays, Hash, Loader2, Save, Sparkles, Ticket } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { normalizeSlug } from "@/lib/slug";
import type { Raffle, RaffleStatus } from "@/types/database";

type RaffleFormProps = {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  mode: "create" | "edit";
  raffle?: Raffle;
};

const statusOptions: Array<{ value: RaffleStatus; label: string }> = [
  { value: "draft", label: "Rascunho" },
  { value: "active", label: "Ativa" },
  { value: "paused", label: "Pausada" },
  { value: "finished", label: "Encerrada" },
  { value: "cancelled", label: "Cancelada" },
];

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function SubmitButton({ mode }: { mode: RaffleFormProps["mode"] }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {pending
        ? "Salvando..."
        : mode === "create"
          ? "Salvar rifa"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function RaffleForm({ action, cancelHref, mode, raffle }: RaffleFormProps) {
  const [title, setTitle] = useState(raffle?.title ?? "");
  const [slug, setSlug] = useState(raffle?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!raffle?.slug);
  const [totalNumbers, setTotalNumbers] = useState(
    String(raffle?.total_numbers ?? 1000),
  );
  const [minNumber, setMinNumber] = useState(String(raffle?.min_number ?? 1));
  const [maxNumber, setMaxNumber] = useState(String(raffle?.max_number ?? 1000));
  const [autoMaxNumber, setAutoMaxNumber] = useState(mode === "create");

  const generatedMaxNumber = useMemo(() => {
    const total = Number.parseInt(totalNumbers, 10);
    const min = Number.parseInt(minNumber, 10);

    if (!Number.isInteger(total) || !Number.isInteger(min) || total <= 0 || min <= 0) {
      return "";
    }

    return String(min + total - 1);
  }, [minNumber, totalNumbers]);
  const currentSlug = autoSlug ? normalizeSlug(title) : slug;
  const currentMaxNumber = autoMaxNumber ? generatedMaxNumber : maxNumber;

  const availableStatuses =
    mode === "create"
      ? statusOptions.filter((option) => ["draft", "active"].includes(option.value))
      : statusOptions;

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      {raffle ? <input type="hidden" name="raffleId" value={raffle.id} /> : null}

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Informacoes da campanha</CardTitle>
            <CardDescription>
              Dados publicos que aparecem na vitrine e na pagina individual da rifa.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Titulo
              <Input
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex: iPhone 15 Pro Max"
                required
              />
            </label>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="slug">
                Slug publico
              </label>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  id="slug"
                  name="slug"
                  value={currentSlug}
                  onChange={(event) => {
                    setAutoSlug(false);
                    setSlug(normalizeSlug(event.target.value));
                  }}
                  placeholder="iphone-15-pro-max"
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setAutoSlug(true);
                  }}
                >
                  <Sparkles className="size-4" />
                  Auto
                </Button>
              </div>
              <p className="text-xs leading-5 text-muted">
                O slug e unico por tenant e sera usado na URL publica da campanha.
              </p>
            </div>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Descricao curta
              <Textarea
                name="shortDescription"
                defaultValue={raffle?.short_description ?? ""}
                placeholder="Resumo direto do premio e da proposta da rifa."
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Descricao completa
              <Textarea
                name="description"
                className="min-h-40"
                defaultValue={raffle?.description ?? ""}
                placeholder="Detalhes do premio, condicoes comerciais e informacoes relevantes para o participante."
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Regras
              <Textarea
                name="rules"
                className="min-h-36"
                defaultValue={raffle?.rules ?? ""}
                placeholder="Regras de participacao, data de apuracao, entrega e criterios de validade."
                required
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Numeracao e valor</CardTitle>
            <CardDescription>
              A faixa precisa bater com a quantidade total para gerar os numeros sem duplicidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Valor por numero
                <Input
                  name="pricePerNumber"
                  type="number"
                  min="0.01"
                  step="0.01"
                  defaultValue={raffle?.price_per_number ?? ""}
                  placeholder="12.90"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Quantidade total
                <Input
                  name="totalNumbers"
                  type="number"
                  min="1"
                  value={totalNumbers}
                  onChange={(event) => setTotalNumbers(event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Numero inicial
                <Input
                  name="minNumber"
                  type="number"
                  min="1"
                  value={minNumber}
                  onChange={(event) => setMinNumber(event.target.value)}
                  required
                />
              </label>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="maxNumber">
                  Numero final
                </label>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    id="maxNumber"
                    name="maxNumber"
                    type="number"
                    min="1"
                    value={currentMaxNumber}
                    onChange={(event) => {
                      setAutoMaxNumber(false);
                      setMaxNumber(event.target.value);
                    }}
                    required
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setAutoMaxNumber(true);
                    }}
                  >
                    <Hash className="size-4" />
                    Auto
                  </Button>
                </div>
                <p className="text-xs leading-5 text-muted">
                  Calculado como numero inicial + quantidade total - 1.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/12 text-accent">
              <CalendarDays className="size-4" />
            </div>
            <CardTitle>Publicacao</CardTitle>
            <CardDescription>
              Controle de status inicial, destaque e data prevista de apuracao.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Data do sorteio
              <Input
                name="drawDate"
                type="date"
                defaultValue={toDateInputValue(raffle?.draw_date)}
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Status
              <Select name="status" defaultValue={raffle?.status ?? "draft"} required>
                {availableStatuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/18 p-4 text-sm leading-6 text-muted">
              <input
                name="featured"
                type="checkbox"
                defaultChecked={raffle?.featured ?? false}
                className="mt-1 size-4 rounded border-white/20 bg-black accent-emerald-400"
              />
              <span>
                <span className="block font-semibold text-foreground">
                  Destacar na pagina inicial
                </span>
                Use para campanhas ativas com maior potencial comercial.
              </span>
            </label>
          </CardContent>
        </Card>

        <Card className="p-5">
          <Ticket className="size-5 text-primary" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            Escopo desta etapa
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Ao criar a rifa, os numeros sao gerados no banco. Upload de imagens,
            premios, reservas, pagamento Pix e sorteio permanecem para as proximas
            etapas.
          </p>
        </Card>

        <div className="sticky bottom-4 rounded-lg border border-white/10 bg-surface-raised/95 p-4 shadow-premium backdrop-blur">
          <div className="grid gap-3">
            <SubmitButton mode={mode} />
            <Link
              href={cancelHref}
              className={buttonVariants({
                variant: "secondary",
                className: "w-full",
              })}
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
