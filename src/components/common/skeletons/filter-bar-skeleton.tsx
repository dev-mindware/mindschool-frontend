import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface FilterBarSkeletonProps {
  filterCount?: number;
  hasSort?: boolean;
  searchable?: boolean;
  className?: string;
}

/**
 * Skeleton perfeitamente alinhado com a ListFilterBar do DataList:
 * - Em Mobile (<sm): Linha única com input de pesquisa + botão compacto «Filtros» (trigger do Bottom Sheet).
 * - Em Desktop (sm:): Input de pesquisa expansível + botões popover individuais de filtro e ordenação.
 */
export function FilterBarSkeleton({
  filterCount = 3,
  hasSort = true,
  searchable = true,
  className,
}: FilterBarSkeletonProps) {
  const hasSheetTrigger = filterCount > 0 || hasSort;

  return (
    <div className={cn("w-full flex flex-col gap-3 px-2 sm:px-0", className)}>
      {/* MOBILE VIEW: Pesquisa + Trigger do Bottom Sheet */}
      <div className="flex items-center gap-2 sm:hidden">
        {searchable && <Skeleton className="h-10 flex-1 rounded-xs" />}
        {hasSheetTrigger && (
          <Skeleton
            className={cn(
              "h-10 shrink-0 rounded-xs",
              searchable ? "w-24" : "w-full"
            )}
          />
        )}
      </div>

      {/* DESKTOP VIEW: Pesquisa + Popovers Inline */}
      <div className="hidden sm:flex sm:flex-row sm:flex-wrap sm:items-center gap-3">
        {searchable && (
          <div className="w-auto min-w-64 flex-1">
            <Skeleton className="h-10 w-full rounded-xs" />
          </div>
        )}

        {Array.from({ length: filterCount }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-xs" />
        ))}

        {hasSort && (
          <>
            <Skeleton className="h-10 w-28 rounded-xs" />
            <Skeleton className="h-10 w-24 rounded-xs" />
          </>
        )}
      </div>
    </div>
  );
}


