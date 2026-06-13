"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { RafflePrize } from "@/types/database";

type PrizePositionEditorProps = {
  raffleId: string;
  prizes: RafflePrize[];
  index: number;
  formAction: (formData: FormData) => void;
  isPending: boolean;
};

function orderAfterMove(prizes: RafflePrize[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= prizes.length) {
    return prizes.map((prize) => prize.id).join(",");
  }

  const nextPrizes = [...prizes];
  const [movedPrize] = nextPrizes.splice(index, 1);
  nextPrizes.splice(targetIndex, 0, movedPrize);

  return nextPrizes.map((prize) => prize.id).join(",");
}

export function PrizePositionEditor({
  raffleId,
  prizes,
  index,
  formAction,
  isPending,
}: PrizePositionEditorProps) {
  return (
    <div className="flex items-center gap-2">
      <form action={formAction}>
        <input type="hidden" name="raffleId" value={raffleId} />
        <input
          type="hidden"
          name="orderedIds"
          value={orderAfterMove(prizes, index, -1)}
        />
        <button
          type="submit"
          disabled={index === 0 || isPending}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
          aria-label="Mover premio para cima"
          title="Mover para cima"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>

      <form action={formAction}>
        <input type="hidden" name="raffleId" value={raffleId} />
        <input
          type="hidden"
          name="orderedIds"
          value={orderAfterMove(prizes, index, 1)}
        />
        <button
          type="submit"
          disabled={index === prizes.length - 1 || isPending}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
          aria-label="Mover premio para baixo"
          title="Mover para baixo"
        >
          <ArrowDown className="size-4" />
        </button>
      </form>
    </div>
  );
}
