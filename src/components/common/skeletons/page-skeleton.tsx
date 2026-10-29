import { Skeleton } from "@/components/ui/skeleton";
import { FilterBarSkeleton } from "./filter-bar-skeleton";
import { ListSkeleton } from "./list-skeleton";
import { cn } from "@/lib/utils";

export interface PageSkeletonProps {
  className?: string;
  hasFilters?: boolean;
  rows?: number;
  cols?: number;
}

/**
 * Skeleton completo de página para App Router (loading.tsx) ou páginas de consulta.
 * Espelha perfeitamente a estrutura de PageWrapper + TitleList + ListFilterBar + GenericTable.
 */
export function PageSkeleton({
  className,
  hasFilters = true,
  rows = 6,
  cols = 5,
}: PageSkeletonProps) {
  return (
    <div className={cn("p-4 md:p-6 space-y-6 animate-in fade-in duration-200", className)}>
      {/* Page Header: Breadcrumb & Title + Actions */}
      <div className="space-y-4">
        {/* Breadcrumb */}
        <Skeleton className="h-4 w-40 rounded-xs" />

        {/* Title row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-52 rounded-xs" />
            <Skeleton className="h-4 w-80 max-w-full rounded-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-xs" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {hasFilters && <FilterBarSkeleton filterCount={3} />}

      {/* Table / Card List */}
      <ListSkeleton rows={rows} cols={cols} />
    </div>
  );
}

