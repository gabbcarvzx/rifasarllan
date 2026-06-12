import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signUpWithEmail } from "@/app/actions/auth";
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
  title: "Cadastro",
};

type CadastroPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function CadastroPage({ searchParams }: CadastroPageProps) {
  const params = await searchParams;

  return (
    <section className="min-h-[calc(100vh-4.5rem)] bg-surface/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Nova conta
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
            Crie seu acesso
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            Cadastro real com Supabase Auth. O profile e criado pelo trigger do
            banco e ja nasce como cliente ate ser promovido a admin.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-lg border border-accent/25 bg-accent/12 text-accent">
              <UserPlus className="size-5" />
            </div>
            <CardTitle>Cadastro de usuario</CardTitle>
            <CardDescription>
              Prepare sua conta para acompanhar rifas e reservas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <AuthMessage error={params.error} success={params.success} />
            <form action={signUpWithEmail} className="space-y-4">
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
            <p className="text-center text-sm text-muted">
              Ja possui acesso?{" "}
              <Link
                href="/login"
                className="font-semibold text-accent hover:text-foreground"
              >
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
