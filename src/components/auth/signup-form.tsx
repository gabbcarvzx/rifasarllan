"use client";

import { Check, Circle } from "lucide-react";
import { useActionState, useMemo, useState, type FormEvent } from "react";
import { signUpWithEmail } from "@/app/actions/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SignUpActionState } from "@/types/auth";

type SignupFormProps = {
  error?: string;
  success?: string;
};

export function SignupForm({ error, success }: SignupFormProps) {
  const [clientError, setClientError] = useState<string>();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const initialState: SignUpActionState = {
    status: error ? "error" : "idle",
    message: error ?? "",
  };
  const [state, formAction] = useActionState(signUpWithEmail, initialState);
  const passwordChecks = useMemo(
    () => [
      { label: "8 caracteres", valid: password.length >= 8 },
      { label: "letra maiuscula", valid: /[A-Z]/.test(password) },
      { label: "numero", valid: /\d/.test(password) },
      { label: "simbolo", valid: /[^A-Za-z0-9]/.test(password) },
    ],
    [password],
  );
  const passwordScore = passwordChecks.filter((check) => check.valid).length;

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const submittedPassword = String(formData.get("password") ?? "");
    const submittedConfirmation = String(
      formData.get("confirmPassword") ?? "",
    );

    if (!email) {
      event.preventDefault();
      setClientError("Informe seu e-mail.");
      return;
    }

    if (submittedPassword.length < 8) {
      event.preventDefault();
      setClientError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (submittedPassword !== submittedConfirmation) {
      event.preventDefault();
      setClientError("As senhas nao coincidem.");
      return;
    }

    setClientError(undefined);
  }

  return (
    <>
      <AuthMessage
        error={
          clientError ?? (state.status === "error" ? state.message : error)
        }
        success={success}
      />
      <form
        action={formAction}
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
            inputMode="tel"
            maxLength={15}
            value={phone}
            onChange={(event) => setPhone(formatPhone(event.target.value))}
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={cn(
                  "h-1.5 rounded-full bg-white/10 transition-colors",
                  passwordScore >= level &&
                    (passwordScore <= 1
                      ? "bg-danger"
                      : passwordScore <= 2
                        ? "bg-accent"
                        : "bg-primary"),
                )}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
            {passwordChecks.map((check) => (
              <span key={check.label} className="flex items-center gap-1.5">
                {check.valid ? (
                  <Check className="size-3.5 text-primary" />
                ) : (
                  <Circle className="size-3 text-muted/60" />
                )}
                {check.label}
              </span>
            ))}
          </div>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Confirmacao de senha
          <Input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Repita sua senha"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            aria-invalid={Boolean(confirmation && password !== confirmation)}
            required
          />
          {confirmation && password !== confirmation ? (
            <span className="text-xs font-medium text-danger" aria-live="polite">
              As senhas ainda nao coincidem.
            </span>
          ) : null}
        </label>
        <AuthSubmitButton pendingLabel="Criando conta..." className="w-full">
          Criar conta
        </AuthSubmitButton>
      </form>
    </>
  );
}
