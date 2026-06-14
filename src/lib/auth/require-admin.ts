import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";

export const requireAdmin = cache(async () => {
  const { user, profile } = await requireUser();

  if (profile?.role !== "admin") {
    redirect("/acesso-negado");
  }

  if (!profile.tenant_id) {
    redirect("/acesso-negado?reason=tenant-ausente");
  }

  if (profile.tenant?.status !== "active") {
    redirect("/acesso-negado?reason=tenant-inativo");
  }

  return { user, profile };
});
