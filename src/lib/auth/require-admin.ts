import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";

export async function requireAdmin() {
  const { user, profile } = await requireUser();

  if (profile?.role !== "admin") {
    redirect("/acesso-negado");
  }

  return { user, profile };
}
