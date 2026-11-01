import { Skeleton } from "@/components/ui/skeleton";
import { FilterBarSkeleton } from "./filter-bar-skeleton";
import { ListSkeleton } from "./list-skeleton";
import { cn } from "@/lib/utils";

export interface PageSkeletonProps {
  className?: string;
  hasFilters?: boolean;
  filterCount?: number;
  rows?: number;
  cols?: number;
}

/**
 * Skeleton completo de página para App Router (loading.tsx) ou páginas de consulta.
 * Espelha de forma exacta a estrutura de TitleList + ListFilterBar + GenericTable (Desktop e Mobile).
 */
export function PageSkeleton({
  className,
  hasFilters = true,
  filterCount = 3,
  rows = 6,
  cols = 5,
}: PageSkeletonProps) {
  return (
    <div className={cn("space-y-6 animate-in fade-in duration-200", className)}>
      {/* TitleList: Title + Subtitle + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-7 sm:h-8 w-52 max-w-full rounded-xs" />
          <Skeleton className="h-4 w-80 max-w-full rounded-xs" />
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Skeleton className="h-9 w-28 rounded-xs" />
        </div>
      </div>

      {/* Filter Bar (Mobile Bottom Sheet trigger + Desktop Inline Popovers) */}
      {hasFilters && <FilterBarSkeleton filterCount={filterCount} />}

      {/* Table (Desktop) / Card List (Mobile) + Pagination Footer */}
      <ListSkeleton rows={rows} cols={cols} />
    </div>
  );
}


