import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/app/actions/account";
import { AccountLayout } from "@/components/account/account-layout";
import { ProfileCard } from "@/components/account/profile-card";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = {
  title: "Minha Conta",
};

export const dynamic = "force-dynamic";

export default async function MinhaContaPage() {
  const { data: profile } = await getMyProfile();

  if (!profile) {
    redirect("/login?error=Perfil%20nao%20encontrado.");
  }

  return (
    <AccountLayout
      profile={profile}
      title="Minha conta"
      description="Gerencie seus dados pessoais e acompanhe o nivel de acesso da sua conta."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <ProfileCard profile={profile} />
        <ProfileForm profile={profile} />
      </div>
    </AccountLayout>
  );
}
