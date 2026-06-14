import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const { user, profile } = await requireUser();

  if (profile?.role !== "admin") {
    redirect("/acesso-negado");
  }

  if (!profile.tenant_id) {
    redirect("/acesso-negado?reason=tenant-ausente");
  }

  const supabase = await createSupabaseServerClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("status")
    .eq("id", profile.tenant_id)
    .maybeSingle();

  if (tenant?.status !== "active") {
    redirect("/acesso-negado?reason=tenant-inativo");
  }

  return { user, profile };
}
