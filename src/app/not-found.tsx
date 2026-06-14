import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={SearchX}
          title="Pagina nao encontrada"
          description="O endereco pode estar incorreto, ter expirado ou pertencer a uma campanha que nao esta mais publica."
          action={
            <Link href="/" className={buttonVariants()}>
              <ArrowLeft className="size-4" />
              Voltar ao inicio
            </Link>
          }
        />
      </div>
    </main>
  );
}
