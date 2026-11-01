import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DetailsSheetSkeletonProps {
  className?: string;
  rows?: number;
}

/**
 * Skeleton para painéis laterais (Sheets/Drawers) e modais de consulta de detalhes.
 * Evita layout shifts e substitui divs com pulses inline (Desktop e Mobile).
 */
export function DetailsSheetSkeleton({
  className,
  rows = 6,
}: DetailsSheetSkeletonProps) {
  return (
    <div className={cn("space-y-5 sm:space-y-6 p-4 sm:p-6 animate-in fade-in duration-200", className)}>
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-border/50">
        <Skeleton className="h-5 sm:h-6 w-48 max-w-full rounded-xs" />
        <Skeleton className="h-3.5 sm:h-4 w-72 max-w-full rounded-xs" />
      </div>

      {/* Profile/Identity block preview */}
      <div className="flex items-center gap-3.5 sm:gap-4 rounded-xs border border-border/60 bg-muted/20 p-3.5 sm:p-4">
        <Skeleton className="size-12 sm:size-14 rounded-full shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-4 sm:h-5 w-40 max-w-full rounded-xs" />
          <Skeleton className="h-3.5 w-56 max-w-full rounded-xs" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        <Skeleton className="h-8 w-24 rounded-xs shrink-0" />
        <Skeleton className="h-8 w-24 rounded-xs shrink-0" />
        <Skeleton className="h-8 w-24 rounded-xs shrink-0" />
      </div>

      {/* Details Key-Value List */}
      <div className="space-y-2.5 pt-1">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 py-2 border-b border-border/30 last:border-b-0"
          >
            <Skeleton className="h-3.5 w-28 rounded-xs" />
            <Skeleton className="h-4 w-44 max-w-full rounded-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}


