import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface FilterBarSkeletonProps {
  filterCount?: number;
  hasSort?: boolean;
  className?: string;
}

/**
 * Skeleton perfeitamente alinhado com a ListFilterBar do DataList:
 * Espelha o input de busca, botões popover de filtro e controlos de ordenação.
 */
export function FilterBarSkeleton({
  filterCount = 3,
  hasSort = true,
  className,
}: FilterBarSkeletonProps) {
  return (
    <div className={cn("w-full flex flex-col gap-4 px-2 sm:px-0", className)}>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search input skeleton */}
        <div className="col-span-2 w-full sm:w-auto sm:min-w-64 sm:flex-1">
          <Skeleton className="h-10 w-full rounded-xs" />
        </div>

        {/* Filter buttons skeletons */}
        {Array.from({ length: filterCount }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full sm:w-32 rounded-xs" />
        ))}

        {/* Sort skeletons */}
        {hasSort && (
          <>
            <Skeleton className="h-10 w-full sm:w-28 rounded-xs" />
            <Skeleton className="h-10 w-full sm:w-24 rounded-xs" />
          </>
        )}
      </div>
    </div>
  );
}

