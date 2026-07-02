import { Skeleton } from "@/components/ui/skeleton";

export default function RaffleDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Skeleton className="aspect-[16/10] rounded-[var(--radius-lg)]" />
        <Skeleton className="h-[520px] rounded-[var(--radius-lg)]" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-44 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-44 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-44 rounded-[var(--radius-lg)]" />
      </div>
      <Skeleton className="mt-8 h-[680px] rounded-[var(--radius-lg)]" />
    </div>
  );
}
