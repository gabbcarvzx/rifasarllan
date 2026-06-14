import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Pencil } from "lucide-react";
import { getAdminManualResults } from "@/app/actions/manual-results";
import { PageHeader } from "@/components/admin/page-header";
import { ManualResultPanel } from "@/components/admin/results/manual-result-panel";
import { AuthMessage } from "@/components/auth/auth-message";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resultado Manual",
};

type AdminResultadoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminResultadoPage({
  params,
}: AdminResultadoPageProps) {
  const { id } = await params;
  const result = await getAdminManualResults(id);

  if (!result.data && !result.error) notFound();

  if (!result.data) {
    return <AuthMessage error={result.error} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Transparencia da campanha"
        title={`Resultado: ${result.data.raffle.title}`}
        description="Registre o que ocorreu na live e publique somente depois de conferir premio, numero e participante."
        actions={
          <>
            <Link
              href="/admin/rifas"
              className={buttonVariants({ variant: "secondary" })}
            >
              <ArrowLeft className="size-4" />
              Rifas
            </Link>
            <Link
              href={`/admin/rifas/${id}/editar`}
              className={buttonVariants({ variant: "outline" })}
            >
              <Pencil className="size-4" />
              Editar rifa
            </Link>
            <Link
              href={`/rifas/${result.data.raffle.slug}/resultado`}
              className={buttonVariants({ variant: "outline" })}
            >
              <Eye className="size-4" />
              Pagina publica
            </Link>
          </>
        }
      />

      <ManualResultPanel data={result.data} />
    </div>
  );
}
