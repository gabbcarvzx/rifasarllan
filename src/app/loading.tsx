import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
