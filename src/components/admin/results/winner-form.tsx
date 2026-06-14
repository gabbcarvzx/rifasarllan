"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { RafflePrize } from "@/types/database";
import type { AdminManualWinner } from "@/types/manual-results";

type WinnerFormProps = {
  mode: "create" | "edit";
  raffleId: string;
  prizes: RafflePrize[];
  winner?: AdminManualWinner;
  formAction: (formData: FormData) => void;
  isPending: boolean;
};

export function WinnerForm({
  mode,
  raffleId,
  prizes,
  winner,
  formAction,
  isPending,
}: WinnerFormProps) {
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="raffleId" value={raffleId} />
      {winner ? <input type="hidden" name="winnerId" value={winner.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Premio
          <Select
            name="prizeId"
            defaultValue={winner?.prize_id ?? ""}
            required
          >
            <option value="" disabled>
              Selecione o premio
            </option>
            {prizes.map((prize) => (
              <option key={prize.id} value={prize.id}>
                {prize.position}o - {prize.title}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Numero vencedor
          <Input
            name="number"
            type="number"
            min="1"
            defaultValue={winner?.number ?? ""}
            placeholder="Ex: 1248"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Nome do vencedor
          <Input
            name="winnerName"
            defaultValue={winner?.winner_name ?? ""}
            placeholder="Preenchido pelo pedido quando disponivel"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Telefone / WhatsApp
          <Input
            name="winnerPhone"
            inputMode="tel"
            defaultValue={winner?.winner_phone ?? ""}
            placeholder="(11) 99999-9999"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Link da live no Instagram
          <Input
            name="instagramLiveUrl"
            type="url"
            defaultValue={winner?.instagram_live_url ?? ""}
            placeholder="https://instagram.com/..."
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Link de comprovacao
          <Input
            name="proofUrl"
            type="url"
            defaultValue={winner?.proof_url ?? ""}
            placeholder="https://..."
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Observacoes internas
        <Textarea
          name="notes"
          defaultValue={winner?.notes ?? ""}
          placeholder="Contexto da live, conferencia do numero ou detalhes de contato. Este campo nao e publico."
          maxLength={5000}
        />
      </label>

      <Button
        type="submit"
        disabled={isPending || prizes.length === 0}
        className="w-full sm:w-fit"
      >
        <Save className="size-4" />
        {isPending
          ? "Salvando..."
          : mode === "create"
            ? "Adicionar vencedor"
            : "Salvar alteracoes"}
      </Button>
    </form>
  );
}
