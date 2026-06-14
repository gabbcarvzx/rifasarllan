import type { ReactNode } from "react";
import { AccountSidebar } from "@/components/account/account-sidebar";
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
  return (
    <section className="bg-surface/30 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 border-b border-white/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Area do participante
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
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
    </section>
  );
}
