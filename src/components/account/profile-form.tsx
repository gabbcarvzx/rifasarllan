"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2, Pencil, Save, X } from "lucide-react";
import {
  updateMyProfile,
} from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AccountActionState, MyProfile } from "@/types/account";

const initialState: AccountActionState = {
  status: "idle",
  message: "",
};

export function ProfileForm({ profile }: { profile: MyProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateMyProfile,
    initialState,
  );

  return (
    <Card className="p-5">
      <div className={cn("flex flex-col gap-4", isEditing && "mb-5")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Dados de contato</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Nome e WhatsApp podem ser atualizados. E-mail, papel e tenant
              seguem protegidos pela autenticacao e pelo banco.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing((current) => !current)}
          >
            {isEditing ? <X className="size-4" /> : <Pencil className="size-4" />}
            {isEditing ? "Cancelar" : "Editar perfil"}
          </Button>
        </div>
      </div>

      {isEditing ? (
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Nome completo
          <Input
            name="fullName"
            defaultValue={profile.full_name ?? ""}
            minLength={3}
            maxLength={120}
            autoComplete="name"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          WhatsApp
          <Input
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            minLength={8}
            maxLength={24}
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            required
          />
        </label>

        {state.status !== "idle" ? (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg border p-3 text-sm",
              state.status === "success"
                ? "border-primary/30 bg-primary/10 text-emerald-100"
                : "border-danger/30 bg-danger/10 text-rose-100",
            )}
          >
            {state.status === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
            )}
            {state.message}
          </div>
        ) : null}

        <Button type="submit" isLoading={isPending} className="w-full sm:w-fit">
          <Save className="size-4" />
          {isPending ? "Salvando..." : "Salvar alteracoes"}
        </Button>
      </form>
      ) : null}
    </Card>
  );
}
