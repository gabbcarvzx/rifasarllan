import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import { signInWithEmail } from "@/app/actions/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Login",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <section className="min-h-[calc(100vh-4.5rem)] bg-surface/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Acesso seguro
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
            Entre na sua conta
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            Acesse seus pedidos, numeros reservados e resultados em um ambiente
            protegido.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <CardTitle>Acessar plataforma</CardTitle>
            <CardDescription>
              Informe o e-mail e a senha usados no cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <AuthMessage error={params.error} success={params.success} />
            <form action={signInWithEmail} className="space-y-4">
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
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  required
                />
              </label>
              <AuthSubmitButton pendingLabel="Entrando..." className="w-full">
                <Mail className="size-4" />
                Entrar
              </AuthSubmitButton>
            </form>
            <p className="text-center text-sm text-muted">
              Ainda nao tem conta?{" "}
              <Link
                href="/cadastro"
                className="font-semibold text-accent hover:text-foreground"
              >
                Criar cadastro
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
