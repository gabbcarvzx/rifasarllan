import type { ReactNode } from "react";
import { LayoutDashboard, ReceiptText, TicketCheck, UserRound } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatCard } from "@/components/ui/stat-card";
import type { MyProfile } from "@/types/account";

type AccountLayoutProps = {
  profile: MyProfile;
  title: string;
  description: string;
  children: ReactNode;
};

export function AccountLayout({
  profile,
  title,
  description,
  children,
}: AccountLayoutProps) {
  const quickStats = [
    {
      label: "Perfil",
      value: profile.role === "admin" ? "Admin + Cliente" : "Participante",
      hint: "Acesso atual da conta",
      icon: UserRound,
    },
    {
      label: "Contato",
      value: profile.email ? "Validado" : "Pendente",
      hint: profile.email ?? "Adicione um e-mail na sua conta",
      icon: ReceiptText,
    },
    {
      label: "Navegacao",
      value: profile.role === "admin" ? "Expandida" : "Padrao",
      hint: profile.role === "admin" ? "Painel admin liberado" : "Conta do participante",
      icon: profile.role === "admin" ? LayoutDashboard : TicketCheck,
    },
  ];

  return (
    <section className="bg-surface/30 px-4 py-8 pb-28 sm:px-6 sm:py-12 lg:px-8 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Area do participante"
          title={title}
          description={description}
          className="mb-7 border-b border-border/80 pb-6"
        />

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {quickStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              icon={stat.icon}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <AccountSidebar
            displayName={profile.full_name ?? profile.email ?? "Participante"}
            email={profile.email}
            isAdmin={profile.role === "admin"}
          />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <MobileBottomNav
        items={[
          { href: "/minha-conta", label: "Conta", icon: UserRound },
          { href: "/meus-pedidos", label: "Pedidos", icon: ReceiptText },
          { href: "/meus-numeros", label: "Numeros", icon: TicketCheck },
          {
            href: profile.role === "admin" ? "/admin" : "/rifas",
            label: profile.role === "admin" ? "Admin" : "Rifas",
            icon: profile.role === "admin" ? LayoutDashboard : TicketCheck,
            accent: profile.role === "admin",
          },
        ]}
      />
    </section>
  );
}
