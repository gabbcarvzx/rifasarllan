"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Gem, Gift, Layers3, Sparkles } from "lucide-react";
import {
  createPrize,
  deletePrize,
  removePrizeImage,
  reorderPrizes,
  updatePrize,
  uploadPrizeImage,
  type PrizeActionState,
} from "@/app/actions/prizes";
import { PrizeCard } from "@/components/admin/prizes/prize-card";
import { PrizeEmptyState } from "@/components/admin/prizes/prize-empty-state";
import { PrizeForm } from "@/components/admin/prizes/prize-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Raffle, RafflePrize } from "@/types/database";

const initialState: PrizeActionState = {
  status: "idle",
  message: "",
};

function ActionMessage({ state }: { state: PrizeActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm leading-6",
        state.status === "success"
          ? "border-primary/35 bg-primary/12 text-emerald-100"
          : "border-danger/35 bg-danger/12 text-rose-100",
      )}
    >
      {state.message}
    </div>
  );
}

function latestState(states: PrizeActionState[]) {
  return (
    states
      .filter((state) => state.status !== "idle")
      .sort((first, second) => (second.updatedAt ?? 0) - (first.updatedAt ?? 0))[0] ??
    initialState
  );
}

export function PrizeList({
  raffle,
  prizes,
}: {
  raffle: Raffle;
  prizes: RafflePrize[];
}) {
  const router = useRouter();
  const [createState, createAction, isCreating] = useActionState(
    createPrize,
    initialState,
  );
  const [updateState, updateAction, isUpdating] = useActionState(
    updatePrize,
    initialState,
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deletePrize,
    initialState,
  );
  const [reorderState, reorderAction, isOrdering] = useActionState(
    reorderPrizes,
    initialState,
  );
  const [uploadState, uploadAction, isUploading] = useActionState(
    uploadPrizeImage,
    initialState,
  );
  const [removeState, removeAction, isRemoving] = useActionState(
    removePrizeImage,
    initialState,
  );
  const states = [
    createState,
    updateState,
    deleteState,
    reorderState,
    uploadState,
    removeState,
  ];
  const combinedMessage = latestState(states);
  const hasSuccessfulAction = states.some((state) => state.status === "success");
  const totalQuantity = prizes.reduce((total, prize) => total + prize.quantity, 0);
  const primaryPrize = prizes[0];

  useEffect(() => {
    if (hasSuccessfulAction) {
      router.refresh();
    }
  }, [hasSuccessfulAction, router]);

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/12 text-accent">
          <Gift className="size-4" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="default">Premios da rifa</Badge>
            <CardTitle className="mt-3">Catalogo visual de premios</CardTitle>
            <CardDescription>
              Cadastre, edite, ordene e publique os premios desta campanha sem
              sair da tela.
            </CardDescription>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted">
            {prizes.length} premio{prizes.length === 1 ? "" : "s"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6">
        <ActionMessage state={combinedMessage} />

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-white/10 bg-black/14 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Novo premio
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted">
                A posicao pode ser preenchida manualmente ou calculada
                automaticamente pela ordem atual.
              </p>
            </div>
            <PrizeForm
              mode="create"
              raffleId={raffle.id}
              formAction={createAction}
              isPending={isCreating}
              includeImage
            />
          </div>

          <div className="grid content-start gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg border border-white/10 bg-black/18 p-4">
              <Layers3 className="mb-3 size-5 text-primary" />
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                Itens cadastrados
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {prizes.length}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/18 p-4">
              <Gem className="mb-3 size-5 text-accent" />
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                Quantidade total
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {totalQuantity}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/18 p-4">
              <Sparkles className="mb-3 size-5 text-info" />
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                Premio principal
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
                {primaryPrize?.title ?? "Nao definido"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {prizes.length > 0 ? (
            prizes.map((prize, index) => (
              <PrizeCard
                key={prize.id}
                raffleId={raffle.id}
                prize={prize}
                prizes={prizes}
                index={index}
                updateAction={updateAction}
                deleteAction={deleteAction}
                reorderAction={reorderAction}
                uploadAction={uploadAction}
                removeAction={removeAction}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
                isOrdering={isOrdering}
                isUploading={isUploading}
                isRemoving={isRemoving}
              />
            ))
          ) : (
            <PrizeEmptyState />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
