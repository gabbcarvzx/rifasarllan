"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Trophy } from "lucide-react";
import {
  createManualWinner,
  deleteManualWinner,
  publishResult,
  unpublishResult,
  updateManualWinner,
} from "@/app/actions/manual-results";
import { PublishResultCard } from "@/components/admin/results/publish-result-card";
import { WinnerForm } from "@/components/admin/results/winner-form";
import { WinnersAdminList } from "@/components/admin/results/winners-admin-list";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type {
  AdminManualResults,
  AdminManualWinner,
  ManualResultActionState,
} from "@/types/manual-results";

const initialState: ManualResultActionState = {
  status: "idle",
  message: "",
};

function latestState(states: ManualResultActionState[]) {
  return (
    states
      .filter((state) => state.status !== "idle")
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0] ?? initialState
  );
}

function ActionMessage({ state }: { state: ManualResultActionState }) {
  if (state.status === "idle" || !state.message) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border p-3 text-sm leading-6",
        state.status === "success" &&
          "border-primary/35 bg-primary/12 text-emerald-100",
        state.status === "warning" &&
          "border-accent/35 bg-accent/12 text-amber-100",
        state.status === "error" &&
          "border-danger/35 bg-danger/12 text-rose-100",
      )}
    >
      {state.status === "warning" ? (
        <CircleAlert className="mt-1 size-4 shrink-0" />
      ) : null}
      <span>{state.message}</span>
    </div>
  );
}

export function ManualResultPanel({ data }: { data: AdminManualResults }) {
  const router = useRouter();
  const [editingWinner, setEditingWinner] = useState<AdminManualWinner | null>(
    null,
  );
  const [createState, createAction, isCreating] = useActionState(
    createManualWinner,
    initialState,
  );
  const [updateState, updateAction, isUpdating] = useActionState(
    updateManualWinner,
    initialState,
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteManualWinner,
    initialState,
  );
  const [publishState, publishAction, isPublishing] = useActionState(
    publishResult,
    initialState,
  );
  const [unpublishState, unpublishAction, isUnpublishing] = useActionState(
    unpublishResult,
    initialState,
  );
  const states = [
    createState,
    updateState,
    deleteState,
    publishState,
    unpublishState,
  ];
  const message = latestState(states);
  const shouldRefresh = states.some(
    (state) => state.status === "success" || state.status === "warning",
  );

  useEffect(() => {
    if (shouldRefresh) router.refresh();
  }, [router, shouldRefresh]);

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/12 text-accent">
          <Trophy className="size-4" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="default">Resultado do sorteio ao vivo</Badge>
            <CardTitle className="mt-3">Registro manual de vencedores</CardTitle>
            <CardDescription>
              O sorteio acontece fora da plataforma. Aqui voce registra a
              evidencia, confere o numero e controla a publicacao do resultado.
            </CardDescription>
          </div>
          <Badge variant={data.winners.some((winner) => winner.published) ? "success" : "muted"}>
            {data.winners.length} vencedor{data.winners.length === 1 ? "" : "es"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6">
        <ActionMessage state={message} />

        {data.prizes.length === 0 ? (
          <div className="rounded-lg border border-accent/25 bg-accent/10 p-4 text-sm leading-6 text-amber-100">
            Cadastre ao menos um premio antes de registrar vencedores.
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-white/10 bg-black/14 p-5">
            <h3 className="font-semibold text-foreground">Adicionar vencedor</h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              Numeros pagos sao recomendados. Outros status podem ser usados,
              mas geram um alerta operacional antes da publicacao.
            </p>
            <div className="mt-5">
              <WinnerForm
                mode="create"
                raffleId={data.raffle.id}
                prizes={data.prizes}
                formAction={createAction}
                isPending={isCreating}
              />
            </div>
          </div>

          <PublishResultCard
            raffleId={data.raffle.id}
            raffleSlug={data.raffle.slug}
            winners={data.winners}
            publishAction={publishAction}
            unpublishAction={unpublishAction}
            isPublishing={isPublishing}
            isUnpublishing={isUnpublishing}
          />
        </div>

        <div>
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">
              Vencedores cadastrados
            </h3>
            <p className="mt-1 text-sm text-muted">
              Revise o premio, o status do numero e os links de transparencia.
            </p>
          </div>
          <WinnersAdminList
            winners={data.winners}
            deleteAction={deleteAction}
            isDeleting={isDeleting}
            onEdit={setEditingWinner}
          />
        </div>
      </CardContent>

      <Modal
        open={Boolean(editingWinner)}
        title="Editar vencedor"
        description="Atualize os dados registrados para este resultado manual."
        onClose={() => setEditingWinner(null)}
        className="max-w-3xl"
      >
        {editingWinner ? (
          <WinnerForm
            mode="edit"
            raffleId={data.raffle.id}
            prizes={data.prizes}
            winner={editingWinner}
            formAction={updateAction}
            isPending={isUpdating}
          />
        ) : null}
      </Modal>
    </Card>
  );
}
