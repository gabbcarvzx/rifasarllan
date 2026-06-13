"use client";

import { PackageCheck, Trash2, Trophy } from "lucide-react";
import { PrizeForm } from "@/components/admin/prizes/prize-form";
import { PrizeImageUploader } from "@/components/admin/prizes/prize-image-uploader";
import { PrizePositionEditor } from "@/components/admin/prizes/prize-position-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RafflePrize } from "@/types/database";

type PrizeCardProps = {
  raffleId: string;
  prize: RafflePrize;
  prizes: RafflePrize[];
  index: number;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
  reorderAction: (formData: FormData) => void;
  uploadAction: (formData: FormData) => void;
  removeAction: (formData: FormData) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  isOrdering: boolean;
  isUploading: boolean;
  isRemoving: boolean;
};

function formatPrizePosition(position: number) {
  return `${position}o premio`;
}

export function PrizeCard({
  raffleId,
  prize,
  prizes,
  index,
  updateAction,
  deleteAction,
  reorderAction,
  uploadAction,
  removeAction,
  isUpdating,
  isDeleting,
  isOrdering,
  isUploading,
  isRemoving,
}: PrizeCardProps) {
  return (
    <Card className="overflow-hidden bg-black/14">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/12 text-accent">
            <Trophy className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={index === 0 ? "default" : "muted"}>
                {formatPrizePosition(prize.position)}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                <PackageCheck className="size-3.5" />
                {prize.quantity} unidade{prize.quantity > 1 ? "s" : ""}
              </span>
            </div>
            <h3 className="mt-2 truncate text-lg font-bold text-foreground">
              {prize.title}
            </h3>
          </div>
        </div>

        <PrizePositionEditor
          raffleId={raffleId}
          prizes={prizes}
          index={index}
          formAction={reorderAction}
          isPending={isOrdering}
        />
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[0.85fr_1.15fr]">
        <PrizeImageUploader
          prize={prize}
          uploadAction={uploadAction}
          removeAction={removeAction}
          isUploading={isUploading}
          isRemoving={isRemoving}
        />

        <div className="grid content-start gap-4">
          <PrizeForm
            mode="edit"
            raffleId={raffleId}
            prize={prize}
            formAction={updateAction}
            isPending={isUpdating}
          />

          <form
            action={deleteAction}
            className="border-t border-white/10 pt-4"
          >
            <input type="hidden" name="prizeId" value={prize.id} />
            <Button
              type="submit"
              variant="danger"
              disabled={isDeleting}
              className="w-full sm:w-fit"
            >
              <Trash2 className="size-4" />
              {isDeleting ? "Excluindo..." : "Excluir premio"}
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
