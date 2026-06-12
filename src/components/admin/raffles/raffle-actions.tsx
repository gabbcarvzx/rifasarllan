import Link from "next/link";
import type { ReactNode } from "react";
import { Ban, Eye, Pause, Pencil, Play, Square, Trash2 } from "lucide-react";
import {
  changeRaffleStatus,
  deleteRaffle,
} from "@/app/actions/raffles";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Raffle, RaffleStatus } from "@/types/database";

type ActionButtonProps = {
  action: () => Promise<void>;
  children: ReactNode;
  className?: string;
  title: string;
};

function ActionButton({ action, children, className, title }: ActionButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        title={title}
        aria-label={title}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), className)}
      >
        {children}
      </button>
    </form>
  );
}

export function RaffleActions({ raffle }: { raffle: Raffle }) {
  const canPublish = ["draft", "paused"].includes(raffle.status);
  const canPause = raffle.status === "active";
  const canFinish = ["active", "paused"].includes(raffle.status);
  const canCancel = !["cancelled", "finished"].includes(raffle.status);
  const changeStatus = (status: RaffleStatus) =>
    changeRaffleStatus.bind(null, raffle.id, status);

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {raffle.status === "active" ? (
        <Link
          href={`/rifas/${raffle.slug}`}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
          title="Ver pagina publica"
          aria-label="Ver pagina publica"
        >
          <Eye className="size-4" />
        </Link>
      ) : (
        <span
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "pointer-events-none opacity-35",
          })}
          title="Pagina publica disponivel apenas para rifas ativas"
          aria-label="Pagina publica disponivel apenas para rifas ativas"
        >
          <Eye className="size-4" />
        </span>
      )}

      <Link
        href={`/admin/rifas/${raffle.id}/editar`}
        className={buttonVariants({ variant: "secondary", size: "icon" })}
        title="Editar rifa"
        aria-label="Editar rifa"
      >
        <Pencil className="size-4" />
      </Link>

      {canPublish ? (
        <ActionButton action={changeStatus("active")} title="Ativar rifa">
          <Play className="size-4" />
        </ActionButton>
      ) : null}

      {canPause ? (
        <ActionButton action={changeStatus("paused")} title="Pausar rifa">
          <Pause className="size-4" />
        </ActionButton>
      ) : null}

      {canFinish ? (
        <ActionButton action={changeStatus("finished")} title="Encerrar rifa">
          <Square className="size-4" />
        </ActionButton>
      ) : null}

      {canCancel ? (
        <ActionButton action={changeStatus("cancelled")} title="Cancelar rifa">
          <Ban className="size-4" />
        </ActionButton>
      ) : null}

      <ActionButton
        action={deleteRaffle.bind(null, raffle.id)}
        title="Excluir logicamente"
        className="text-rose-100 hover:bg-danger/15 hover:text-rose-50"
      >
        <Trash2 className="size-4" />
      </ActionButton>
    </div>
  );
}
