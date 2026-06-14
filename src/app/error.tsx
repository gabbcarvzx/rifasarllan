"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={TriangleAlert}
          title="Nao foi possivel carregar esta area"
          description="Ocorreu uma falha inesperada. Tente novamente; se persistir, envie o horario do erro ao suporte."
          action={
            <Button type="button" onClick={reset}>
              <RefreshCw className="size-4" />
              Tentar novamente
            </Button>
          }
        />
      </div>
    </main>
  );
}
