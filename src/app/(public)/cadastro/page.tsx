import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
            <SignupForm error={params.error} success={params.success} />
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
