import { Skeleton } from "@/components/ui";

export function ClientsFiltersSkeleton() {
  return (
    <div className="w-full flex flex-col gap-4 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full sm:w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
