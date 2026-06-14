import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Rocket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminDashboardStats } from "@/types/dashboard";
import type { ResolvedPlatformSettings } from "@/types/platform-settings";

type AdminOnboardingChecklistProps = {
  stats: AdminDashboardStats | null;
  settings: ResolvedPlatformSettings;
};

type OnboardingStep = {
  title: string;
  description: string;
  href: string;
  action: string;
  complete: boolean;
};

export function AdminOnboardingChecklist({
  stats,
  settings,
}: AdminOnboardingChecklistProps) {
  const raffles = stats?.raffles ?? [];
  const activeRaffle = raffles.find((raffle) => raffle.status === "active");
  const steps: OnboardingStep[] = [
    {
      title: "Configurar nome da plataforma",
      description: "Defina a identidade comercial exibida ao participante.",
      href: "/admin/configuracoes",
      action: "Abrir configuracoes",
      complete: Boolean(settings.id && settings.platform_name.trim()),
    },
    {
      title: "Enviar logo",
      description: "Aplique a marca no header, admin e experiencia publica.",
      href: "/admin/configuracoes",
      action: "Configurar branding",
      complete: Boolean(settings.logo_url),
    },
    {
      title: "Criar primeira rifa",
      description: "Cadastre a campanha, faixa de numeros e data prevista.",
      href: "/admin/rifas/nova",
      action: "Criar rifa",
      complete: Boolean(stats && stats.summary.total_raffles > 0),
    },
    {
      title: "Adicionar imagem",
      description: "Publique uma capa clara para apresentar a campanha.",
      href: activeRaffle
        ? `/admin/rifas/${activeRaffle.id}/editar`
        : "/admin/rifas",
      action: "Revisar imagens",
      complete: raffles.some(
        (raffle) => Boolean(raffle.main_image_url) || raffle.image_count > 0,
      ),
    },
    {
      title: "Adicionar premios",
      description: "Informe os itens entregues e a ordem de premiacao.",
      href: activeRaffle
        ? `/admin/rifas/${activeRaffle.id}/editar`
        : "/admin/rifas",
      action: "Gerenciar premios",
      complete: raffles.some((raffle) => raffle.prize_count > 0),
    },
    {
      title: "Publicar rifa",
      description: "Ative a campanha somente depois da revisao comercial.",
      href: "/admin/rifas",
      action: "Revisar status",
      complete: Boolean(stats && stats.summary.active_raffles > 0),
    },
    {
      title: "Testar reserva",
      description: "Use uma conta participante e valide a jornada completa.",
      href: activeRaffle ? `/rifas/${activeRaffle.slug}` : "/rifas",
      action: "Abrir experiencia publica",
      complete: Boolean(stats && stats.summary.total_orders > 0),
    },
    {
      title: "Divulgar link",
      description: "Copie ou compartilhe a campanha ativa com o publico.",
      href: activeRaffle ? `/rifas/${activeRaffle.slug}` : "/admin/rifas",
      action: activeRaffle ? "Abrir pagina comercial" : "Publicar uma rifa",
      complete: false,
    },
  ];
  const completed = steps.filter((step) => step.complete).length;
  const operationalSteps = steps.slice(0, -1);
  const operationReady = operationalSteps.every((step) => step.complete);
  const nextStep = steps.find((step) => !step.complete);

  return (
    <section aria-labelledby="admin-onboarding-title">
      <div className="flex flex-col gap-4 border-y border-white/10 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
            {operationReady ? (
              <Rocket className="size-4" />
            ) : (
              <ClipboardCheck className="size-4" />
            )}
          </div>
          <div>
            <Badge variant={operationReady ? "success" : "info"}>
              Onboarding do admin
            </Badge>
            <h2 id="admin-onboarding-title" className="mt-3 text-xl font-bold text-foreground">
              {operationReady
                ? "Operacao pronta para divulgacao"
                : "Prepare a primeira campanha"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              O progresso abaixo usa dados reais do tenant. A divulgacao final
              permanece uma confirmacao operacional do administrador.
            </p>
          </div>
        </div>
        <span className="shrink-0 font-mono text-sm font-bold text-foreground">
          {completed}/{steps.length}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.complete ? CheckCircle2 : Circle;

          return (
            <Link
              key={step.title}
              href={step.href}
              className={cn(
                "group flex min-h-40 flex-col rounded-lg border p-4 transition",
                step.complete
                  ? "border-primary/20 bg-primary/[0.06]"
                  : "border-white/10 bg-black/14 hover:border-accent/30 hover:bg-white/[0.04]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <Icon
                  className={cn(
                    "size-5 shrink-0",
                    step.complete ? "text-primary" : "text-muted",
                  )}
                />
                <ArrowUpRight className="size-4 text-muted transition group-hover:text-accent" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-muted">
                {step.description}
              </p>
              <span className="mt-auto pt-4 text-xs font-semibold text-primary">
                {step.complete ? "Concluido" : step.action}
              </span>
            </Link>
          );
        })}
      </div>

      {nextStep ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Proxima acao: <strong className="text-foreground">{nextStep.title}</strong>
          </p>
          <Link
            href={nextStep.href}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            {nextStep.action}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
