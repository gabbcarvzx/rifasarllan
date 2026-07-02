import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminPlatformSettings } from "@/app/actions/platform-settings";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { requireAdmin } from "@/lib/auth/require-admin";
import { LayoutDashboard, Settings, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [, settings] = await Promise.all([
    requireAdmin(),
    getAdminPlatformSettings(),
  ]);

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground lg:pb-0">
      <AdminSidebar
        platformName={settings.platform_name}
        logoUrl={settings.logo_url}
      />
      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="focus:outline-none lg:pl-72"
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
      <MobileBottomNav
        items={[
          { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { href: "/admin/rifas", label: "Rifas", icon: Ticket },
          {
            href: "/admin/configuracoes",
            label: "Ajustes",
            icon: Settings,
            accent: true,
          },
          { href: "/", label: "Site", icon: Ticket },
        ]}
      />
    </div>
  );
}
