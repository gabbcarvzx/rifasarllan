"use client";

import { useState, type FormEvent } from "react";
import { signUpWithEmail } from "@/app/actions/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Input } from "@/components/ui/input";

type SignupFormProps = {
  error?: string;
  success?: string;
};

export function SignupForm({ error, success }: SignupFormProps) {
  const [clientError, setClientError] = useState<string>();

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmPassword") ?? "");

    if (!email) {
      event.preventDefault();
      setClientError("Informe seu e-mail.");
      return;
    }

    if (password.length < 8) {
      event.preventDefault();
      setClientError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      event.preventDefault();
      setClientError("As senhas nao coincidem.");
      return;
    }

    setClientError(undefined);
  }

  return (
    <>
      <AuthMessage error={clientError ?? error} success={success} />
      <form
        action={signUpWithEmail}
        className="space-y-4"
        onSubmit={validateBeforeSubmit}
      >
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Nome completo
          <Input
            name="fullName"
            autoComplete="name"
            placeholder="Seu nome"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          WhatsApp
          <Input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          E-mail
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Senha
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Minimo de 8 caracteres"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Confirmacao de senha
          <Input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Repita sua senha"
            required
          />
        </label>
        <AuthSubmitButton pendingLabel="Criando conta..." className="w-full">
          Criar conta
        </AuthSubmitButton>
      </form>
    </>
  );
}
