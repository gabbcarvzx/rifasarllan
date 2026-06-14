import { LoadingState } from "@/components/ui/loading-state";

export default function AppLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <LoadingState label="Carregando a plataforma..." />
    </div>
  );
}
