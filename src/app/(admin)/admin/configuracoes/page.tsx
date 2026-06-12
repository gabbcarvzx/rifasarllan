import type { Metadata } from "next";
import { Globe2, Paintbrush, Save, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Configurações",
};

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configurações da plataforma"
        title="Preferencias editaveis"
        description="Tela base para identidade, regras comerciais e controles globais por tenant."
        actions={
          <Button type="button">
            <Save className="size-4" />
            Salvar configurações
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/12 text-accent">
              <Paintbrush className="size-4" />
            </div>
            <CardTitle>Identidade pública</CardTitle>
            <CardDescription>
              Marca, copy e informações exibidas na vitrine pública.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Nome da plataforma
              <Input defaultValue="Rifa Arllan" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Slogan
              <Input defaultValue="Rifas online premium" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Descrição institucional
              <Textarea defaultValue="Uma plataforma profissional para criar, divulgar e controlar rifas online com segurança." />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
              <Globe2 className="size-4" />
            </div>
            <CardTitle>Operacao comercial</CardTitle>
            <CardDescription>
              Parâmetros iniciais para plano, moeda e exibição pública.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Moeda
              <Select defaultValue="BRL">
                <option value="BRL">Real brasileiro</option>
                <option value="USD">Dolar americano</option>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Status do plano
              <Select defaultValue="trial">
                <option value="trial">Trial</option>
                <option value="active">Ativo</option>
                <option value="past_due">Vencido</option>
                <option value="blocked">Bloqueado</option>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              E-mail de suporte
              <Input defaultValue="suporte@rifaarllan.com" />
            </label>
          </CardContent>
        </Card>
      </div>

      <Card className="p-5">
        <ShieldCheck className="size-5 text-primary" />
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Controles obrigatorios antes de producao
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">
          Na evolução do produto, estas configurações devem ser persistidas por
          tenant, protegidas por RLS, auditadas por usuário e validadas contra o
          status do plano para evitar uso indevido da plataforma.
        </p>
      </Card>
    </div>
  );
}
